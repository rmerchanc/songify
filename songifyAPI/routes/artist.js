var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const xml2js = require('xml2js');
const axios = require("axios")


/**
 * Get /artist
 * Conexión a MongoDB que devuelve todos los artistas
 * TODO: paginación
 */
router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {}
  if (next) {
    query = { _id: { $gt: new ObjectId(next) } }
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('artist')
    .find(query)
    //.sort({ _id: -1 })
    .limit(limit)
    .toArray()
    .catch(err => res.status(500).send('Error to fetch artists'));
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});


/**
 * Get /artist?filtro=:param
 * Conexión a MongoDB que devuelve todos los artistas filtrando los resultados por...
 * TODO: paginación
 * TODO:  filtro
 */
//code


/**
 * Post /artist
 * Conexión a MongoDB que crea un nuevo artista
 * TODO: post
 */
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  console.log(req.body);
  let result = await dbConnect
    .collection('artist')
    .insertOne(req.body);
  res.status(201).send(result);
});

/**
 * Get /artist/{id}
 * Conexión a MongoDB que devuelve un artista a partir de un id
 * TODO: get
 */
router.get("/:id", async function (req, res, next) {
  const dbConnect = dbo.getDb();
  let query = {_id: new ObjectId(req.params.id)};
  let result = await dbConnect
    .collection('artist')
    .findOne(query);
  if (!result){
    res.send("Not found").status(404);
  } else {
    res.status(200).send(result);
  }

});

/**
 * Put /artist/{id}
 * Conexión a MongoDB que modifica(actualiza) un artista a partir de un id
 * TODO: put modificando uno, dos, tres o todos los campos posibles en del artista
 */
//Pasarle como parametro el id de la bbdd
router.put("/:id", async function (req, res, next) {

  const query = {_id: new ObjectId(req.params.id)};
  const update = {$set:{ 
    type: req.body.type,
    name: req.body.name,
  }};
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('artist')
    .updateOne(query, update);
  res.status(200).send(result);

});


/**
 * Delete /artist/{id}
 * Conexión a MongoDB que borra un artista a partir de un id
 * TODO: delete
 */
//code

/**
 * Get /artist/{id}/release
 * Conexión a MongoDB que devuelve los álbumes de un artista concreto
 * TODO: get
 */
router.get('/:id/release', async (req, res) => {
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
    .collection('release')
    .find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .toArray()
    .catch(err => res.status(400).send('Error to fetch artists'));
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});


/**
 * Post /artist/{id}/release
 * Conexión a MongoDB que crea un nuevo álbum para un artista
 * TODO: post
 */
//code

/**
 * Get /artist/{id}/release/{id}
 * Conexión a MongoDB que devuelve el álbum de un artista
 * TODO: get
 */
//646d083ddc30ca567f175175
router.get("/:id/release/:idRelease", async function (req, res, next) {
  const dbConnect = dbo.getDb();
  let query = {_id: new ObjectId(req.params.idRelease)};
  let result = await dbConnect
    .collection('release')
    .findOne(query);
  if (!result){
    res.send("Not found").status(404);
  } else {
    res.status(200).send(result);
  }
});

/**
 * Put /artist/{id}/release/{id}
 * Conexión a MongoDB que modifica(actualiza) el álbum de un artista
 * TODO: put modificando uno, dos, tres o todos los campos posibles del álbum
 */
//646d083ddc30ca567f175175
router.put("/:id/release/:idRelease", async function (req, res, next) {
  const query = {_id: new ObjectId(req.params.idRelease)};
  const update = {$set:{
    title: req.body.title,
    date: req.body.date,
    country: req.body.country
  }};
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('release')
    .updateOne(query, update);
  res.status(200).send(result);
});

/**
 * Delete /artist/{id}/release/{id}
 * Conexión a MongoDB que borra un álbum de un artista
 * TODO: delete
 */
