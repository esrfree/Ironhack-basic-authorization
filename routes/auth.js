const { Router } = require('express');
const router     = new Router();
const User       = require("../models/user"); // User model
const mongoose   = require('mongoose');

// BCrypt to encrypt passwords
const bcryptjs = require('bcryptjs');
const bcryptSalt = 10;

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
    res.render('auth/signup', { errorMessage: error.message });
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

// User profile page
router.get('/userProfile', (req, res) => res.render('user/user-profile'));

module.exports = router;