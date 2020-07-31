const superagent = require('superagent');
const client = require('./client')

function getLocationData(city) {
  const SQL = 'SELECT * FROM locations WHERE search_query = $1';
  const values = [city];
  return client.query(SQL, values)
    .then((results) => {
      console.log(results);
      if(results.rowCount > 0) {
        console.log(results);
        return results.rows[0];
      } else {
        const url = 'https://us1.locationiq.com/v1/search.php';
        return superagent.get(url)
          .query({
            key: process.env.LOCATION_KEY,
            q: city,
            format: 'json'
          })
          .then((data) => {
            console.log(data);
            return setLocationData(city, data.body[0]);
          });
      }
    });
}

function setLocationData(city, locationData) {
  const location = new Location(city, locationData);
  const SQL = `
    INSERT INTO locations (search_query, formatted_query, latitude, longitude)
    VALUES ($1, $2, $3, $4)
	RETURNING *;
  `;
  const values = [city, location.formatted_query, location.latitude, location.longitude];
  return client.query(SQL, values)
    .then(results => {
      return results.rows[0]
    });
}

function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = parseFloat(locationData.lat);
  this.longitude = parseFloat(locationData.lon);
}

module.exports = getLocationData;
