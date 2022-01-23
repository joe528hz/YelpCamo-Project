const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const Campground = require('../models/campground');
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

//For Index Route
router.get('/', catchAsync(campgrounds.index))

//For Creating Route
router.get('/new', isLoggedIn, campgrounds.renderNewForm)
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

//For Show Route
router.get('/:id', catchAsync(campgrounds.showCampground))

//For Updating Route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
router.put('/:id', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))

//For Deleting Route
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



//FANCY WAY TO RESTRUCTURE ROUTES
// router.route('/')
//     .get(catchAsync(campgrounds.index))
//     .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.route('/:id')
//     .get(catchAsync(campgrounds.showCampground))
//     .put(isLoggedIn, validateCampground, catchAsync(campgrounds.editCampground))
//     .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


module.exports = router;





