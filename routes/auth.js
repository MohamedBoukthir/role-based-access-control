const router = require('express').Router()
const { body , validationResult } = require('express-validator')
const User = require('../models/user')

router.get('/login' , async (req , res , next ) => {
    res.render('Login')
});

router.post('/login' , async (req , res , next ) => {
    res.send('Login post')
});

router.get('/register' , async (req , res , next ) => {
    res.render('Register')
});

router.post('/register' , [

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

router.get('/logout' , async (req , res , next ) => {
    res.send('Logout')
});


module.exports = router