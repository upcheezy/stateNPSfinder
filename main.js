// 'use strict';

const apiKey = config.apiKey;
const searchURL = 'https://developer.nps.gov/api/v1/parks';
const unSplashKey = config.unSplashKey
const unSplashURL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
const proxyurl = "https://cors-anywhere.herokuapp.com/"
const photourl = 'https://maps.googleapis.com/maps/api/place/photo'


function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// build geojson from nps api call 
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

    // build GeoJSON
    for (let i = 0; i < responseJson.data.length; i++) {
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
                    "weather": responseJson.data[i].weatherInfo,
                    "directions": responseJson.data[i].directionsInfo
                }
            })
        }
    };

    addPoints(geoJsonMain);

};

let oldPoints = false;

// add the point to the map
function addPoints(geoJsonMain) {
    let pointData = L.geoJSON(geoJsonMain);
    pointData.addTo(map);
    map.fitBounds(pointData.getBounds(), {
        padding: [100, 100]
    });

    if (oldPoints) {
        oldPoints.removeFrom(map);
    }
    oldPoints = pointData;

    pointData.on("click", function (event) {
        getGooglePhotoRef(event.layer.feature.properties.fullName, event);
        $('.info-section').removeClass('hidden');
        $('.fa-arrow-down').removeClass('hidden');
        // $('.fa-arrow-up').removeClass('hidden');
    });
}

