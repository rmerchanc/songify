var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send([        
        {
        "id": 1,
        "name": "Coldplay",
        "type": "Group",
        "area": "United Kingdom",
        "begin_date": "1996-09",
        "url_releases": "https://localhost/api/v3/artist/1/releases",
        "url_recordings": "https://localhost/api/v3/artist/1/recordings"
        }, 
        {
        "id": 2,
        "name": "John Williams",
        "type": "Person",
        "gender": "Male",
        "area": "Australia",
        "begin_date": "1941-04-24",
        "url_releases": "https://localhost/api/v3/artist/2/releases",
        "url_recordings": "https://localhost/api/v3/artist/2/recordings"
        }
    ]);
});

module.exports = router;