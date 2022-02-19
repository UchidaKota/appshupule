const router = require('express').Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');

const Information = require('../model/Information');
const Channel = require('../model/Channel');

router.get('/', ensureGuest, (req, res) => {
    res.render('login.hbs', {
        layout: 'login'
    });
});

router.get('/dashboard', ensureAuth, async (req, res) => {
    try{
        const informations = await Information.find({user: req.user.id}).lean();

        if(req.session.channel === 'all'){
            res.render('dashboard.hbs', {
                name: req.user.firstName,
                informations,
            });
        }else {
            const channel = await Channel.findOne({_id: req.session.channel}).lean();
            res.render('dashboard.hbs', {
                name: req.user.firstName,
                informations,
                channel,
                layout: 'main-ch'
            });
        }
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

module.exports = router;