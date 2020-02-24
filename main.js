// 'use strict';

const apiKey = 'vf2dp08Nq3girvWkdZlVigvB8Vp5drhtGkRNZuO8';
const searchURL = 'https://developer.nps.gov/api/v1/parks';
const unSplashKey = 'AIzaSyCQO7mooYBV_h0MafwxwfwjonjAzymM5Ws'
const unSplashURL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
const proxyurl = "https://cors-anywhere.herokuapp.com/"
const photourl = 'https://maps.googleapis.com/maps/api/place/photo'


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
        } else {
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
    map.fitBounds(pointData.getBounds(), {padding: [100,100]});

    if (oldPoints) {
        oldPoints.removeFrom(map);
    }
    oldPoints = pointData;

    pointData.on("click", function (event) {
        console.log(event.layer.feature.properties);
        getGooglePhotoRef(event.layer.feature.properties.fullName, event)
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

function getGooglePhotoRef(query, event) {
    const params = {
        key: unSplashKey,
        input: query,
        inputtype: 'textquery',
        fields: 'photos'
    };
    const queryString = formatQueryParams(params)
    const url = unSplashURL + '?' + queryString;

    console.log(url);

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log('inside');
            console.log(responseJson.candidates[0].photos[0].photo_reference);
            getGooglePhoto(responseJson.candidates[0].photos[0].photo_reference, event);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function toggleClass() {
    $('.fa-arrow-up').on('click', function(event) {
        // alert('arrow clicked');
        $('.info-section').toggleClass('hidden');
    })
}

function getGooglePhoto(photo, event) {
    const params = {
        key: unSplashKey,
        photoreference: photo,
        maxwidth: 400
    };
    const queryString = formatQueryParams(params)
    const url = photourl + '?' + queryString;

    console.log(url);

    $('.info-section').html(`
    <h4><a href="${event.layer.feature.properties.url}" target="_blank">${event.layer.feature.properties.fullName}</a></h4>
        <p>${event.layer.feature.properties.description}</p>
        <img src="${url}" alt="park image">
    `)

    // fetch(proxyurl + url)
    //     .then(response => {
    //         if (response.ok) {
    //             return response.json();
    //         }
    //         throw new Error(response.statusText);
    //     })
    //     .then(responseJson => {
    //         $('#info-section').html(`
    //     <h4><a href="${event.layer.feature.properties.url}" target="_blank">${event.layer.feature.properties.fullName}</a></h4>
    //         <p>${event.layer.feature.properties.description}</p>
    //         <img src="${responseJson.url}" alt="park image">
    //     `)
    //         // console.log(responseJson.results[0].urls.thumb);
    //     } )
    //     .catch(err => {
    //         $('#js-error-message').text(`Something went wrong: ${err.message}`);
    //     });
}



function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        if ($('#js-search-term').val().toLowerCase() === 'south carolina') {
            const searchTerm = 'SC';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'alabama') {
            const searchTerm = 'AL';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'alaska') {
            const searchTerm = 'AK';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'arizona') {
            const searchTerm = 'AZ';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'arkansas') {
            const searchTerm = 'AR';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'california') {
            const searchTerm = 'CA';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'colorado') {
            const searchTerm = 'CO';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'connecticut') {
            const searchTerm = 'AZ';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'delaware') {
            const searchTerm = 'DE';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'florida') {
            const searchTerm = 'FL';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'georgia') {
            const searchTerm = 'ga';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'hawaii') {
            const searchTerm = 'hi';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'idaho') {
            const searchTerm = 'id';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'illinois') {
            const searchTerm = 'il';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'indiana') {
            const searchTerm = 'in';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'iowa') {
            const searchTerm = 'ia';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'kansas') {
            const searchTerm = 'ks';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'kentucky') {
            const searchTerm = 'ky';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'louisiana') {
            const searchTerm = 'la';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'maine') {
            const searchTerm = 'me';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'maryland') {
            const searchTerm = 'md';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'massachusetts') {
            const searchTerm = 'ma';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'michigan') {
            const searchTerm = 'mi';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'minnesota') {
            const searchTerm = 'mn';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'mississippi') {
            const searchTerm = 'ms';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'missouri') {
            const searchTerm = 'mo';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'montana') {
            const searchTerm = 'mt';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'nebraska') {
            const searchTerm = 'ne';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'nevada') {
            const searchTerm = 'nv';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'new hampshire') {
            const searchTerm = 'nh';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'new jersey') {
            const searchTerm = 'nj';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'new mexico') {
            const searchTerm = 'nm';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'new york') {
            const searchTerm = 'ny';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'north carolina') {
            const searchTerm = 'nc';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'north dakota') {
            const searchTerm = 'nd';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'ohio') {
            const searchTerm = 'oh';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'oklahoma') {
            const searchTerm = 'ok';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'oregon') {
            const searchTerm = 'or';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'pennsylvania') {
            const searchTerm = 'pa';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'rhode island') {
            const searchTerm = 'ri';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'south dakota') {
            const searchTerm = 'sd';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'tennessee') {
            const searchTerm = 'tn';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'texas') {
            const searchTerm = 'tx';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'utah') {
            const searchTerm = 'ut';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'vermont') {
            const searchTerm = 'vt';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'virginia') {
            const searchTerm = 'va';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'washington') {
            const searchTerm = 'wa';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'west virginia') {
            const searchTerm = 'wv';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'wisconsin') {
            const searchTerm = 'wi';
            getNPSdata(searchTerm);
        } else if ($('#js-search-term').val().toLowerCase() === 'wyoming') {
            const searchTerm = 'wy';
            getNPSdata(searchTerm);
        } else {
            const searchTerm = $('#js-search-term').val();
            getNPSdata(searchTerm);
        }
    });
}

$(watchForm());
$(toggleClass());


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
var basemap_url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
// Get basemap attributes from Leaflet Providers
var basemap_attributes = {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
};
// requests some map tiles
var tiles = L.tileLayer(basemap_url, basemap_attributes);
map.addLayer(tiles);