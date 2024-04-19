import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import './SearchMap.css';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions } from '@mui/material';

import Slider2 from 'react-slick';

import Carousel from 'react-bootstrap/Carousel';

const SearchAndMap = () => {
    const prices = [
        1,
        2,
        3,
        4,
    ]   

    const getPriceLabel = (price) => {
        switch (price) {
            case 1:
                return '$';
            case 2:
                return '$$';
            case 3:
                return '$$$';
            case 4:
                return '$$$$';
            default:
                return '$$';
        }
    };

    /* VARIABLES */
    const [optionVal, setOptionVal] = useState('');
    const handleOptionChange = (event) => {
        setOptionVal(event.target.value);
    };

    const [priceVal, setOptionPrice] = useState(prices[0]);

    const [limitVal, setLimit] = useState(10);
    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const [sortByVal, setSortBy] = useState('best_match');
      
    const [nRadius, setRadius] = useState(9600); // Default radius in meters

    const [yelpBackendData, setYelpBackendData] = useState([]);

    const [clickedLatLng, setClickedLatLng] = useState({ lat: 33.88134, lng: -117.8818 });
    const mapRef = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            const script = document.createElement('script');

            // script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCUnmqTkhklqvM0P2AjfHMVyx7bxBmMwio&libraries=places&callback=initMap`;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;

            script.async = true;
            script.defer = true;

            script.onload = () => {
                initMap();
            };

            document.head.appendChild(script);
        };

        const initMap = () => {
            if (window.google && window.google.maps && window.google.maps.Map) {
                const fullerton = { lat: 33.8831307524001, lng: -117.88541077620087 };
                const map = new window.google.maps.Map(document.getElementById('map'), {
                    zoom: 11,
                    center: fullerton,
                });

                mapRef.current = map;

                const initCircle = new window.google.maps.Circle({
                    strokeColor: "#083D77",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#083D77",
                    fillOpacity: 0.15,
                    map,
                    center: fullerton,
                    radius: nRadius, 
                });

                circleRef.current = initCircle;

                let infoWindow = new window.google.maps.InfoWindow({
                    content: "Fullerton",
                    position: fullerton,
                });

                infoWindow.open(map);

                setClickedLatLng(fullerton);

                function initializeAutocomplete() {
                    var input = document.getElementById('searchTextField');
                    var autocomplete = new window.google.maps.places.Autocomplete(input);
        
                    // Listen for the 'place_changed' event
                    autocomplete.addListener('place_changed', function() {
                        infoWindow.close()
                        var place = autocomplete.getPlace();
                        console.log("Autocomplete result: ", place); // Log the details of the selected place
                    
                        // Log place.geometry.location for debugging
                        console.log("Geometry location: ", place.geometry.location);
                    
                        if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
                            const autoLatLng = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            };
                            console.log("autoComplete lat/lng: ", autoLatLng);
                            map.panTo(place.geometry.location);

                            // Set the clicked LatLng
                            setClickedLatLng(autoLatLng);

                            // Set the content of the info window
                            const currLatLng = JSON.stringify(autoLatLng, null, 2);

                            infoWindow = new window.google.maps.InfoWindow({
                                position: currLatLng,
                                center: currLatLng,
                            });

                            infoWindow.setContent(currLatLng);
                            
                            initCircle.setCenter(autoLatLng);

                            infoWindow.open(map);
                        } else {
                            console.log("No geometry or location found for the selected place, or location is not an instance of google.maps.LatLng.");
                        }
                    });
        
                    // Add event listener for 'keypress' event to trigger search on 'Enter' key press
                    input.addEventListener('keypress', function(event) {
                        if (event.key === 'Enter') {
                            // Trigger search only if the input field is not empty
                            if (input.value.trim() !== '') {
                                // Simulate a click on the first prediction in the Autocomplete dropdown
                                var firstPrediction = document.querySelector('.pac-container .pac-item');
                                if (firstPrediction) {
                                    firstPrediction.click();
                                }
                            }
                        }
                    });
                }

                initializeAutocomplete();

                map.addListener('click', (clickEvent) => {
                    infoWindow.close();

                    const lat = clickEvent.latLng.lat();
                    const lng = clickEvent.latLng.lng();
                    const clickedLatLng = { lat, lng };

                    infoWindow = new window.google.maps.InfoWindow({
                        position: clickedLatLng,
                        center: clickedLatLng,
                    });

                    console.log(clickEvent)
                    map.panTo(clickEvent.latLng);
                    setClickedLatLng(clickedLatLng);

                    const currLatLng = JSON.stringify(clickEvent.latLng.toJSON(), null, 2);
                    infoWindow.setContent(currLatLng);

                    initCircle.setCenter(clickEvent.latLng);

                    infoWindow.open(map);
                });
            } else {
                console.error('Error: google.maps.Map not defined');
            }
        };

        if (!window.google || !window.google.maps || !window.google.maps.Map) {
            loadGoogleMapsScript();
        } else {
            initMap();
        }

    }, []); 

    const handleRadiusChange = (event, value) => {
        setRadius(value); 
        circleRef.current.setRadius(value); 
    };

    let markers = [];    

    const [index, setIndex] = useState(0);
    
    /* HANDLES SEARCH FROM BACKEND  */
    async function handleSearch() {
        console.log("handle search");
    
        try {
            const params = {
                lat: clickedLatLng.lat,
                lng: clickedLatLng.lng,
                term: optionVal,
                radius: nRadius,
                
                price: priceVal,
                sort_by : sortByVal,
                limit : limitVal, 
            };

            console.log(params)
    
            // Make a GET request with parameters as query string
            const queryString = Object.keys(params)
                .map(key => `${key}=${encodeURIComponent(params[key])}`)
                .join('&');
            const response = await fetch(`/api?${queryString}`);
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data)
            setYelpBackendData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    

        
    

    

    return (
        <div className='parent-container'>
            <div id="autocomplete-container">
                <TextField
                    hiddenLabel
                    id="standard-size-normal"
                    // defaultValue="Normal"
                    variant="standard"
                    placeholder='restaurants'
                    value={optionVal}
                    onChange={handleOptionChange}
                />
                <p> near </p>
                <input id="searchTextField" type="text" size="50"/>
                <Button className="searchButton" variant="contained" onClick={handleSearch}>Search</Button>
            </div>
            
            <div className='search-container'>
                <Select
                    value={priceVal}
                    onChange={(event) => {
                        setOptionPrice(event.target.value)	
                    }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '155px',
                        height: '59px',
                        borderRadius: '40px',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF'
                    }}
                    >
                    {prices.map((price, index) => (
                        <MenuItem
                            key={index}
                            value={price}
                        >
                            {getPriceLabel(price)}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    value={sortByVal}
                    onChange={(event) => {
                        setSortBy(event.target.value)	
                    }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '155px',
                        height: '59px',
                        borderRadius: '40px',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF'
                    }}
                    >
                    <MenuItem value="best_match">Best Match</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                    <MenuItem value="review_count">Review Count</MenuItem>
                    <MenuItem value="distance">Distance</MenuItem>
                </Select>

                <Select
                    value={limitVal}
                    onChange={handleLimitChange}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '155px',
                        height: '59px',
                        borderRadius: '40px',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF'
                    }}
                    >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={40}>40</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
            </div>

            <div className='slider-container'>
                <Slider
                    min={1600}    // minimum radius value in meters
                    max={40000}   // maximum radius value in meters
                    step={1600}   // step size for the slider
                    onChange={handleRadiusChange}
                    value={nRadius} // Slider value in meters
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${value / 1600} ${value === 1600 ? 'mile' : 'miles'}`}
                    aria-labelledby="radius-slider"
                />
            </div>

            <div id="map"></div>
            <div id="searchResults">
                <div className='grid-container'>
                    {yelpBackendData.length === 0 ? ( 
                        <p>loading...</p>
                    ) : (
                        <div className="grid">
                            {yelpBackendData.businesses.map((business, i) => {
                                return (   
                                    <div key={i} className='card'>
                                        <CardActionArea>
                                            <CardMedia style={{ width: '50%', height: '40%' }}>
                                                <img className='businessImg' src={business.image_url} alt={business.name} style={{ width: '100%', height: '100%' }} />
                                            </CardMedia>
                                        </CardActionArea>
                                        <CardContent>
                                            <p>Name: {business.name}</p>
                                            <p>Rating: {business.rating}</p>
                                        </CardContent>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchAndMap;

// <Card key={i} style={{ width: 383, height: 553 }}>
//     <CardActionArea>
//         <CardMedia style={{ width: '100%', height: '383px' }}>
//             <img className='businessImg' src={business.image_url} alt={business.name} style={{ width: '100%', height: '100%' }} />
//         </CardMedia>
//     </CardActionArea>
//     <CardContent>
//         <p>Name: {business.name}</p>
//         <p>Rating: {business.rating}</p>
//     </CardContent>
// </Card>



/*
const handleSearch = async () => {
    // Clear the existing search results and markers

    console.log("Searching for:", optionVal, "near lat:", clickedLatLng.lat, "lng:", clickedLatLng.lng, "within a", nRadius, "m radius." );
    console.log("Price: ", priceVal);
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    let getNextPage;
    const moreButton = document.getElementById("more");

    moreButton.onclick = function () {
        moreButton.disabled = true;
        if (getNextPage) {
            getNextPage();
        }
    };

    service.nearbySearch(
        {   location: clickedLatLng, 
            radius: nRadius, 
            type: optionVal, 
            maxprice: priceVal,
        },
        (results, status, pagination) => {
            if (status !== "OK" || !results) return;
            console.log("search results")
            // console.log(results)
            results.forEach(place => {  
                const name = place.name;
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                const photos = place.photos
                console.log("photos : ", photos)

            
                // console.log("establishment name:", name, "{", latitude, ",", longitude,"}");
            });

            // Alphabetize the results by name
            const sortedResults = results.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            const filteredResults = sortedResults.filter(place => {
                // Check if the first type matches optionVal
                return place.types[0] === optionVal;
            });

            addPlaces(sortedResults, mapRef.current);
            removePlaces(sortedResults, mapRef.current)

            moreButton.disabled = !pagination || !pagination.hasNextPage;
            if (pagination && pagination.hasNextPage) {
                getNextPage = () => {
                    // Note: nextPage will call the same handler function as the initial call
                    pagination.nextPage();
                };
            }
        }
    );

    markers = []
};

function addPlaces(places, map) {
    const placesList = document.getElementById("places");
    placesList.innerHTML = '';

    for (const place of places) {
        // if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
        const image = {
            url: place.icon,
            size: new window.google.maps.Size(71, 71),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(17, 34),
            scaledSize: new window.google.maps.Size(25, 25),
        };

        const markerLatLng = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        }

        // console.log("searchMarker latLng: ",markerLatLng)

        const marker = new window.google.maps.Marker({
            map,
            icon: image,
            title: place.name,
            position: markerLatLng,
        });

        markers.push(marker); // Store the marker in the array

        const li = document.createElement("li");

        li.textContent = place.name;
        placesList.appendChild(li);
        li.addEventListener("click", () => {
            map.panTo(place.geometry.location);
            window.google.maps.event.addListenerOnce(map, 'idle', () => {
                map.setZoom(13);
            });
        });
    }
}
    
function removePlaces(markers,map) {
    const clearButton = document.getElementById("clear");
    const placesList = document.getElementById("places");
    clearButton.onclick = function() {
        deleteMarkers();
        placesList.innerHTML = '';
    }

}

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
  
// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
    setMapOnAll(null);
}

function deleteMarkers() {
    hideMarkers();
    markers = [];
}
/*

/*

// function initializeAutocomplete() {
//     var input = document.getElementById('searchTextField');
//     var autocomplete = new window.google.maps.places.Autocomplete(input);

//     // Listen for the 'place_changed' event
//     autocomplete.addListener('place_changed', function() {
//         infoWindow.close()
//         var place = autocomplete.getPlace();
//         console.log("Autocomplete result: ", place); // Log the details of the selected place
    
//         // Log place.geometry.location for debugging
//         console.log("Geometry location: ", place.geometry.location);
    
//         if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
//             const autoLatLng = {
//                 lat: place.geometry.location.lat(),
//                 lng: place.geometry.location.lng()
//             };
//             console.log("autoComplete lat/lng: ", autoLatLng);
//             map.panTo(place.geometry.location);



*/