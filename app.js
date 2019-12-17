//jshint esversion:6
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

// console.log(process.env.API_KEY);


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

// express-session
// tell our app to use session with configuration
app.use(session({
  secret: 'This is my little secret.',
  resave: false,
  saveUninitialized: false
}))

// passport
// tell our app to use passport with session
app.use(passport.initialize());
app.use(passport.session());

// connect mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true, useUnifiedTopology: true} );
mongoose.set('useCreateIndex', true);

// Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// add passport plugin to mongoose
userSchema.plugin(passportLocalMongoose);

// Model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////



app.get("/", function(req, res) {
  res.render("home");
})

app.get("/login", function(req, res) {
  res.render("login");
})

app.post("/login", function(req, res) {
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect('/secrets');
      });
    }
  });

});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/register", function(req, res) {
  res.render("register");
})

app.post("/register", function(req, res) {

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect('/secrets');
      });
    }
  })

});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
