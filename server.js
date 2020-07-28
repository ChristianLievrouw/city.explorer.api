'use strict';

// Application Dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Route Definitions
app.get('/', rootHandler);
app.get('/location', locationHandler);
app.get('/yelp', restaurantHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response){
  response.status(200).send('City Explorer back-end')
}

function locationHandler(request, response){
  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.LOCATION_KEY,
      q: city,
      format: 'json'
    })
    .then(locationData => {
      const location = locationData.body[0];
      const newLocation = new Location(city, location);
      response.status(200).send(newLocation);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
  //const locationData = require('./data/location.json'); // delete
  // const location = new Location(city, locationData);
  // response.status(200).send(location);
}

function restaurantHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const page = parseInt(request.query.page);
  const restaurantPerPage = 5;
  const start = ((page - 1) * restaurantPerPage + 1);
  const url = '';
  superagent.get(url)
    .query({
      latitude: lat,
    })
    .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
    .then()
    .catch()

  // const restaurantsData = require('./data/restaurants.json');
  // const arrayOfRestaurants = restaurantsData.nearby_restaurants;
  // const restaurantsResults = [];
  // arrayOfRestaurants.forEach(restaurantObj => {
  //   restaurantsResults.push(new Restaurant(restaurantObj));
  // });
  // response.send(restaurantsResults)
}

function weatherHandler(request, response) {
  const weatherData = require('./data/weather.json');
  const arrayOfWeatherData = weatherData.data;
  const weatherResults = [];
  arrayOfWeatherData.forEach(location => {
    weatherResults.push(new Weather(location));
  });
  response.send(weatherResults)
}

function notFoundHandler(request, response) {
  response.status(404).json({ notFound: true });
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

// Constructor
function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = parseFloat(locationData.lat);
  this.longitude = parseFloat(locationData.lon);
}

function Restaurant(obj) {
  this.name = obj.restaurant.name;
  this.url = obj.restaurant.url;
  this.rating = obj.restaurant.user_rating.aggregate_rating;
  this.price = obj.restaurant.price_range;
  this.image_url = obj.restaurant.featured_image;
}

function Weather(conditions) {
  this.time = conditions.valid_date;
  this.forecast = conditions.weather.description;
}
// App listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
