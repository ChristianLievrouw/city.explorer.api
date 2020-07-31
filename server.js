'use strict';

// Application Dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');
const superagent = require('superagent');

// Our Dependencies
const client = require('./modules/client');
const getLocationData = require('./modules/location')
const getRestaurantData = require('./modules/yelp')

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
  const url = 'https://api.themoviedb.org/3/search/movie';
  superagent.get(url)
    .query({
      api_key: process.env.MOVIE_KEY,
      query: title
    })
    .then(moviesResponse => {
      console.log(moviesResponse.body.results);
      const arrayOfMovieData = moviesResponse.body.results;
      const movieResults = [];
      arrayOfMovieData.forEach(movie => {
        movieResults.push(new Movies(movie));
      });
      response.send(movieResults);
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
  // const url = 'https://www.hikingproject.com/data/get-trails';
  // superagent.get(url)
  //   .query({
  //     key: process.env.TRAIL_KEY,
  //     lat: latitude,
  //     lon: longitude,
  //     maxDistance: 200
  //   })
  getTrailData(latitude, longitude)
    .then(results => {
      response.send(results)
    })
    // .then(trailResponse => {
    //   console.log(trailResponse.body);
    //   const arrayOfTrailData = trailResponse.body.trails;
    //   const trailResults = [];
    //   arrayOfTrailData.forEach(trail => {
    //     trailResults.push(new Trails(trail));
    //   });
    //   return trailResults;
    // })
}

function getTrailData(latitude, longitude){
  const url = 'https://www.hikingproject.com/data/get-trails';
  return superagent.get(url)
    .query({
      key: process.env.TRAIL_KEY,
      lat: latitude,
      lon: longitude,
      maxDistance: 200
    })
    .then(trailResponse => {
      console.log(trailResponse.body);
      const arrayOfTrailData = trailResponse.body.trails;
      const trailResults = [];
      arrayOfTrailData.forEach(trail => {
        trailResults.push(new Trails(trail));
      });
      return trailResults;
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

function Trails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionStatus;
  this.condition_date = trail.conditionDate.slice(0, 10);
  this.condition_time = trail.conditionDate.slice(12);
}

function Movies(movie) {
  this.title = movie.original_title;
  this.released_on = movie.released_date;
  this.total_votes = movie.vote_count;
  this.average_votes = movie.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
  this.overview = movie.overview;
}
// App listener
client.connect()
  .then(() => {
    console.log('Postgres connected.');
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => {
    throw `Postgres err: ${err.message}`;
  });
