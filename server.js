'use strict';

// Application Dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
// const { response } = require('express');
const superagent = require('superagent');

// Our Dependencies
const client = require('./modules/client');
const getLocationData = require('./modules/location')
const getRestaurantData = require('./modules/yelp')
const getTrailData = require('./modules/trails')
const getWeatherData = require('./modules/weather')
const getMoviesData = require('./modules/movies')

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());


// Route Definitions
app.get('/', rootHandler);
app.get('/location', locationHandler);
app.get('/yelp', restaurantHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response){
  response.status(200).send('City Explorer back-end')
}

function moviesHandler(request, response){
  const title = request.query.search_query;
  getMoviesData(title)
    .then(results => {
      response.send(results);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

function locationHandler(request, response){
  const city = request.query.city.toLowerCase().trim();
  getLocationData(city)
    .then(locationData => {
      console.log(locationData);
      response.status(200).send(locationData);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

function restaurantHandler(request, response) {
  const lat = parseFloat(request.query.latitude);
  const lon = parseFloat(request.query.longitude);
  const page = request.query.page;
  getRestaurantData(lat, lon, page)
    .then(results => {
      response.send(results);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

function trailsHandler(request, response) {
  const latitude = parseInt(request.query.latitude);
  const longitude = parseInt(request.query.longitude);
  getTrailData(latitude, longitude)
    .then(results => {
      response.send(results)
    })
}

function weatherHandler(request, response) {
  const latitude = parseFloat(request.query.latitude);
  const longitude = parseFloat(request.query.longitude);
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(url)
    .query({
      key: process.env.WEATHER_API_KEY,
      lat: latitude,
      lon: longitude
    })
    .then(weatherResponse => {
      const arrayOfWeatherData = weatherResponse.body.data;
      const weatherResults = [];
      arrayOfWeatherData.forEach(location => {
        weatherResults.push(new Weather(location));
      });
      response.send(weatherResults)
    })
}

function notFoundHandler(request, response) {
  response.status(404).json({ notFound: true });
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

function Weather(conditions) {
  this.time = conditions.datetime;
  this.forecast = conditions.weather.description;
}

// App listener
client.connect()
  .then(() => {
    console.log('Postgres connected');
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => {
    throw `Postgres err: ${err.message}`;
  });
