const User = require('../models/user');


//FOR REGISTERING ROUTE CONTROLLER
module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs');
}
module.exports.regiter = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); //.register is a function from passport local
        req.login(registeredUser, err => { // .login is a helper method from passport
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

//FOR USER LOGIN ROUTE CONTROLLER
module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs');
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back To Yelp Camp!');
    const redirectUrl = req.session.returnTo || '/campgrounds' // returning the user to the path or route where he was before logging in
    delete req.session.returnTo; // delete the the full path stored in returnTo object
    res.redirect(redirectUrl);
}

//FOR USER LOGOUT ROUTE CONTROLLER
module.exports.logout = (req, res) => {
    req.logout(); //helper method from password automatically added in request object
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}