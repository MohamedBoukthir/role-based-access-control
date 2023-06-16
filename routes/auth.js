const router = require('express').Router()
const { body , validationResult } = require('express-validator')
const User = require('../models/user')
const passport = require('passport')


router.get('/login' , ensureNOTAuthenticated , async (req , res , next ) => {
    res.render('Login')
});


router.post('/login' , ensureNOTAuthenticated,
                passport.authenticate ('local', {
                successRedirect : "/user/profile",
                failureRedirect: "/auth/login",
                failureFlash: true,
})
);


router.get('/register' , ensureNOTAuthenticated , async (req , res , next ) => {
    res.render('Register')
});


router.post('/register' , ensureNOTAuthenticated,
[

    body('email')
        .trim()
        .isEmail()
        .withMessage('Email Invalid')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .trim()
        .isLength(8)
        .withMessage('Min 8 Char'),

    body('password2').custom( ( value , {req} ) => {
        if (value !== req.body.password ) {
            throw new Error ('Password do not match')
        }
        return true;
    }),
],

    async (req , res , next ) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                errors.array().forEach(error => {
                    req.flash('error' , error.msg)
                })
                res.render('register' , { 
                    email: req.body.email,
                    messages: req.flash()
                })
                return;
            }

            const { email } = req.body
            const doesExist = await User.findOne({email});
            if (doesExist) {
                res.redirect('/auth/register')
                return
            }
            const user = new User(req.body)
            await user.save()
            req.flash('success' , `${user.email} registered succesfully , you can logain now`);
            res.redirect('/auth/login')
        } catch (error) {
            next(error)
        }
});

router.get('/logout', ensureAuthenticated , function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


module.exports = router


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/auth/login');
    }
 }

 function ensureNOTAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('back')
    } else {
        next();
    }
 }