const passport = require('passport');

// This middleware will halt the request if the token is missing or invalid.
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = requireAuth;