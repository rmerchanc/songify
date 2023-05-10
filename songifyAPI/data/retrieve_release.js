const fetch = require('node-fetch');
const fs = require('fs');
let jsonData; 

try {
    const data = fs.readFileSync('artists.json', 'utf8');
    jsonData = JSON.parse(data);
} catch (err) {
    console.error(err);
}

const artistId = jsonData.map(item => item.id);

let results = [];

const getDataForAllArtists = async () => {
    const limit = 25;
    artistId.forEach(id => {
        let offset = 0;
        const getNextPage = () => {
            fetch(`https://musicbrainz.org/ws/2/release?artist=${id}&fmt=json&fields=id+title+artist+date+country+label+language&limit=${limit}&offset=${offset}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.releases) {
                    // Extract the desired fields from each release object
                    const releases = data.releases.map(release => ({
                        id: release.id,
                        title: release.title,
                        artist: release.artist,
                        date: release.date,
                        country: release.country,
                        label: release.label,
                        language: release.language
                    }));
                    results = results.concat(releases);
                    offset += limit;
                    getNextPage();
                } else {
                    file = 'releases.json';
                    fs.writeFile(file, JSON.stringify(results), err => {
                        if (err) throw err;
                        console.log('Results saved to ' + file);
                    });
                }
            })
            .catch(error => console.log(error));
        };
        getNextPage();
    });
};

getDataForAllArtists();