//646d083ddc30ca567f175175
router.delete("/:id/release/:idRelease", async function (req, res, next) {
  const query = { _id: new ObjectId(req.params.idRelease) };
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('release')
    .deleteOne(query);
  res.status(200).send(result);
});



/**
 * Get /artist/{id}/recording
 * Conexión a la API que devuelve las canciones de un artista
 * Formato JSON
 * Ejemplo de id de un artista: cc197bad-dc9c-440d-a5b5-d52ba2e14234
 */
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

})


/**
 * Get /artist/{id}/recording/{id}
 * Conexión a la API que devuelve una canción de un artista
 * Formato JSON
 */
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

/**
 * Get /artist/{id}/release/{id}/recording
 * Conexión a la API que devuelve la lista de canciones de un álbum de un artista
 * Formato XML
 * Ejemplo de idRelease:8e302fa1-4e1a-4f71-8324-4cee43fbd45a
 * URL ejemplo de la API: https://musicbrainz.org/ws/2/release/8e302fa1-4e1a-4f71-8324-4cee43fbd45a?inc=recordings
 * Ejemplo en Postman: localhost:3000/artist/234567890098765432/release/8e302fa1-4e1a-4f71-8324-4cee43fbd45a/recordings
 */
router.get("/:id/release/:idRelease/recordings", async function (req, res, next) {

  const url = `https://musicbrainz.org/ws/2/release/${req.params.idRelease}?inc=recordings&fmt=xml`

  axios.get(url)
    .then(response => {
      const xml = response.data;

      // Parsear el XML
      xml2js.parseString(xml, (err, result) => {
        if (err) {
          console.error(err);
          return err;
        }
        const tracks = result.metadata.release[0]['medium-list'][0].medium[0]['track-list'][0].track;

        // Crear un objeto para el nuevo XML
        const newXmlObj = {
          tracks: []
        };

        // Recorrer las pistas y extraer los atributos deseados
        tracks.forEach(track => {
          const id = track.recording[0].$.id;
          const title = track.recording[0].title[0];
          const length = tiempo(track.recording[0].length[0]);

          // Agregar la pista al objeto del nuevo XML
          newXmlObj.tracks.push({ track: { id, title, length } });
        });

        // Convertir el objeto a XML
        const builder = new xml2js.Builder();
        const newXml = builder.buildObject(newXmlObj);

        res.send(newXml)
      });

    });
});


/**
 * Get /artist/{id}/release/{id}/recording/{id}
 * Conexión a la API que devuelve una canción de un álbum de un artista
 * Formato XML
 * Ejemplo de idIndividual: 822224c8-b19d-4352-a0b8-64571c6651ba
 */
router.get("/:id/release/:idRelease/recordings/:idIndividual", async function (req, res, next) {

  const url = `https://musicbrainz.org/ws/2/recording/${req.params.idIndividual}?fmt=xml`

    axios.get(url)
    .then(response => {
      const xml = response.data;

      // Parsear el XML
      xml2js.parseString(xml, (err, result) => {
        if (err) {
          console.error(err);
          return err;
        }
        
        const tracks = result.metadata;
        const id = tracks.recording[0].$.id;
        const title = tracks.recording[0].title[0];
        const length = tiempo(tracks.recording[0].length[0]);

        // Crear un objeto para el nuevo XML con los atributos
        const newXmlObj = {
          track: { id, title, length }
        };

        // Convertir el objeto a XML
        const builder = new xml2js.Builder();
        const newXml = builder.buildObject(newXmlObj);

        res.send(newXml);
      });
    });

});


/**
 * Función tiempo(param) que devuelve el tiempo proporcionado en formato mm:ss
 * param: tiempo en segundos
 */
function tiempo(tiempo) {
  const segundos = (Math.floor(tiempo / 1000));
  const minutos = Math.floor(segundos / 60);
  const seg = (segundos % 60);

  return `${minutos}:${seg}`
}

module.exports = router;
