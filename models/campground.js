const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

//for image Schema 
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//for image virtuals, smaller images in edit form 
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

//for stringify virtuals and included it to JSON 
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

//for clustering map virtuals
CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
    `
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);