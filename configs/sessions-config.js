
const mongoose = require('mongoose');                   // require mongoose
const session    = require("express-session");          // require session
const MongoStore = require("connect-mongo")(session);   // require mongostore

module.exports = app => {
  app.use(session({
    secret: process.env.SECRET,                         // reading from .env (SECRET)
    cookie: { maxAge: 60 * 1000 },                      // 60 seconds
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      resave: true,
      saveUninitialized: false,
      ttl: 24 * 60 * 60 // 1 day
    })
  }));
}