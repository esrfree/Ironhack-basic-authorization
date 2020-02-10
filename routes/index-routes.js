const express = require('express');
const router  = express.Router();

const routeGuard = require('../configs/route-guard-config');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET the secret page, previous authoration by routeGuard */
router.get('/secret', routeGuard, (req, res) => res.render('user/secret'));

module.exports = router;
