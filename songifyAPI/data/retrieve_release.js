const fetch = require('node-fetch');
const fs = require('fs');

// URL
const url = 'https://musicbrainz.org/ws/2/release';

// Params of the query
let params = {
  query: 'type:release',
  limit: 10,
  fmt: 'json',
  //fields: 'id, title, date, country, text, representation.language'
  fields: 'id,title,artist-credit.name,release-events.date', 
  artist : null
};

// Create an empty array to store all the results
let results = [];

function makeRequest(idArtist) {
  params.artist = idArtist;
  
  fetch(`https://musicbrainz.org/ws/2/release?artist=${idArtist}&fmt=json&fields=id+title+date+country+text-representation.language`, {
  //await fetch(`https://musicbrainz.org/ws/2/release?artist=${idArtist}&fmt=json&fields=id+title+date+country+text-representation.language`,{
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    // Check whether data.releases has content
    if (data.releases) {
        // Extract the desired fields from each release object
        const releases = data.releases.map(release => ({
            id: release.id,
            title: release.title,
            date: release['release-events'][0].date,
            country: release.country,
            languague: release['text-representation'].language
        }));
        // Save the results into the array
        results = results.concat(releases);
        console.log(results)
    }

    // Save it a JSON
    file = 'release.json';
    fs.writeFile(file, JSON.stringify(results), err => {
        if (err) throw err;
        console.log('Results saved to ' + file);
    });
    
    })
    .catch(err => console.error(err));
}

// Make a request
makeRequest('f1a3fb4a-fff6-4556-a290-3704b109da90');