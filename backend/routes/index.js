var express = require("express");
var router = express.Router();
const mongoose = require('mongoose')

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.send('index')
});

module.exports = router;