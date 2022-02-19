const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');

const Channel = require('../model/Channel');

//チャンネル画面表示
router.get('/', ensureAuth, async (req, res) => {
    try{
        const channels = await Channel.find({joinUsers: req.user.id})
            .populate('owner')
            .sort({createdAt: 'desc'})
            .lean();
        
        if(req.session.channel === 'all'){
            res.render('channel/index.hbs', {
                channels,
            });
        }else {
            res.render('channel/index.hbs', {
                channels,
                layout: 'main-ch'
            });
        }
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//チャンネル参加
router.get('/join/:id', ensureAuth, async (req, res) => {
    try{
        req.session.channel = req.params.id;
        console.log(req.session.channel);
        res.redirect('/dashboard');
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

//チャンネル作成
router.post('/add', ensureAuth, async (req, res) => {
    try{
        req.body.owner = req.user.id;
        req.body.joinUsers = req.user.id;
        await Channel.create(req.body);
        res.redirect('/channel');
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//チャンネル検索画面
router.get('/search', ensureAuth, async (req, res) => {
    try{
        if(req.session.channel === 'all'){
            res.render('channel/search.hbs');
        }else {
            res.render('channel/search.hbs', {
                layout: 'main-ch'
            });
        }
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

//チャンネル検索
router.post('/search/result', ensureAuth, async (req, res) => {
    try{
        const channel = await Channel.findOne({name: req.body.name});
        if(!channel){
            return res.render('error/404.hbs');
        }

        await channel.updateOne({$addToSet: {joinUsers: req.user.id }});

        res.redirect('/channel');
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

module.exports = router;