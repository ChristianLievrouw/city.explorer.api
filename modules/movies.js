'use strict';

const superagent = require('superagent');

function getMoviesData(title) {
  const url = 'https://api.themoviedb.org/3/search/movie';
  return superagent.get(url)
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
      return movieResults;
    })
}

function Movies(movie) {
  this.title = movie.original_title;
  this.released_on = movie.released_date;
  this.total_votes = movie.vote_count;
  this.average_votes = movie.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
  this.overview = movie.overview;
}

module.exports = getMoviesData;
