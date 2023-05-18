var express = require("express");
//const { ObjectId } = require("mongodb");
var router = express.Router();
const fetch = require("node-fetch");
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const xml2js = require('xml2js');
const axios = require("axios")

router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {}
  if (next) {
    query = { _id: { $lt: new ObjectId(next) } }
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('artist')
    .find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .toArray()
    .catch(err => res.status(400).send('Error to fetch artists'));
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});



/*
router.get("/", function (req, res, next) {
  res.send([
    {
      id: 1,
      name: "Coldplay",
      type: "Group",
      area: "United Kingdom",
      begin_date: "1996-09",
      url_releases: "https://localhost/api/v3/artist/1/releases",
      url_recordings: "https://localhost/api/v3/artist/1/recordings",
    },
    {
      id: 2,
      name: "John Williams",
      type: "Person",
      gender: "Male",
      area: "Australia",
      begin_date: "1941-04-24",
      url_releases: "https://localhost/api/v3/artist/2/releases",
      url_recordings: "https://localhost/api/v3/artist/2/recordings",
    },
  ]);
});


María & Ramón para recuperar datos de la API:*/

/*router.get("/:id", function (req, res, next) {
  if (req.params.id) {
    // here should be some type of convertion between our IDs and the API's MBIDs
    console.log("The ID introduced is " + req.params.id);
  }
  const mbid = "cc197bad-dc9c-440d-a5b5-d52ba2e14234"; // MusicBrainz Identifiers (MBIDs)
  const url = `https://musicbrainz.org/ws/2/artist/${mbid}?fmt=json`;

  fetch(url)
    // GET request to the API
    .then((response) => {
      // response code 200
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error: " + response.status);
      }
    })
    .then((artistInfo) => {
      res.send({
        id: 1,
        name: artistInfo.name,
        type: artistInfo.type,
        area: artistInfo.area, // too much information
        begin_date: artistInfo.begin_date,
        url_releases: "https://localhost/api/v3/artist/1/release",
        url_recordings: "https://localhost/api/v3/artist/1/recording",
      });
    })
    .catch((error) => {
      console.error(error);
    });
});*/

router.get("/:id", async function (req, res, next) {
  console.log(req.params.id)
  const url = `https://musicbrainz.org/ws/2/artist/${req.params.id}?fmt=json`;

  let d = await axios.get(url)
  let importa = d.data
  console.log(importa)

  //axius
  /*fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data.recordings.length)
      if (data.recordings && data.recordings.length > 0) {
        data.recordings.forEach(recording => {
          const title = recording.title;
          const duration = recording.length / 1000; 
          const artist = recording["artist-credit"][0].artist.name;
          console.log(`Title: ${title}, Artist: ${artist}, Duration: ${duration}s`);
        });
      } else {
        console.log("No recordings found for this artist.");
      }
    })
    .catch(error => console.error(error));*/


  /* if (req.params.id) {
     // here should be some type of convertion between our IDs and the API's MBIDs
     console.log("The ID introduced is " + req.params.id);
   }
   const mbid = "74df4e2f-fe75-4b4a-87c5-3f1b4bc95aa2"; // MusicBrainz Identifiers (MBIDs)
   //const url = `https://musicbrainz.org/ws/2/artist/${mbid}?fmt=json`;
   
   const artistId = "74df4e2f-fe75-4b4a-87c5-3f1b4bc95aa2"; 
   const url = `https://musicbrainz.org/ws/2/artist/${req.params.id}/recordings`;
   
   
   fetch(url)
   .then(response => response.json())
   .then(xml => xml2js.parseStringPromise(xml))
   .then(result => {
     console.log(result)
     if (result && result.recordingList && result.recordingList.recording) {
       const recordings = result.recordingList.recording;
       recordings.forEach(recording => {
         const title = recording.title;
         const artist = recording['artist-credit'][0].name;
         const duration = recording.length;
         console.log(`Title: ${title}, Artist: ${artist}, Duration: ${duration}`);
       });
     } else {
       console.log('No recordings found for this artist.');
     }
   })
   .catch(error => console.error(error));*/
});


router.get("/:id/recordings", async function (req, res, next) {

  const url = `https://musicbrainz.org/ws/2/artist/${req.params.id}/recordings?inc=recordings`

  var datos = [];
  var objeto = {};

  let d = await axios.get(url)
  let canciones = d.data
  
  for (var i = 0; i < canciones.recordings.length; i++) {

    var nombre = canciones.recordings[i];

    datos.push({
      "id_recordig": nombre.id,
      "title": nombre.title,
      "length": tiempo(nombre.length)
    });
  }

  objeto.datos = datos;
  res.send(datos)

});

router.get("/:id/recording/:id1", async function (req, res, next) {

  const url = `https://musicbrainz.org/ws/2/recording/${req.params.id1}`

  axios.get(url)
    .then(response => {

      let canciones = response.data

      res.send({
        "id": canciones.id,
        "title": canciones.title,
        "length": tiempo(canciones.length)
      });
    });
});

function tiempo(tiempo) {
  const segundos = (Math.floor(tiempo / 1000));
  const minutos = Math.floor(segundos / 60);
  const seg = (segundos % 60);

  return `${minutos}:${seg}`
}
//8e302fa1-4e1a-4f71-8324-4cee43fbd45a
router.get("/:id/release/:idRelease/recordings", async function (req, res, next) {

  //const url = `https://musicbrainz.org/release/${req.params.idRelease}`
               //https://musicbrainz.org/release/8e302fa1-4e1a-4f71-8324-4cee43fbd45a
               //artista: d87e52c5-bb8d-4da8-b941-9f4928627dc8
               //release: dee43093-f736-3b34-90b0-f5a9d1546117
               const url = 'https://musicbrainz.org/ws/2/artist/d87e52c5-bb8d-4da8-b941-9f4928627dc8/release/dee43093-f736-3b34-90b0-f5a9d1546117?inc=recordings'
  var datos = [];
  var objeto = {};

  let d = await axios.get(url)
  console.log(d);
  let canciones = d.data
  
  for (var i = 0; i < canciones.recording-list.length; i++) {

    var nombre = canciones.recording[i];

    datos.push({
      "id_recordig": nombre.id,
      "title": nombre.title,
      "length": tiempo(nombre.length)
    });
  }

  objeto.datos = datos;
  res.send(datos)
  
});









module.exports = router;
