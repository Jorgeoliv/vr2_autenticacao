var express = require('express');
var router = express.Router();
const UserModel = require('../models/user')
const fs = require('fs')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login')
});


router.get('/registo', function(req, res, next) {
  res.render('registo')
});

module.exports = router;
