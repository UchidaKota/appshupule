const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');

const User = require('../model/User');
const Channel = require('../model/Channel');
const Chat = require('../model/Chat');

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

//チャンネルメンバー画面
router.get('/member', ensureAuth, async (req, res) => {
    try{
        const channel = await Channel.findById({_id: req.session.channel}).lean();
        const channelUsers = await User.find({_id: {$in: channel.joinUsers}}).lean();

        res.render('channel/member.hbs', {
            channelUsers,
            layout: 'main-ch'
        });
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

//チャンネルチャット画面
router.get('/chat', ensureAuth, async (req, res) => {
    try{
        const channel = await Channel.findById({_id: req.session.channel}).lean();
        const channelUsers = await User.find({_id: {$in: channel.joinUsers}}).lean();
        const loggedUser = await User.findById({_id: req.user.id}).lean();
        const chats = await Chat.find({channel: req.session.channel}).populate('user').lean();

        console.log(chats);

        console.log(loggedUser);
        res.render('channel/chat.hbs', {
            channelUsers,
            channel,
            chats,
            userId: loggedUser._id,
            userName: loggedUser.displayName,
            userImage: loggedUser.image,
            layout: 'main-ch'
        });
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

//全体チャンネルに戻る
router.get('/all', ensureAuth, (req, res) => {
    req.session.channel = 'all';
    console.log(req.session.channel);
    res.redirect('/dashboard');
});

module.exports = router;