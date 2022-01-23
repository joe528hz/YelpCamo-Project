const User = require('../models/user');


//FOR REGISTERING ROUTE CONTROLLER
module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs');
}
module.exports.regiter = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
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
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//FOR USER LOGOUT ROUTE CONTROLLER
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}