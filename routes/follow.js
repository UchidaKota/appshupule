const router = require('express').Router();
const {ensureAuth} = require('../middleware/auth');

const User = require('../model/User');

//follow画面
router.get("/", ensureAuth, async (req, res) => {
    try {
        const followUsers = await User.find({$and:[{_id: {$ne:req.user.id}}, {followers: req.user.id}]}).lean();

        const unFollowUsers = await User.find({$and:[{_id: {$ne:req.user.id}}, {followers: {$ne:req.user.id}}]}).lean();
        
        res.render('follow/follow.hbs', {
            followUsers, unFollowUsers, userId: req.user.id
        });
    } catch (err) {
        console.log(err);
        return res.status(500).render('error/500.hbs');
    }
});

//follow a user
router.post("/:toUserId/:fromUserId", ensureAuth, async (req, res) => {
    if (req.body.toUserId !== req.body.fromUserId) {
        try {
            const user = await User.findById(req.body.toUserId);
            const currentUser = await User.findById(req.body.fromUserId);
            if (!user.followers.includes(req.body.fromUserId)) {
                await user.updateOne({ $push: { followers: req.body.fromUserId } });
                await currentUser.updateOne({ $push: { followings: req.body.toUserId } });
                res.send({values:"フォロー中", msg:"フォローしました"});
            } else {
                res.send({values:"フォロー中", msg:"すでにフォローしています"});
            }
        } catch (err) {
            console.log(err);
            res.status(500).render('error/500.hbs');
        }
    } else {
        res.send({values:"フォローする", msg:"自分自身はフォローできません"});
    }
});
  
//unfollow a user
// router.put("/:id/unfollow", ensureAuth,async (req, res) => {
//     if (req.body.userId !== req.params.id) {
//         try {
//             const user = await User.findById(req.params.id);
//             const currentUser = await User.findById(req.body.userId);
//             if (user.followers.includes(req.body.userId)) {
//                 await user.updateOne({ $pull: { followers: req.body.userId } });
//                 await currentUser.updateOne({ $pull: { followings: req.params.id } });
//                 res.status(200).json("user has been unfollowed");
//             } else {
//                 res.status(403).json("you dont follow this user");
//             }
//         } catch (err) {
//             res.status(500).json(err);
//         }   
//     } else {
//         res.status(403).json("you cant unfollow yourself");
//     }
// });

module.exports = router;