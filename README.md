# NBC OTS Leaflet Map Tool
This is a node.js project for a graphic with a Leaflet map used on our sites. It features live editing capability via Google Sheets (with Sheetsy), and webpack's hot reload functionality for development.
## Requirements
Node.js should be installed on your machine.
## To make any changes to the graphic
Clone the repo onto your machine.
```
git clone https://github.com/swhart22/contaminants.git 
```
## Development
```
cd contaminants
```
Then:
```
npm run start
```
If all went well, your browser should open up a tab on localhost:3000 with the development version of your map.

If you get errors: 

Try running `npm i` in the root directory. This will ensure all node dependencies are installed.

Make sure nothing else is running on port 3000.

## File system

All the code for the graphic is in ./src/js/draw.js in the draw function. If you make changes while the server is running, it will update live without you having to refresh. 

## Production

Once you've made sure the graphic looks like it's supposed to, run:
```
npm run build
```
Open the root folder of your directory, and you'll now see a 'dist' folder. The files inside are the ones you need to push to the server. Webpack has bundled everything into minimally-sized files to make you and everyone's browsers' lives easier!

Test the `index.html` file in your browser just to make sure everything worked, and then push to the server. 