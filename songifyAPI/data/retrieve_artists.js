const fetch = require('node-fetch');
const fs = require('fs');

const url = 'https://musicbrainz.org/ws/2/artist';
const params = {
  query: 'type:person',
  limit: 25,
  fmt: 'json',
  fields: 'id,type,name,gender,area.name,life-span.begin,life-span.end'
};

// Crear un array vacío para guardar los resultados temporalmente
let results = [];

// Definir una función recursiva que haga peticiones con un delay de 1 segundo
function makeRequest(offset) {
  params.offset = offset;
  
  fetch(url + "?" + new URLSearchParams(params), {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
        // Comprobar que data.artists tiene cotenido antes de hacer el mapping 
        if (data.artists) {
            // Extraer los campos deseados del objeto artista
            const artists = data.artists.map(artist => ({
                id: artist.id,
                type: artist.type,
                name: artist.name,
                gender: artist.gender,
                area: artist.area ? artist.area.name : null,
                begin: artist['life-span'].begin,
                end: artist['life-span'].end
            }));
            // Añadir los resultados al array
            results = results.concat(artists);
        }
        
        // Incrementar el offset hasta que llegue a los 1000 registros
        if (offset + 25 < 1000) {
            // Hacer una nueva petición si no se ha llegado al offset deseado y con un delay de un segundo
            setTimeout(() => makeRequest(offset + 25), 1000);
        } else {
            // Cuando se alcanza el offset deseado, crear el JSON
            fs.writeFile('artists2.json', JSON.stringify(results), err => {
                if (err) throw err;
                console.log('Results saved to artists2.json');
            });
        }
    })
    .catch(err => console.error(err));
}

// Empezar la petición sin offset
makeRequest(0);