const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Campground = require('../models/campground');
const Review = require('../models/review');



//FOR CREATING REVIEW ROUTE (POST ROUTE)
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//FOR DELETING REVIEWS ROUTE
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;