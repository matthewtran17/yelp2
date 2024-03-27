const express = require('express')
const axios = require('axios')
const app = express()
require('dotenv').config();

async function searchBusiness(pLat, pLng, pTerm, pRadius, pPrice) {
    try {
        const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_YELP_APP_KEY}`
            },
            params: {
                latitude : pLat, // Pass latitude
                longitude :  pLng, // Pass longitude
                term : pTerm,
                radius : pRadius, 
                price : pPrice,
                limit: 3
            }
        });
        return response.data;
    } catch (e) {
        console.error('error: ', e);
        throw e; // Rethrow error to handle it in the calling function
    }
}

app.get("/api", async (req,res) => {
    const { lat, lng, term, radius, price } = req.query;
    // console.log(lat, lng, term, radius, price)

    const businesses = await searchBusiness(lat, lng, term, radius, price);
    // console.log(businesses)
    res.json(businesses)
})

app.listen(5000, () => {console.log("Server started on port 5000")})

