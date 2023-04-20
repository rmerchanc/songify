const fetch = require('node-fetch');
const fs = require('fs');

const url = 'https://musicbrainz.org/ws/2/artist';
const params = {
  query: 'type:person',
  limit: 25,
  fmt: 'json',
  fields: 'id,type,name,gender,area.name,life-span.begin,life-span.end'
};

// Create an empty array to store all the results
let results = [];

// Define a recursive function that makes a request with a delay of one second
function makeRequest(offset) {
  params.offset = offset;
  
  fetch(url + "?" + new URLSearchParams(params), {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
        // Check whether data.artist has content
        if (data.artists) {
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
            // Save the results into the array
            results = results.concat(artists);
        }
        
        // Increment the offset up to 1000
        if (offset + 25 < 1000) {
            // Make a request if the offset has not reached 1000 and make the request with 1 second delay each
            setTimeout(() => makeRequest(offset + 25), 1000);
        } else {
            // Then the desired offset is reached, convert the array to a JSON
            file = 'artists1000.json';
            fs.writeFile(file, JSON.stringify(results), err => {
                if (err) throw err;
                console.log('Results saved to ' + file);
            });
        }
    })
    .catch(err => console.error(err));
}

// Make a request without offset
makeRequest(0);