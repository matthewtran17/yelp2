import React, {useState, useEffect} from 'react';
import Header from './components/Header/Header'
import SearchAndMap from './components/SearchAndMap/SearchMap'
import './App.css'

const App = () => {
    const [clickedLatLng, setClickedLatLng] = useState(null);
    const [nRadius, setRadius] = useState(null);

    const handleLatLngChange = (latLng) => {
        console.log("New clickedLatLng:", latLng);
        setClickedLatLng(latLng);
    };

    const handleRadiusChange = (nRadius) => {
        console.log("radius (App.js): ", nRadius)
        setRadius(nRadius)
    }   
    

    return (
        <div className='body'>
            <Header/>
            <SearchAndMap/>
        </div> 
    )
}

export default App;