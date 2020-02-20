// 'use strict';

// put your own value below!
const apiKey = 'vf2dp08Nq3girvWkdZlVigvB8Vp5drhtGkRNZuO8';
const searchURL = 'https://developer.nps.gov/api/v1/parks';


function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function createGeoJson(responseJson) {
    const geoJsonMain = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    }

    for (let i = 0; i < responseJson.data.length; i++) {
        // console.log(responseJson.data[i]);
        // console.log('long ' + responseJson.data[i].latLong.match(/([^:]*)$/)[1]);
        if (responseJson.data[i].latLong === '') {
            continue
        } else {
            geoJsonMain.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(responseJson.data[i].latLong.match(/([^:]*)$/)[1]), parseFloat(responseJson.data[i].latLong.match(/:(.*),/)[1])]
                },
                "properties": {
                    "stateCode": responseJson.data[i].states,
                    "description": responseJson.data[i].description
                }
            })
        }
    };
    
    addPoints(geoJsonMain, responseJson);

};

function addPoints(geoJsonMain, responseJson) {
    console.log(geoJsonMain);
    
    let pointData = L.geoJSON(geoJsonMain);
    for (let j = 0; j < responseJson.data.length; j++) {
        for (let i = 0; i < geoJsonMain.features.length; i++) {
            console.log('main ' + geoJsonMain.features[i].properties.stateCode);
            if (geoJsonMain.features[i].properties.stateCode != responseJson.data[j].states) {
                // pointData.clearLayers();
                console.log(geoJsonMain.features[i].properties.stateCode, ' ', responseJson.data[j].states)
            } else {
                pointData.addTo(map);
                map.fitBounds(pointData.getBounds());
            }
        }
    }

}


function getNPSdata(query) {
    const params = {
        api_key: apiKey,
        stateCode: query
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => createGeoJson(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}



function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        getNPSdata(searchTerm);
    });
}

$(watchForm);


/////////////////////leaflet//////////////////////
/////////////////////////////////////////////////

var options = {
    center: [33.83333333, -80.86666667],
    zoom: 7,
    zoomSnap: .1,
    zoomControl: false
};

var map = L.map('map', options);
// Get basemap URL from Leaflet Providers
var basemap_url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
// Get basemap attributes from Leaflet Providers
var basemap_attributes = {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
};
// requests some map tiles
var tiles = L.tileLayer(basemap_url, basemap_attributes);
map.addLayer(tiles);