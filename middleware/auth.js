// check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/login');
    }   
}

module.exports = {isLoggedIn};


