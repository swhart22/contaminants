# NBC OTS Leaflet Map Tool
This is a node.js project for a graphic with a Leaflet map used on our sites. It features live editing capability via Google Sheets (with Sheetsy), and webpack's hot reload functionality for development.
## Requirements
Before you get started, you should have the latest version of Node installed on your machine. That should be it, but if you run into any weird errors just let me know. 
## Development
Navigate to the empty directory you've created for your project. Then run: 
```
curl -fsSL https://github.com/swhart22/nbcots-leaflet-gfx/archive/master.tar.gz | tar -xz --strip-components=1
```
Then:
```
npm i
```
Then:
```
npm run start
```
If all went well, your browser should open up a tab on localhost:3000 with the development version of your map.

The project comes with d3 installed, so you will be able to add an svg layer using d3 on top of the leaflet tile. See how <a href="https://gist.github.com/Sumbera/7e8e57368175a1433791" target="_blank">here</a>. You can also just use leaflet's built in tooltips and markers.  

## Production

Once you've made sure the graphic looks like it's supposed to, run:
```
npm run build
```
Open the root folder of your directory, and you'll now see a 'dist' folder. The files inside are the ones you need to push to the server. Webpack has bundled everything into minimally-sized files to make you and everyone's browsers' lives easier!

Test the `index.html` file in your browser just to make sure everything worked, and then push to the server. 