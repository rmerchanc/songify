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

// URL
const url = 'https://musicbrainz.org/ws/2/release';

// Params of the query
let params = {
    artist: null,
    fmt: 'json',
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
            languague: release['text-representation'].language
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
artistsID.forEach(artistID => {
    setTimeout(() => makeRequest(artistID), 1000);
});
