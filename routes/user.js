const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users')
const catchAsync = require('../utils/catchAsync');
const campground = require('../models/campground');

//FOR REGISTERING ROUTE
router.get('/register', users.renderRegister)
router.post('/register', catchAsync(users.regiter))

//FOR USER LOGIN ROUTE
router.get('/login', users.renderLogin)
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

//FOR USER LOGOUT ROUTE
router.get('/logout', users.logout)


//FANCY WAY TO RESTRUCTURE ROUTES
// router.route('/register')
//     .get(users.renderRegister)
//     .post(catchAsync(users.regiter))

// router.route('/login')
//     .get('/login', users.renderLogin)
//     .post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// router.get('/logout', users.logout)

module.exports = router;