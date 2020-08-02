'use strict';
const superagent = require('superagent');

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

module.exports = getTrailData;
