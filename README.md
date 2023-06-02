# Songify

## Integrantes
María Calvo, Cristina Balsalobre, Gema Patricia Herrera y Ramón Merchán.

## Temática
Servicio API REST de música, con datos almacenados con MongoBD y peticiones a la API MusicBrainz. 
[URL a la API MusicBrainz](https://musicbrainz.org/doc/About)

## Instalación
Tendrá que tener instalado `nodejs` y `mongodb` en su sistema operativo. 

Se recomienda el uso de `MongoDB Compass` para la creación de la BD, colecciones y carga inicial de los datos. 

Desde la aplicación `MongoDB Compass` deberá seguir estos pasos: 
1. Cree una conexión local a `MongoDB Compass`
2. Cree una base de datos llamada `songify` 
3. Cree dos colecciones en esa base de datos llamadas: `artist` y `release`
4. Carge los datos inciales en ambas colecciones, haciendo click en el botón `add data`, `import JSON or CSV file`
5. Los datos iniciales los encontrará en songify/songifyAPI/data
6. Para la colección `artist` carge el fichero `artists.json`
7. Para la colección `release` carge el fichero `releases.json`


## Ejecución
Sitúese en el directorio raíz del proyecto. 

### Ejecución del servidor
1. Para arrancar el servidor, sitúese en el directorio songify/songifyAPI/ y ejecute los siguientes comandos: 
1.1. Instale los paquetes necesarios con: 
```
npm install
```
1.2. Arranque el servidor con el comando: 
```
npm start
```

### Ejecución del cliente
1. Para arrancar el servidor, sitúese en el directorio songify/songifyAPI/client y ejecute el siguiente comando: 
```
node ./client/client.js
```

