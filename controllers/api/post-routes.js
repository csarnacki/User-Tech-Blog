const router = require('express').Router();
const {
    User,
    Post, 
    Comment
} = require('../../models');
const withAuth = require('../../utils/auth');

//Sorting posted comments in descending order
router.get('/', (req, res) => {
    Post.findAll({
            attributes: ['id', 'content', 'title', 'created_at'],
            order: [
                ['created_at', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['username'],
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username'],
                },
            },
        ],
    })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
        console.log(err);
        res.json(500).json(err);
    });
});


//Pulling out one specific post when selected
router.get('/:id', (req, res) => {
    Post.findOne({
            where: {
                id: req.params.id,
            },
            attributes: ['id', 'content', 'title', 'created_at'],
            include: [{
                model: User,
                attributes: ['username'],
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username'],
                },
            },
        ],   
    })
    //If that post is not found display this message
    .then((dbPostData) => {
        if (!dbPostData) {
            res.status(404).json({
                message: 'No post found'
            });
            return;
        }
        res.json(dbPostData);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});

//Updating the post content when selected by the user
router.put('/:id', withAuth, (req, res) => {
    Post.update({
            title: req.body.title,
            content: req.body.post_content,
    }, {
        where: {
            id: req.params.id,
        },
    })
    //If that post is not found display this message
    .then((dbPostData) => {
        if (!dbPostData) {
            res.status(404).json({
                message: 'No post found'
            });
            return;
        }
        res.json(dbPostData);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});

//Deleting a selected post
router.delete('/:id', withAuth, (req, res) => {
    Post.destroy({
            where: {
                id: req.params.id,
            },
        })
        //Message displayed if that post does not exist
        .then((dbPostData) => {
            if (!dbPostData) {
                res.status(404).json({
                    message: 'No post found'
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;