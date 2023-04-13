var express = require('express');
var router = express.Router();

router.get('/artist', function(req, res, next) {
  res.send({repuesta: "Hola a todos"});
});

module.exports = router;