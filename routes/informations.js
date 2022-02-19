const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');
const {stripTags} = require('../helpers/hbs');

const Information = require('../model/Information');
const Comment = require('../model/Comment');
const User = require('../model/User');
const Channel = require('../model/Channel');

//Show add page
router.get('/add', ensureAuth, (req, res) => {
    if(req.session.channel === 'all'){
        res.render('informations/add.hbs');
    }else {
        res.render('informations/add.hbs', {
            layout: 'main-ch'
        });
    }
});

//Process add form
router.post('/add/result', ensureAuth, async (req, res) => {
    try{
        req.body.user = req.user.id;
        req.body.body = stripTags(req.body.body);
        await Information.create(req.body);
        res.redirect('/dashboard');
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//Show all informations
router.get('/', ensureAuth, async (req, res) => {
    try{
        if(req.session.channel === 'all'){
            const informations = await Information.find({status: 'public'})
                .populate('user')
                .sort({createdAt: 'desc'})
                .lean();
            
            res.render('informations/index.hbs', {
                informations,
            });
        }else {
            const channel = await Channel.findById({_id: req.session.channel}).lean();
            const informations = await Information.find({user: {$in: channel.joinUsers}})
                .populate('user')
                .sort({createdAt: 'desc'})
                .lean();
            
            res.render('informations/index.hbs', {
                informations,
                layout: 'main-ch'
            });
        }
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//search informations
router.post('/', ensureAuth, async (req, res) => {
    try{
        const informations = await Information.find({title: {$regex: req.body.search, $options: "i"}})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean();
        
        console.log(informations);

        if(req.session.channel === 'all'){
            res.render('informations/index.hbs', {
                informations,
            });
        }else {
            res.render('informations/index.hbs', {
                informations,
                layout: 'main-ch'
            });
        }
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//Show single information
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let informationViewSet = await Information.findOne({_id: req.params.id});
        console.log(informationViewSet);
        
        //記事の主はノーカン
        if(informationViewSet.user._id != req.user.id){
            await informationViewSet.updateOne({$addToSet: {viewUsers : req.user.id}});
        }

        let informationViewPop = await Information.findOne({_id: req.params.id});
        console.log(informationViewPop);
        
        console.log(informationViewPop.viewUsers.length);
         //最大3人まで
        if(informationViewPop.viewUsers.length > 3){
            await informationViewPop.updateOne({$pop: {viewUsers: -1}});
        }

        const information = await Information.findById(req.params.id).populate('user').lean();
        console.log(information);
        if (!information) {
            return res.render('error/404.hbs');
        }

        const viewUsers = await User.find({_id: {$in: information.viewUsers}}).lean();
        console.log(viewUsers);
        if (!viewUsers) {
            return res.render('error/404.hbs');
        }

        const comment = await Comment.find({information: req.params.id}).populate('user').lean();
        console.log(comment);
        if (!comment) {
            return res.render('error/404.hbs');
        }

        console.log(req.user);
        if(req.user.followings.includes(information.user._id)){
            msg = "フォロー中";
        }else {
            msg = "フォローする";
        }

        if(req.session.channel === 'all'){
            res.render('informations/show.hbs', {
                information, comment, viewUsers, userId: req.user.id, followMsg: msg
            });
        }else {
            res.render('informations/show.hbs', {
                information, comment, viewUsers, userId: req.user.id, followMsg: msg,
                layout: 'main-ch'
            });
        }
    } catch (err) {
      console.error(err);
      return res.render('error/404.hbs');
    }
});

//Show edit page
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try{
        const information = await Information.findOne({
            _id: req.params.id
        }).lean();
    
        if(!information){
            return res.render('error/404.hbs');
        }
    
        if(information.user != req.user.id){
            res.redirect('/informations');
        }else{
            if(req.session.channel === 'all'){
                res.render('informations/edit.hbs', {
                    information
                });
            }else {
                res.render('informations/edit.hbs', {
                    information,
                    layout: 'main-ch'
                });
            }
        }
    } catch(err){
        console.error(err);
        return res.render('error/500.hbs');
    }
});

//Update information
router.put('/:id', ensureAuth, async (req, res) => {
    try{
        let information = await Information.findById(req.params.id).lean();

        if(!information){
            return res.render('error/404.hbs');
        }

        if(information.user != req.user.id){
            res.redirect('/informations');
        }else{
            information = await Information.findOneAndUpdate({_id: req.params.id}, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.redirect('/dashboard');
    } catch(err){
        console.error(err);
        return res.render('error/500.hbs');
    }
});

//Delete information
router.delete('/:id', ensureAuth, async (req, res) => {
    try{
        let information = await Information.findById(req.params.id).lean();

        if (!information) {
            return res.render('error/404.hbs');
        }
      
        if (information.user != req.user.id) {
            res.redirect('/informations');
        } else {
            await Information.deleteOne({ _id: req.params.id });
            res.redirect('/dashboard');
        }
    } catch(err){
        console.log(err);
        return res.render('error/500.hbs');
    }
});

//User informations
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const informations = await Information.find({
            user: req.params.userId,
            status: 'public',
        })
        .populate('user')
        .lean();
  
        if(req.session.channel === 'all'){
            res.render('informations/index.hbs', {
                informations,
            });
        }else {
            res.render('informations/index.hbs', {
                informations,
                layout: 'main-ch'
            });
        }
    } catch (err) {
        console.error(err);
        return res.render('error/500.hbs');
    }
});

module.exports = router;