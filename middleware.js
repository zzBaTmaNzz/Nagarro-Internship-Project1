//A middleware file used to check whether the user is authenticated or not to visit the page.

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next(); //if authenticated call the next function (written in the route)
}

module.exports = {
    isLoggedIn
}