// NPS API call 
function getNPSdata(query) {
    const params = {
        api_key: apiKey,
        stateCode: query
    };
    const queryString = formatQueryParams(params);
    const url = searchURL + '?' + queryString;

    showSpinner();
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            hideSpinner()
            createGeoJson(responseJson)
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

// get the google photo reference 
function getGooglePhotoRef(query, event) {
    const params = {
        key: unSplashKey,
        input: query,
        inputtype: 'textquery',
        fields: 'photos'
    };
    const queryString = formatQueryParams(params);
    const url = unSplashURL + '?' + queryString;

    showSpinner();
    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            hideSpinner()
            getGooglePhoto(responseJson.candidates[0].photos[0].photo_reference, event);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function toggleClass() {
    $('.fa-arrow-down').on('click', function (event) {
        $('.info-section').toggleClass('hidden');
        $(this).toggleClass('fa-arrow-down fa-arrow-up')
    })
}

// get the google photo from the reference 
function getGooglePhoto(photo, event) {
    const params = {
        key: unSplashKey,
        photoreference: photo,
        maxwidth: 400
    };
    const queryString = formatQueryParams(params)
    const url = photourl + '?' + queryString;

    $('.info-section').html(`
    <div id='place-title'><h4><a href="${event.layer.feature.properties.url}" target="_blank">${event.layer.feature.properties.fullName}</a></h4></div>
    <div id='place-content'>
        <img src="${url}" alt="park image">
        <br>
        <br>
        <h5 class='directions-title title'>Description</h5>
        <p>${event.layer.feature.properties.description}</p>
        <h5 class='directions-title title'>Directions</h5>
        <p class='directions-title'>${event.layer.feature.properties.directions}</p>
        <h5 class='weather-title title'>Weather Information</h5>
        <p class='weather-title'>${event.layer.feature.properties.weather}</p>
    </div>
    `)
}

function showSpinner() {
    $('#spinner').css('visibility', 'visible');
}

function hideSpinner() {
    $('#spinner').css('visibility', 'hidden');
}

function initialWatch() {
    
}

// watch for user to submit and account for different spellings 
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        $('.badValue').remove();
        if ($('#js-search-term').val().toLowerCase() === 'south carolina' || $('#js-search-term').val().toLowerCase() === 'sc') {
            const searchTerm = 'SC';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'alabama' || $('#js-search-term').val().toLowerCase() === 'al') {
            const searchTerm = 'AL';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'alaska' || $('#js-search-term').val().toLowerCase() === 'ak') {
            const searchTerm = 'AK';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'arizona' || $('#js-search-term').val().toLowerCase() === 'az') {
            const searchTerm = 'AZ';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'arkansas' || $('#js-search-term').val().toLowerCase() === 'ar') {
            const searchTerm = 'AR';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'california' || $('#js-search-term').val().toLowerCase() === 'ca') {
            const searchTerm = 'CA';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'colorado' || $('#js-search-term').val().toLowerCase() === 'co') {
            const searchTerm = 'CO';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'connecticut' || $('#js-search-term').val().toLowerCase() === 'ct') {
            const searchTerm = 'AZ';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'delaware' || $('#js-search-term').val().toLowerCase() === 'de') {
            const searchTerm = 'DE';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'florida' || $('#js-search-term').val().toLowerCase() === 'fl') {
            const searchTerm = 'FL';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'georgia' || $('#js-search-term').val().toLowerCase() === 'ga') {
            const searchTerm = 'ga';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'hawaii' || $('#js-search-term').val().toLowerCase() === 'hi') {
            const searchTerm = 'hi';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'idaho' || $('#js-search-term').val().toLowerCase() === 'id') {
            const searchTerm = 'id';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'illinois' || $('#js-search-term').val().toLowerCase() === 'il') {
            const searchTerm = 'il';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'indiana' || $('#js-search-term').val().toLowerCase() === 'in') {
            const searchTerm = 'in';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'iowa' || $('#js-search-term').val().toLowerCase() === 'ia') {
            const searchTerm = 'ia';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'kansas' || $('#js-search-term').val().toLowerCase() === 'ks') {
            const searchTerm = 'ks';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'kentucky' || $('#js-search-term').val().toLowerCase() === 'ky') {
            const searchTerm = 'ky';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'louisiana' || $('#js-search-term').val().toLowerCase() === 'la') {
            const searchTerm = 'la';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'maine' || $('#js-search-term').val().toLowerCase() === 'me') {
            const searchTerm = 'me';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'maryland' || $('#js-search-term').val().toLowerCase() === 'md') {
            const searchTerm = 'md';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'massachusetts' || $('#js-search-term').val().toLowerCase() === 'ma') {
            const searchTerm = 'ma';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'michigan' || $('#js-search-term').val().toLowerCase() === 'mi') {
            const searchTerm = 'mi';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'minnesota' || $('#js-search-term').val().toLowerCase() === 'mn') {
            const searchTerm = 'mn';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'mississippi' || $('#js-search-term').val().toLowerCase() === 'ms') {
            const searchTerm = 'ms';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'missouri' || $('#js-search-term').val().toLowerCase() === 'mo') {
            const searchTerm = 'mo';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'montana' || $('#js-search-term').val().toLowerCase() === 'mt') {
            const searchTerm = 'mt';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'nebraska' || $('#js-search-term').val().toLowerCase() === 'ne') {
            const searchTerm = 'ne';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'nevada' || $('#js-search-term').val().toLowerCase() === 'nv') {
            const searchTerm = 'nv';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'new hampshire' || $('#js-search-term').val().toLowerCase() === 'nh') {
            const searchTerm = 'nh';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'new jersey' || $('#js-search-term').val().toLowerCase() === 'nj') {
            const searchTerm = 'nj';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'new mexico' || $('#js-search-term').val().toLowerCase() === 'nm') {
            const searchTerm = 'nm';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'new york' || $('#js-search-term').val().toLowerCase() === 'ny') {
            const searchTerm = 'ny';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'north carolina' || $('#js-search-term').val().toLowerCase() === 'nc') {
            const searchTerm = 'nc';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'north dakota' || $('#js-search-term').val().toLowerCase() === 'nd') {
            const searchTerm = 'nd';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'ohio' || $('#js-search-term').val().toLowerCase() === 'oh') {
            const searchTerm = 'oh';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'oklahoma' || $('#js-search-term').val().toLowerCase() === 'ok') {
            const searchTerm = 'ok';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'oregon' || $('#js-search-term').val().toLowerCase() === 'or') {
            const searchTerm = 'or';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'pennsylvania' || $('#js-search-term').val().toLowerCase() === 'pa') {
            const searchTerm = 'pa';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'rhode island' || $('#js-search-term').val().toLowerCase() === 'ri') {
            const searchTerm = 'ri';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'south dakota' || $('#js-search-term').val().toLowerCase() === 'sd') {
            const searchTerm = 'sd';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'tennessee' || $('#js-search-term').val().toLowerCase() === 'tn') {
            const searchTerm = 'tn';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'texas' || $('#js-search-term').val().toLowerCase() === 'tx') {
            const searchTerm = 'tx';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'utah' || $('#js-search-term').val().toLowerCase() === 'ut') {
            const searchTerm = 'ut';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'vermont' || $('#js-search-term').val().toLowerCase() === 'vt') {
            const searchTerm = 'vt';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'virginia' || $('#js-search-term').val().toLowerCase() === 'va') {
            const searchTerm = 'va';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'washington' || $('#js-search-term').val().toLowerCase() === 'wa') {
            const searchTerm = 'wa';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'west virginia' || $('#js-search-term').val().toLowerCase() === 'wv') {
            const searchTerm = 'wv';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'wisconsin' || $('#js-search-term').val().toLowerCase() === 'wi') {
            const searchTerm = 'wi';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else if ($('#js-search-term').val().toLowerCase() === 'wyoming' || $('#js-search-term').val().toLowerCase() === 'wy') {
            const searchTerm = 'wy';
            getNPSdata(searchTerm);
            $('.badValue').remove();
        } else {
            $('#header-content').append(`<p class='badValue'>sorry, that is not a state</p>`);
        }
    });
}

$(watchForm);
$(toggleClass);


/////////////////////leaflet//////////////////////
/////////////////////////////////////////////////

const options = {
    center: [37.317752, -100.261230],
    zoom: 4,
    zoomSnap: .1,
    zoomControl: false
};

const map = L.map('map', options);
// Get basemap URL from Leaflet Providers
const basemap_url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
// Get basemap attributes from Leaflet Providers
const basemap_attributes = {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
};
// requests some map tiles
const tiles = L.tileLayer(basemap_url, basemap_attributes);
map.addLayer(tiles);

$('#locate-position').on('click', function () {
    map.locate({
        setView: true,
        maxZoom: 6
    });
});