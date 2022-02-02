require('dotenv').config({path: __dirname + '/../.env'});
const passport = require('passport');
const User = require('../models/userModel');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const inProduction = process.env.NODE_ENV === "production";
const AUTH_REDIRECT_URL = inProduction ? process.env.DOMAIN_NAME : "http://localhost:5000";


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: AUTH_REDIRECT_URL + "/auth/google/social-media"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ username: profile.emails[0].value, googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));