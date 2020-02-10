const { Router } = require('express');
const router     = new Router();
const User       = require("../models/user"); // User model
const mongoose   = require('mongoose');

// Middleware
const routeGuard = require('../configs/route-guard-config');

// BCrypt to encrypt passwords
const bcryptjs = require('bcryptjs');
const bcryptSalt = 10;

/************ AUTHORIZATION **************/

/* GET signup page */
router.get('/signup', (req, res, next) => {
  res.render('./auth/signup');
});

// POST create a new user
router.post('/signup', (req, res, next) => {

  const { username, email, password } = req.body;

  // make sure there is no empty strings
  if(!username || !email || !password) {
    res.render('auth/signup', {
      errorMessage: 'All fields are mandatory. Please provide your username, email and password.'
    });
    return;
  }

  // make sure passwords are strong:
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

// Create the new user
  bcryptjs
  .genSalt(bcryptSalt)
  .then( salt => bcryptjs.hash( password, salt ) )
  .then( hashedPass => {
    return User.create({
      username,
      email,
      passwordHash: hashedPass
    })
  })
  .then( userFromDB => {
    console.log('Newly created user is: ', userFromDB);
    res.redirect('/userProfile');
  })
  .catch(error => {
    console.log( error.message);
    res.render('auth/signup', { errorMessage: error.message });  // using mongoose-unique-validator implemented in the model
    //if (error instanceof mongoose.Error.ValidationError) {
    //  res.status(500).render('auth/signup', { errorMessage: error.message });
    //} 
    //else if (error.code === 11000) {
    //  res.status(500).render('auth/signup', { 
    //     errorMessage: 'Username and email need to be unique. Either username or email is already used.'});
    //} 
    //else {
    //  next(error)
    //}
    
  })
})

/************ AUTHENTICATION **************/

// GET login page
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

// POST user authentication (login)
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  if ( !username || !password ) {
    res.render("auth/login", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }

  User.findOne( { username })
  .then( user => {
    if ( !user ) {
      res.render('auth/login', { errorMessage: `The username doesn't exists.`});
      return;
    }
    else if ( bcryptjs.compareSync( password, user.passwordHash )) {      
      req.session.currentUser = user;                           //Save the login in the session!
      res.redirect('/userProfile')
    }
    else {
      res.render('auth/login', { errorMessage: `Incorrect password.`})
    }
  })
  .catch( err => next( err ))
});

// POST logout
router.post('/logout', routeGuard, (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// GET user profile page
router.get('/userProfile', routeGuard, (req, res) => {
  res.render( 'user/user-profile')
})

module.exports = router;