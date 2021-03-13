require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;

module.exports.load = client => {

    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
    
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.engine("html", require("ejs").renderFile);
    app.set('view-engine', 'ejs');
    app.use(express.static(path.join(__dirname, "/website")));
    app.use(express.static(path.join(__dirname, "/public")))
    app.set("views", path.join(__dirname, "views"))
    app.use(function(req, res, next) {
        req.bot = client;
        next();
    });

    app.use(
        session({
            secret: "%#@!@#%",
            resave: false,
            saveUninitialized: false
        })
    )
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    const scopes = ['identify', 'guilds'];
    passport.use(new DiscordStrategy({
        clientID: process.env.ID,
        clientSecret: process.env.SECRET,
        callbackURL: `http://localhost:${PORT}/callback`,
        scope: scopes
    }, async (accessToken, refreshToken, profile, done) => {
        process.nextTick(async () => {
            console.log(profile);
            return done(null, profile);
        });
    }));

    app.use('/', require('./routes/home'));
    
    app.get('/login', passport.authenticate('discord'));
    app.get('/callback', passport.authenticate('discord', {
        failureRedirect: '/error',
        successRedirect: '/profile'
    }), (req, res) => {
        res.sendStatus(200);
    });

    app.listen(PORT, () => console.log(`Dashboard is now listening at port ${PORT}!`));
}