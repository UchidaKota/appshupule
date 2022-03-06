const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');
const {stripTags} = require('../helpers/hbs');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

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
    req.body.body = stripTags(req.body.body);
    const information = new Information({
        title: req.body.title,
        keyword: req.body.keyword,
        body: req.body.body,
        status: req.body.status,
        user: req.user.id
    });
    saveCover(information, req.body.cover);

    try {
        await information.save();
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
        if(req.session.channel === 'all'){
            const informations = await Information.find({$or: [
                {title: {$regex: req.body.search, $options: "i"}},
                {keyword: {$regex: req.body.search, $options: "i"}}
            ], status: 'public'})
                .populate('user')
                .sort({createdAt: 'desc'})
                .lean();

            res.render('informations/index.hbs', {
                informations,
            });
        }else {
            const channel = await Channel.findById({_id: req.session.channel}).lean();
            const informations = await Information.find({$and: [
                {$or: [
                    {title: {$regex: req.body.search, $options: "i"}},
                    {keyword: {$regex: req.body.search, $options: "i"}}
                ]},
                {user: {$in: channel.joinUsers}}
            ]})
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

//Show single information
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let informationViewSet = await Information.findOne({_id: req.params.id});
        
        //記事の主はノーカン
        if(informationViewSet.user._id != req.user.id){
            await informationViewSet.updateOne({$addToSet: {viewUsers : req.user.id}});
        }

        let informationViewPop = await Information.findOne({_id: req.params.id});
        
         //最大3人まで
        if(informationViewPop.viewUsers.length > 3){
            await informationViewPop.updateOne({$pop: {viewUsers: -1}});
        }

        const information = await Information.findById(req.params.id).populate('user').lean({virtuals: true});
        if (!information) {
            return res.render('error/404.hbs');
        }

        const viewUsers = await User.find({_id: {$in: information.viewUsers}}).lean();
        if (!viewUsers) {
            return res.render('error/404.hbs');
        }

        const comment = await Comment.find({information: req.params.id}).populate('user').lean();
        if (!comment) {
            return res.render('error/404.hbs');
        }

        if(req.user.followings.includes(information.user._id)){
            msg = "フォロー中";
        }else {
            msg = "フォローする";
        }

        const loggedUser = await User.findById({_id: req.user.id}).lean();

        if(req.session.channel === 'all'){
            res.render('informations/show.hbs', {
                information, 
                comment, 
                viewUsers, 
                followMsg: msg,
                userId: loggedUser._id,
                userName: loggedUser.displayName,
                userImage: loggedUser.image,
            });
        }else {
            res.render('informations/show.hbs', {
                information,
                comment, 
                viewUsers, 
                followMsg: msg,
                userId: loggedUser._id,
                userName: loggedUser.displayName,
                userImage: loggedUser.image,
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
        }).lean({virtuals: true});
    
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
    try {
        const information = await Information.findOne({_id: req.params.id}).lean();
        const cover = saveEditCover(information, req.body.cover);

        if (information.user != req.user.id) {
            res.redirect('/informations');
        } else {
            req.body.body = stripTags(req.body.body);
            const updateInfo = {
                title: req.body.title,
                keyword: req.body.keyword,
                body: req.body.body,
                status: req.body.status,
                user: req.user.id,
                coverImage: cover.coverImage,
                coverImageType: cover.coverImageType
            }

            await Information.updateOne({_id: req.params.id}, updateInfo, {
                new: true,
                runValidators: true,
            });
        
            res.redirect('/dashboard')
        }
    } catch(err){
        console.log(err);
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
        if(req.session.channel === 'all'){
            const informations = await Information.find({
                user: req.params.userId,
                status: 'public',
            }).populate('user').lean();

            res.render('informations/index.hbs', {
                informations,
            });
        }else {
            const informations = await Information.find({
                user: req.params.userId,
            }).populate('user').lean();

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

function saveCover(information, coverEncoded) {
    if (coverEncoded == '') return;
    
    coverEncoded = stripTags(coverEncoded);
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        information.coverImage = new Buffer.from(cover.data, 'base64');
        information.coverImageType = cover.type;
    }
}

function saveEditCover(information, coverEncoded) {
    if (coverEncoded == ''){
        let coverImage = information.coverImage;
        let coverImageType = information.coverImageType;
        return {coverImage, coverImageType};
    } else{
        coverEncoded = stripTags(coverEncoded);
        const cover = JSON.parse(coverEncoded);
        if (cover != null && imageMimeTypes.includes(cover.type)) {
            let coverImage = new Buffer.from(cover.data, 'base64');
            let coverImageType = cover.type;
            return {coverImage, coverImageType};
        }
    }
}

module.exports = router;