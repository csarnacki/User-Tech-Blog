const router = require('express').Router();
const {
    User,
    Post,
    Comment
} = require('../../models');

//Finds a list of users
router.get('/', (req, res) => {
    User.findAll({
            attributes: {
                exclude: ['password']
            }
        })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

//Finds a specific user when searched for
router.get('/:id', (req, res) => {
    User.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                id: req.params.id
            },
            include: [{
                model: Post,
                attributes: ['id', 'title', 'content', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }
        ]
    })
    //Message displayed if no user is found
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404),json({
                message: 'No user found'
            });
            return;
        }
        res.json(dbUserData);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});

//Create a new user including username and password
router.post('/', (req, res) => {
    User.create({
            username: req.body.username,
            password: req.body.password
    })
    //Login credentials are saved and user is set to logged in status
    .then(dbUserData => {
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json(dbUserData);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//Finding the user when on the login page
router.post('/login', (req, res) => {
    User.findOne({
            where: {
                username: req.body.username
            }
        })
        //Message displayed if that user does not exist
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({
                    message: 'No user found'
                });
                return;
            }
            //Storing credential data for the user
            req.session.save(() => {
                req.session.user_id = dbUserData.id;
                req.session.username = dbUserData.username;
                req.session.loggedIn = true;

                res.json({
                    user: dbUserData,
                    message: 'Logged in'
                });
            });

            const validPassword = dbUserData.checkPassword(req.body.password);
            //Validating password
            if (!validPassword) {
                res.status(404).json({
                    message: 'Wrong password'
                });
                return;
            }

            req.session.save(() => {
                req.session.user_id = dbUserData.id;
                req.session.username = dbUserData.username;
                req.session.loggedIn = true;

                res.json({
                    user: dbUserData,
                    message: 'Logged in'
                });
            });
        });
        
});

//Removes the user's session data when they log out
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(200).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;