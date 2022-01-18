const router = require('express').Router();
const passport = require('passport');

//Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

//Google auth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;