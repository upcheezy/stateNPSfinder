// 'use strict';

const apiKey = 'vf2dp08Nq3girvWkdZlVigvB8Vp5drhtGkRNZuO8';
const searchURL = 'https://developer.nps.gov/api/v1/parks';
const unSplashKey = '8utzXnHZVfh1iu-66JHxa7V6i9Z6pDofKYDeeAcCEFU'
const unSplashURL = 'https://api.unsplash.com/search/photos'


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
        } else if (responseJson.data[i].states.includes(',')) {
            continue
        }
        else {
            geoJsonMain.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(responseJson.data[i].latLong.match(/([^:]*)$/)[1]), parseFloat(responseJson.data[i].latLong.match(/:(.*),/)[1])]
                },
                "properties": {
                    "stateCode": responseJson.data[i].states,
                    "description": responseJson.data[i].description,
                    "fullName": responseJson.data[i].fullName,
                    "url": responseJson.data[i].url,
                    "weather": responseJson.data[i].weather
                }
            })
        }
    };
    
    addPoints(geoJsonMain);

};

let oldPoints = false;

function addPoints(geoJsonMain) {
    let pointData = L.geoJSON(geoJsonMain);
    pointData.addTo(map);
    map.fitBounds(pointData.getBounds());

    if(oldPoints){
      oldPoints.removeFrom(map);
    }
    oldPoints = pointData;

  pointData.on("click", function (event) {
      console.log(event.layer.feature.properties);        
      getUnsplashData(event.layer.feature.properties.fullName, event)  
    });
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



function getUnsplashData(query, event) {
    const params = {
        client_id: unSplashKey,
        query: query
    };
    const queryString = formatQueryParams(params)
    const url = unSplashURL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            $('#info-section').html(`
        <h4><a href="${event.layer.feature.properties.url}" target="_blank">${event.layer.feature.properties.fullName}</a></h4>
            <p>${event.layer.feature.properties.description}</p>
            <img src="${responseJson.results[0].urls.thumb}" alt="park image">
        `)
            // console.log(responseJson.results[0].urls.thumb);
        } )
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