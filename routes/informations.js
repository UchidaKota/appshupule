const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');
const {stripTags} = require('../helpers/hbs');

const Information = require('../model/Information');
const Comment = require('../model/Comment');

//Show add page
router.get('/add', ensureAuth, (req, res) => {
    res.render('informations/add.hbs');
});

//Process add form
router.post('/', ensureAuth, async (req, res) => {
    try{
        req.body.user = req.user.id;
        req.body.body = stripTags(req.body.body);
        await Information.create(req.body);
        res.redirect('/dashboard');
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
    }
});

//Show single information
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let information = await Information.findById(req.params.id).populate('user').lean();
    
        if (!information) {
            return res.render('error/404.hbs');
        }

        let comment = await Comment.find({information: req.params.id}).lean();

        console.log(information);
        console.log(comment);

        console.log(req.user);
        res.render('informations/show.hbs', {
            information, comment, userid: req.user.id, username: req.user.firstName
        });

    } catch (err) {
      console.error(err);
      res.render('error/404.hbs');
    }
});

//Show all informations
router.get('/', ensureAuth, async (req, res) => {
    try{
        const informations = await Information.find({status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean();
        
        res.render('informations/index.hbs', {
            informations,
        });
    } catch(err){
        console.log(err);
        res.render('error/500.hbs');
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
            res.render('informations/edit', {
                information
            });
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
  
        res.render('informations/index.hbs', {
            informations,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500.hbs');
    }
});

module.exports = router;