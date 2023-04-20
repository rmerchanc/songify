const fs = require('fs');
const fetch = require("node-fetch");
const url = "https://musicbrainz.org/ws/2/artist/";
 // no deja modificar el limit por defecto, el cual es 25
const params = {
  query: "type:person",
  offset: 0,
  fmt: "json",
  fields: "id,type,name,gender,area.name,life-span.begin,life-span.end"
};

fetch(url + "?" + new URLSearchParams(params), {
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to retrieve data from the API.");
    }
  })
  .then(data => {
    // Extract the desired fields from each artist object
    const artists = data.artists.map(artist => ({
      id: artist.id,
      type: artist.type,
      name: artist.name,
      gender: artist.gender,
      area: artist.area ? artist.area.name : null,
      begin: artist['life-span'].begin,
      end: artist['life-span'].end
    }));
  
    // Save the data to a JSON file
    fs.writeFile('artists.json', JSON.stringify(artists), err => {
      if (err) throw err;
      console.log('Data saved to artists.json');
    });
  })
  .catch(error => {
    console.error(error);
  });