//import _ from 'lodash';
import '../css/nbcotsbase.css';
import colors from './colors.js';

const L = require("leaflet");
const d3 = Object.assign({}, require('d3-collection'), require('d3-array'), require('d3-selection'), require('d3-format'), require('d3-shape'), require('d3-scale'), require('d3-request'));
//const d3 = require('d3');

import Sites from '../../data/sites_corrected.csv';

function draw(data){
	console.log(data);

	Sites.forEach(d => {
		d['for-pie'] = [];

		var other = (1 - d['asian_prop'] - d['black_prop'] - d['white_prop'] - d['hisp_prop']);

		if (other >= 0){
			d['other_prop'] = other;
		} else {
			d['other_prop'] = 0;
		}

		d['for-pie'].push({'race':'Asian', 'pop':d['asian_prop']});
		d['for-pie'].push({'race':'Black', 'pop':d['black_prop']});
		d['for-pie'].push({'race':'White', 'pop':d['white_prop']});
		d['for-pie'].push({'race':'Hispanic', 'pop':d['hisp_prop']});
		d['for-pie'].push({'race':'Other', 'pop': d['other_prop']});
	});

	var scoreScale = d3.scaleLinear()
		.domain(d3.extent(Sites.filter(d => {return !isNaN(d['EPA_Hazard_Risk_Score'])}), d => {return d['EPA_Hazard_Risk_Score']}))
		.range([colors['yellow']['003'], colors['green']['002']]);
	
	console.log(Sites);
	var zipinput = document.querySelector("#zip-input");
	var warning = document.querySelector('#warning');
	warning.style.display = 'none';

	zipinput.onchange = zoom;

	var container = document.querySelector('#container'); 
	var mapcont = document.createElement('div');
	mapcont.id = 'mapcont';
	container.append(mapcont);

	var reallegend = document.createElement('div');
	reallegend.id = 'reallegend';

	var width = parseInt(container.style.width),
		height = parseInt(container.style.height);

	var defaultView = [37.8, -96];

	var map = L.map('mapcont', {
				minZoom:4
			}).setView(defaultView, 12);

	d3.json('https://freegeoip.net/json/', (error, res) => {
		if (error) {
			console.log('user location not found');
			map.setView(defaultView, 12);
		}
		else {
			var usrView = [res['latitude'], res['longitude']];
			map.setView(usrView, 12);
		}
	});

	L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);

	map.scrollWheelZoom.disable();

	var tooltip = document.createElement('div');
	var tipPane = map.getPanes().tooltipPane;
	tooltip.classList.add('tooltip');
	tooltip.id = 'tooltip';
	//construct tooltip
	tooltip.innerHTML += '<p id="facility-title"></p>';
	tooltip.innerHTML += '<div id="facility-epa-blk"><p><span id="facility-score"></span></p></div>';
	tooltip.innerHTML += '<p class="facility-type">Site type: <span id="facility-type-hook"></span></p>';
	tooltip.innerHTML += '<p class="facility-floodplain">Floodplain: <span id="facility-floodplain-hook"></span></p>';
	tooltip.innerHTML += '<p class="facility-sea-level-rise">Sea level rise: <span id="facility-sea-level-rise-hook"></span></p>';
	tooltip.innerHTML += '<p class="facility-demographics">Demographics within a 1-mi radius:</p>'
	tooltip.innerHTML += '<div id="flex"><div><svg id="mini-chart"></svg></div><div id="legend"></div></div>';
	tooltip.innerHTML += '<p id="explanation">A score (between 1 and 100, shown in the top right) is assigned to a site by the EPA reflecting relative risks to public health and the environment. A higher score means higher risk.</p>';

	container.append(tooltip);
	container.append(reallegend);

	//legend stuff bleghghgh

	var legendsvg = d3.select('#reallegend').append('svg')
		.attr('id', 'legend-svg')
		.attr('width',300)
		.attr('height', 120);

	legendsvg.append('circle')
		.attr('cx', 58)
		.attr('cy', 58)
		.attr('r', 56)
		.style('opacity',0.2)
		.attr('fill', scoreScale(56))
		.attr('stroke',scoreScale(56));

	legendsvg.append('circle')
		.attr('cx', 58)
		.attr('cy', 58)
		.attr('r', 4)
		.style('opacity',1)
		.attr('fill', scoreScale(56))
		.attr('stroke',scoreScale(56));

	legendsvg.append('text').attr('class','leg-explainer').attr('x',118).attr('y', 10)
		.text('Facility location');

	legendsvg.append('text').attr('class','leg-explainer').attr('x',130).attr('y',34)
		.text('1-mi radius from facility');

	legendsvg.append('path').attr('d',d3.line()([[58, 58], [58, 10], [115, 10]])).attr('stroke',scoreScale(56))
		.style('stroke-width', 1)
		.style('fill','none');

	legendsvg.append('path').attr('d',d3.line()([[109, 34], [128, 34]])).attr('stroke',scoreScale(56))
		.style('stroke-width', 1)
		.style('fill','none');

	var defs = legendsvg.append('defs');

	var lingrad = defs.append('linearGradient').attr('id','grad1').attr('x1', '0%').attr('x2','100%').attr('y1','0%').attr('y2','0%');

	lingrad.append('stop').attr('offset','0%').style('stop-color',scoreScale.range()[0]);

	lingrad.append('stop').attr('offset','100%').style('stop-color',scoreScale.range()[1]);

	legendsvg.append('rect').attr('width',114).attr('height',10).attr('x',120).attr('y', 70)
		.attr('fill',"url(#grad1)").style('opacity', 0.7);

	legendsvg.append('text')
		.attr("x", 120)
		.attr('y', 58)
		.attr('class','rect-label')
		.text('Lower hazard');

	legendsvg.append('text')
		.attr("x", 114 +120)
		.attr('y', 94)
		.attr('class','rect-label')
		.style('text-anchor','end')
		.text('Higher hazard');

	//tooltip stuff
	var tipwidth = 150;

	var radius = 150 / 2;
	var minichartheight = 150;

	var minichart = d3.select('#mini-chart')
		.attr('width',tipwidth)
		.attr('height', minichartheight);

	var g = minichart.append('g')
		.attr('transform', 'translate(' + tipwidth / 2 + ',' + minichartheight / 2 + ')');

	var colorscale = [colors['red']['004'], colors['blue']['004'], colors['yellow']['004'], colors['purple']['004'], colors['black']['005']];

	var color = d3.scaleOrdinal(colorscale);

	var pie = d3.pie()
		.sort(null)
		.value(d => {return d['pop']});

	var path = d3.arc()
		.outerRadius(radius - 10)
		.innerRadius(40);

	g.append('text')
		.attr('id','total-pop')
		.attr('transform','translate(0, -10)')
		.text('Total pop.');

	g.append('text')
		.attr('id','facility-radius-pop-hook')
		.attr('transform','translate(0, 7)')
		.text('');

	d3.select('#legend')
		.html('<span style="color:'+colorscale[0]+'">■</span> Asian <span id="as-pop-hook"></span><br>' + 
			'<span style="color:'+colorscale[1]+'">■</span> Black <span id="bl-pop-hook"></span><br>' + 
			'<span style="color:'+colorscale[2]+'">■</span> White <span id="wh-pop-hook"></span><br>' + 
			'<span style="color:'+colorscale[3]+'">■</span> Hispanic <span id="hi-pop-hook"></span><br>' +
			'<span style="color:'+colorscale[4]+'">■</span> Other <span id="ot-pop-hook"></span>');

	//add points to map

	Sites.forEach(s => {
		
		if (s.latitude && s.longitude){

			function siteColor(){return scoreScale(s['EPA_Hazard_Risk_Score'])};
			
			L.circle([s.latitude, s.longitude], {
				radius:1609.34, 
				fillColor: siteColor(s),
				fillOpacity: .2,
				stroke: false,
				className: 'mile-radius'

			}).addTo(map)
			.on('click', () => {
				circClick(s)
			});

			L.circleMarker([s.latitude, s.longitude], {
				radius:4, 
				fillColor: siteColor(s),
				fillOpacity: 1,
				stroke: false,
				color: colors['blue']['004']
			}).addTo(map)
			.on('click', () => {circClick(s)});

		}
	});

	function circClick(s){
		g.selectAll('.arc').remove();
		var zoomTo = [+s['latitude'], +s['longitude']];
		map.flyTo(zoomTo, 12);

		tooltip.style.display = 'block';

		d3.select("#facility-title")
			.text(s['Site_Name']);

		d3.select("#facility-score")
			.style('background-color',() => {return scoreScale(s['EPA_Hazard_Risk_Score'])})
			.text(s['EPA_Hazard_Risk_Score']);

		d3.select("#facility-type-hook")
			.text(s['Site_Type']);

		d3.select('#facility-floodplain-hook')
			.attr('class', () => {
				if (s['Floodplain'] == '100 year zone'){
					return 'hundred-year';
				} else if (s['Floodplain'] == '500 year zone'){
					return 'five-hundred-year';
				}
			})
			.text(s['Floodplain']);

		d3.select("#facility-sea-level-rise-hook")
			.attr('class', () => {
				if (s['Sea_Level_Rise'] != 'Not in sea level rise area'){
					return 'sea-rise';
				}
			})
			.text(s['Sea_Level_Rise']);

		d3.select("#facility-radius-pop-hook")
			.text(d3.format(',')(s['total_population']));

		var arc = g.selectAll('.arc')
			.data(pie(s['for-pie']))
			.enter()
			.append('g')
			.attr('class','arc');

		arc.append('path')
			.attr('d',path)
			.attr('fill',d => {return color(d.data.race)});

		d3.select("#as-pop-hook")
			.text(() => {return '(' + Math.round(s['asian_prop'] * 100) + '%)'});

		d3.select("#bl-pop-hook")
			.text(() => {return '(' + Math.round(s['black_prop'] * 100) + '%)'});

		d3.select("#wh-pop-hook")
			.text(() => {return '(' + Math.round(s['white_prop'] * 100) + '%)'});

		d3.select("#hi-pop-hook")
			.text(() => {return '(' + Math.round(s['hisp_prop'] * 100) + '%)'});

		d3.select("#ot-pop-hook")
			.text(() => {return '(' + Math.round(s['other_prop'] * 100) + '%)'});	

		//xtalk.signalIframe();
	};

	function zoom(){
		var val = document.querySelector('#zip-input').value;
		var item;

		d3.json('https://nominatim.openstreetmap.org/search.php?q=' + val + '&format=json', (error, res)=> {
			if (error) throw error;
			item = res[0];
			console.log(item);

			if (item != undefined){
				var zoomTo = [+item['lat'], +item['lon']];
				map.flyTo(zoomTo, 12);
				warning.style.display = 'none';

			}
			else{
				warning.style.display = 'block';
			}
			
		});

		var newBounds = map.getBounds();
		//console.log(newBounds);
	};
	//xtalk.signalIframe();	
};

export default draw;
