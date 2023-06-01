var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const dbo = require('../db/conn');
const { ObjectId } = require('mongodb');
const xml2js = require('xml2js');
const axios = require("axios");
const xmlbuilder = require('xmlbuilder');
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const url = "localhost:" + process.env.PORT + process.env.BASE_URI
const Ajv = require('ajv');
const ajv = new Ajv();
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');


const fs = require('fs');
const artistPOSTPath = './schema/schemaArtistaPOST.json';
const artistPOSTContent = fs.readFileSync(artistPOSTPath, 'utf8');
const artistPUTPath = './schema/schemaArtistaPUT.json';
const artistPUTContent = fs.readFileSync(artistPUTPath, 'utf8');
const releasePOSTPath = './schema/schemaReleasePOST.json';
const releasePOSTContent = fs.readFileSync(releasePOSTPath, 'utf8');
const releasePUTPath = './schema/schemaReleasePUT.json';
const releasePUTContent = fs.readFileSync(releasePUTPath, 'utf8');


/**
 * Get /artist
 * Conexión a MongoDB que devuelve todos los artistas
 */
router.get('/', async (req, res) => {
  const param = req.query.gender;
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {}
  if (next !== undefined && param !== undefined){
    if ((next.length>1) && (param.length>1)){
      query = {$and:[{_id: { $gt: new ObjectId(next) }}, {"gender": param} ]}
    }
  }
  else if (param){
    query = {"gender": param}
  }
  else if (next) {
    query = { _id: { $gt: new ObjectId(next) } }
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('artist')
    .find(query)
    .limit(limit)
    .toArray();
  next = results.length == limit ? results[results.length - 1]._id : null;
  results.forEach((result) =>{
      result.url_release = url + `/artist/${result._id}/release`;  
  });
  if (!results || results.length == 0){
    res.send("404 - Not Found").status(404);
  }
  else{
    res.json({ results, next }).status(200);
  }
});


/**
 * Post /artist
 * Conexión a MongoDB que crea un nuevo artista
 */
router.post('/', async (req, res) => {
  const sol = validarJSON(req.body, JSON.parse(artistPOSTContent));
  console.log(sol)
  if(sol){
    const dbConnect = dbo.getDb();
    console.log(req.body);
    let result = await dbConnect
      .collection('artist')
      .insertOne(req.body);
    res.status(201).send(result);
  } else {
    res.send("400 - Bad request performed by the client due to invalid parameters").status(400);
  }
});


/**
 * Get /artist/{id}
 * Conexión a MongoDB que devuelve un artista a partir de un id
 */
router.get("/:id", async function (req, res, next) {
  const dbConnect = dbo.getDb();
  let query = {_id: new ObjectId(req.params.id)};
  let result = await dbConnect
    .collection('artist')
    .findOne(query)   
  if (!result){
    res.send("404 - Not found").status(404);
  } else {
    result.url_release = url + `/artist/${result._id}/release`;
    res.status(200).send(result);
  }
});


/**
 * Put /artist/{id}
 * Conexión a MongoDB que modifica(actualiza) un artista a partir de un id
 */
router.put("/:id", async function (req, res, next) {
  const query = { _id: new ObjectId(req.params.id) };
  updateObject = generateUpdateObject(req.body);
  const valido = validarJSON(updateObject, JSON.parse(artistPUTContent));
  if (valido) {
    const update = {
      $set: updateObject
    };
    const dbConnect = dbo.getDb();
    let result = await dbConnect
      .collection('artist')
      .updateOne(query, update);
    const sol = await buscarArtista(req.params.id)

    if (!sol) {
      res.send("404 - Not Found").status(404);
    } else {
      res.send(result).status(200);
    }
  } else {
    res.send("400 - Bad request performed by the client due to invalid parameters").status(400);
  }
});


/**
 * Delete /artist/{id}
 * Conexión a MongoDB que borra un artista a partir de un id
 */
router.delete('/:id', async function (req, res, next) {
  const artistId = req.params.id;
  const db = dbo.getDb();
  // Get the artist's id
  const artist = await db.collection('artist').findOne({ _id: new ObjectId(artistId) });
  let artistApiId;
  if(artist){
    artistApiId = artist.id;
  }

  // Delete artist
  const artistResult = await db.collection('artist').deleteOne({ _id: new ObjectId(artistId) });

  if (artistResult.deletedCount > 0) {
    // Delete associated releases
    const releasesResult = await db.collection('release').deleteMany({ id_artist: artistApiId });
    res.status(200).json({ message: 'Artist and associated releases deleted successfully', deletedCount: artistResult.deletedCount, deletedCountReleases: releasesResult.deletedCount });
  } else {
    res.status(404).json({ error: '404 - Artist not found' });
  }
});


/**
 * Get /artist/{id}/release
 * Conexión a MongoDB que devuelve los álbumes de un artista concreto
 */
router.get('/:id/release', async (req, res) => {
  let query = {}
  const dbConnect = dbo.getDb();
  // Establecer el límite
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  // Recuperar el id del artista
  let query_id_artist = { _id: new ObjectId(req.params.id)};
  try {
    let id_artist = await dbConnect
      .collection('artist')
      .find(query_id_artist)
      .project({id: 1})
      .toArray()
    console.log("The artist ID is " + id_artist[0].id);
    query = { id_artist: id_artist[0].id};
    
    // Establecer el parámetro next
    let next = req.query.next;
    if (next) {
      query = { id_artist: id_artist[0].id , _id: { $gt: new ObjectId(next) } };
    }
    
    // Recuperar los álbumes
    let results = await dbConnect
      .collection('release')
      .find(query)
      .limit(limit)
      .toArray()
    next = results.length == limit ? results[results.length - 1]._id : null;
    // Convertirlo a XML
    results_xml = convertXML(results, next.toString())
    // Validar el XML
    if (validateXML(results_xml)){
      res.set('Content-Type', 'application/xml');
      res.status(200).send(results_xml);
    }
  }catch(error){
    res.status(404).send("404 - The specified resource was not found");
  }
});


/**
 * Post /artist/{id}/release
 * Conexión a MongoDB que crea un nuevo álbum para un artista que existe
 */
router.post('/:id/release', async (req, res) => {
  const releaseData = req.body;
  const schema = JSON.parse(releasePOSTContent);
  // Call the validarJSON function with the schema
  const isValid = validarJSON(releaseData, schema);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid release data' });
  }

  const artistId = req.params.id;
  const dbConnect = dbo.getDb();

  try {
    // Check if the artist exists
    const artist = await dbConnect.collection('artist').findOne({ _id: new ObjectId(artistId) });

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Associate the release with the artist
    const release = {
      id: releaseData.id,
      title: releaseData.title,
      date: releaseData.date,
      country: releaseData.country,
      language: releaseData.language,
      id_artist: artist.id
    };

    // Insert the release into the database
    const result = await dbConnect.collection('release').insertOne(release);

    res.status(201).json({ message: 'Release created successfully', releaseId: result.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while creating the release' });
  }
});


/**
 * Get /artist/{id}/release/{id}
 * Conexión a MongoDB que devuelve el álbum de un artista
 * Formato en XML
 */
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
 */
router.put("/:id/release/:idRelease", async function (req, res, next) {
  const query = { _id: new ObjectId(req.params.idRelease) };
  updateObject = generateUpdateObject(req.body);
  const valido = validarJSON(updateObject, JSON.parse(releasePUTContent));
  if (valido) {
    const update = {
      $set: updateObject
    };

    const hayArtista = await buscarArtista(req.params.id);
    const hayRelease = await buscarRelease(req.params.idRelease);

    if (!hayArtista || !hayRelease) {
      res.send("404 - Not Found").status(404);
    } else {
      const dbConnect = dbo.getDb();
      let result = await dbConnect
        .collection('release')
        .updateOne(query, update);
      res.send(result).status(200);
    }
  } else {
    res.send("400 - Bad request performed by the client due to invalid parameters").status(400);
  }
});


/**
 * Delete /artist/{id}/release/{id}
 * Conexión a MongoDB que borra un álbum de un artista
 */
router.delete("/:id/release/:idRelease", async function (req, res, next) {
  const query = { _id: new ObjectId(req.params.idRelease) };
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('release')
    .deleteOne(query);
  if (result.deletedCount === 0) {
    res.status(404).send("404 - Not found");
  } else {
  res.status(200).send(result);
  }
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

/**
 * Función para crear un XML con un JSON
 */
function convertXML(results, next){
  // Build XML structure
  let xml = xmlbuilder.create('response');
  let resultsNode = xml.ele('results');

  results.forEach(result => {
    let resultNode = resultsNode.ele('result');
    // Add properties to the resultNode based on your data structure
    //console.log(result);
    resultNode.ele('_id', result._id.toString());
    resultNode.ele('id', result.id);
    resultNode.ele('title', result.title);
    resultNode.ele('date', result.date);
    resultNode.ele('country', result.country);
    resultNode.ele('language', result.language);
    resultNode.ele('id_artist', result.id_artist);
  });

  xml.ele('next', next);

  // Convert XML to string
  let xmlString = xml.end({ pretty: true });
  return xmlString
}

// Validate an XML according to an XSD
function validateXML(xml_to_validate){
  // Read the XSD schema file
  const xsdPath = './schema/release.xsd';
  const xsdContent = fs.readFileSync(xsdPath, 'utf8');
  // Validator options
  const options = {
    attributeNamePrefix: '',
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    validate: true, // Enable validation
    xsd: xsdPath // Provide the XSD schema
  };
  // Create the validator
  const parser = new XMLParser(options);
  return parser.parse(xml_to_validate);
}

function validarJSON(json, schema) {
  const validar = ajv.compile(schema);
  console.log(validar)
  const valido = validar(json);
  console.log(valido)

  if (!valido) {
    console.log(validar.errors);
    return false;
  }

  return true;
}

async function buscarArtista(id) {
  console.log(id)
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(id) };
  let resultArtista = await dbConnect.collection('artist').findOne(query);
  if (resultArtista) {
    return (true);
  }
  return (false);
}

async function buscarRelease(id) {
  console.log(id)
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(id) };
  let resultRelease = await dbConnect.collection('release').findOne(query);
  if (resultRelease) {
    return (true);
  }
  return (false);
}


function generateUpdateObject(body){
  let objectUpdate = {};
  for (property in body){
    if (property=="_id") next;
    else if (body[property]) objectUpdate[property] = body[property];
  }
  return objectUpdate;
}

module.exports = router;
