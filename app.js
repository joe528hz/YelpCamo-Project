if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// require('dotenv').config();


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//checking for mongoose connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate); //for defining a boilerplate
app.set('view engine', 'ejs'); // for templating
app.set('views', path.join(__dirname, 'views')); //for global directory flow

app.use(express.urlencoded({ extended: true }));// for body parser
app.use(methodOverride('_method')); // for overiding the method in forms
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());//sanitizing to remove data using the defaults operators of mongo

//creating store for sessions
const secret = process.env.SECRET || 'theseshouldbeabettersecret'
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
})
store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})

//SETTING UP SESSION CONFIGURATION
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires after a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) //for sessions (statefulness of the web app)
app.use(flash()); //for flash messages

// app.use(helmet({ contentSecurityPolicy: false }));
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dzmsaohtz/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dzmsaohtz/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dzmsaohtz/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dzmsaohtz/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzmsaohtz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
            childSrc: ["blob:"]
        }
    })
);

//for authentication and authorization (refer to passport docs)
app.use(passport.initialize());
app.use(passport.session());// for persistent login sessions (make sure to put these after session middleware)
passport.use(new LocalStrategy(User.authenticate())); //authenticating the user model (refer to passport-local-mongoose docs)
passport.serializeUser(User.serializeUser());//basically how to store a user in a session
passport.deserializeUser(User.deserializeUser())//basically how to remove a user from a session


//FOR FLASH SESSION MIDDLEWARE
app.use((req, res, next) => {
    if (!['/login', '/', '/register'].includes(req.originalUrl)) { //to see the full path of the routes
        req.session.returnTo = req.originalUrl; //creating an object in session named returnTo and store the full path in every session
    }
    res.locals.currentUser = req.user; // from passport helper method
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//FOR CAMPGROUNDS, REVIEWS, USER ROUTES
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

//FOR HOME ROUTE
app.get('/', (req, res) => {
    res.render('home.ejs');
})

//FOR 404 ROUTE
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//FOR ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error.ejs', { err });
})

//FOR LISTENING
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})