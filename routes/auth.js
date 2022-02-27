const router = require('express').Router();
const passport = require('passport');

//Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

//Google auth callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
        // ログイン完了、チャンネルを全体に設定
        req.session.channel = 'all';
        console.log(req.session.channel);
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;