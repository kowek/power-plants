// Geospatial Contest
// Created by Katarzyna Kowalik
// Krakow, 06/2019

//
//--- Part 1: adding base maps ---
//

//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [51.818,19.809],
	zoom: 6,
	zoomControl: false
});


//adding attribution for map
map.attributionControl.addAttribution("&copy Katarzyna Kowalik 2019");
map.attributionControl.addAttribution("Data from <a href=\"http://globalenergyobservatory.org/\">GEO</a>");
map.attributionControl.addAttribution('Icons designed by <a href="https://www.flaticon.com/authors/vectors-market">Vectors Market</a> via Flaticon');


//adding a base maps
var landscape = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=da0654cb94c64e4588b744d40b02b2dd', {
	attribution: 'Base map: <a href="http://www.thunderforest.com/">Thunderforest</a> & <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ctr'});

var pioneer = L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}', {
	attribution: 'Base map: <a href="http://www.thunderforest.com/">Thunderforest</a> & <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ctr',
	apikey: 'da0654cb94c64e4588b744d40b02b2dd',
	maxZoom: 22
});
pioneer.addTo(map);


//
//---- Part 2: Adding controls: scale bar & zoom control
//

//zoomHome plugin - controls default view button (cc: https://github.com/torfsen/leaflet.zoomhome)
var zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);

//scale
L.control.scale().addTo(map);


//
//---- Part 3: Adding point features ----
//


//marker constructors - each with different properties
var MyIcon = L.Icon.extend({
	options:{
		iconSize: [36, 36],
		iconAnchor: [18, 18],
		popupAnchor: [100, 0]
	}
});

var bigIcon = L.Icon.extend({
	options:{
		iconSize: [64, 64],
		iconAnchor: [32, 32],
		popupAnchor: [164, 248]
	}
});

//defining highlighting details/reseting functions for each point

function point_to_layer(feature, latlng){
	return L.marker(latlng, {icon: new MyIcon ({iconUrl: feature.properties.URL})})
	.on('mouseover', function(){
		this
		.setIcon(new bigIcon ({iconUrl: feature.properties.URL}) )
		})
	.on('mouseover', function(){
		//feature.geometry.coordinates = feature.geometry.coordinates.split(",")[1]+","+feature.geometry.coordinates.split(",")[0]
		info.update(feature)
	})
	.on('mouseout', function(){
		this.setIcon(new MyIcon ({iconUrl: feature.properties.URL}) )
		})
	.on('mouseout',function(){info.update()})
}


//Defining layers themselves

var baseLayers = [
	{
		name: "Landscape",
		layer: landscape
	},
	{
		name: "Pioneer",
		layer: pioneer
	}
]

var overLayers = [
	{			
		name: "Black coal",
		background: "css/images/black.svg",
		layer: L.geoJson(black, {pointToLayer: point_to_layer })
	},
	{
		name: "Lignite",
		background: "css/images/lignite.svg",
		layer: L.geoJson(lignite, {pointToLayer: point_to_layer })
	},
	{
		name: "Water",
		background: "css/images/hydro.svg",
		layer: L.geoJson(hydro, {pointToLayer: point_to_layer })
	},
	{
		name: "Gas",
		background: "css/images/gas.svg",
		layer: L.geoJson(gas, {pointToLayer: point_to_layer })
	},
	{
		name: "Wind",
		background: "css/images/wind.svg",
		layer: L.geoJson(wind, {pointToLayer: point_to_layer })
	}
]

var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers,
	
	//options - addin icon to the legend control panel
	{
	buildItem: function(item) {
		//var points = item.layer.getLayers ? item.layer.getLayers().length : 0,
		//	label = points ? '('+points+')' : '',
		node = L.DomUtil.create('span','');
		//node.innerHTML = label;
		//if(points)
		node.style.fontSize = "35px";
		if(item.background) {
			node.style.background = "url('"+item.background+"') center center no-repeat";
			node.style.paddingLeft = '40px';
			//node.style.paddingRight = '40px';
		}
		return node;
	},

	collapsed: true


	} );

map.addControl(panelLayers);

//---- Part 4: adding additional controls for detailed info

	var info = L.control();

	info.setPosition('topleft');

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (plant_no) {	
		this._div.innerHTML = (plant_no ? '<div class = "container">' +
	'<table class="table">'+
	'<tr><th colspan=2 class="plantbold '+plant_no.properties.Type+'">' + plant_no.properties.Note.split("Power")[0] + '</th></tr>'+
	'<tr><td colspan=2><img src="https://dev.virtualearth.net/REST/V1/Imagery/Map/Aerial/'+plant_no.geometry.coordinates[1]+","+plant_no.geometry.coordinates[0]+'/16?mapSize=300,250&format=png&key=Auvezxv8K5OKvCG99zMk_Jkp3kFB4xJ18POHWExOTCw1CwuBtplvoooMfrqZquwa"></td></tr>'+
	'<tr><td>Capacity: </td><td>'+plant_no.properties.Capacity+' MWe</td></tr>'+
	'<tr><td>Commision date: </td><td>'+plant_no.properties.Year+'</td></tr>'+
	'<tr><td>No of units: </td><td>'+plant_no.properties.Units+'</td></tr>'+
	'<tr><td>Coordinates: </td><td>'+plant_no.geometry.coordinates[1]+","+plant_no.geometry.coordinates[0]+'</td></tr>'+
	'</table></div>':
	'<div class = "container"><span class="newbold">Power Plants in Poland</span><br><br><i>Choose primary fuel from the legend <br> & hover over the symbol for details</i></div>');
	};

	info.addTo(map);


   