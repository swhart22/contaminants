import sheetsy from 'sheetsy';
const {urlToKey, getWorkbook, getSheet } = sheetsy;
import draw from './draw.js';
//import polls from './polls.js';

var data = [
	{'name':'Hello'},
	{'name':'World'}
]

/*****************************
SPREADSHEET CODE USING SHEETSY
*****************************/
//change this to the appropriate spreadsheet url

//const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1R8A_X3mQl872Cwroc947SAtFyw7xyqW3m_BJNU3sLjM/edit#gid=0";

//const key = urlToKey(SPREADSHEET_URL);

/*const metadata = {
	key: key
};*/

//grabs the data, then draws the chart, then draws the polls

/*getSheet(metadata['key'], 'od6').then((stuff) => {
	console.log(stuff);
	var data = [];
	
	stuff.rows.forEach((d, i) => {
		var o = {};
		o['col1'] = d['col1'];
		o['col2'] = d['col2'];
		//and so on
		
		data.push(o);
	});
	
	return data;

}).then((data) => {
	//once data is loaded, execute draw and polls functions
	//from ./draw.js
	draw(data);

	//from ./polls.js
	polls(data);
});*/

draw(data)
//export default metadata;