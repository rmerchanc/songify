var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");

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

router.get("/:id", function (req, res, next) {
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
        url_releases: "https://localhost/api/v3/artist/1/releases",
        url_recordings: "https://localhost/api/v3/artist/1/recordings",
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = router;
