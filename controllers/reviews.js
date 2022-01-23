const Campground = require('../models/campground');
const Review = require('../models/review');


//FOR CREATING REVIEW ROUTE (POST ROUTE) CONTROLLER
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review')
    res.redirect(`/campgrounds/${campground._id}`)
}

//FOR DELETING REVIEWS ROUTE CONTROLLER
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review')
    res.redirect(`/campgrounds/${id}`);
}