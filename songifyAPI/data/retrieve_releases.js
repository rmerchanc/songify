const fetch = require('node-fetch');
const fs = require('fs');

// Read ids contained in the file
let jsonData;
try {
    const data = fs.readFileSync('artists.json', 'utf8');
    jsonData = JSON.parse(data);
} catch (err) {
    console.error(err);
}
const artistsID = jsonData.map(item => item.id);
console.log(artistsID);

// URL
const url = 'https://musicbrainz.org/ws/2/release';

// Params of the query
let params = {
    artist: null,
    fmt: 'json',
    limit: 2000, 
    fields: 'id,title,date,country,text-representation.language'
};

// Create an empty array to store all the results
let results = [];

function makeRequest(idArtist) {
  params.artist = idArtist;
  console.log(params)
  
  fetch(url + "?" + new URLSearchParams(params), {
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
            language: release['text-representation'].language,
            id_artist: idArtist
        }));
        // Save the results into the array
        results = results.concat(releases);
        console.log(results)

        // Save it a JSON
        file = 'releases.json';
        fs.writeFile(file, JSON.stringify(results), err => {
            if (err) throw err;
            console.log('Results saved to ' + file);
        });
    }    
    })
    .catch(err => console.error(err));
}

// Make a request
for (const artistID of artistsID) {
    //const artistID = artistsID[index];
    console.log(artistID)
    makeRequest(artistID);
  }
