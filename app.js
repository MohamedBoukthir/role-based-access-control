const express = require('express')
const morgan = require('morgan')
const mongoose = require ('mongoose')
const createHttpErrors = require('http-errors')

//config
require('dotenv').config()
const app = express()
app.use(morgan('dev'))
app.set('view engine' , 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


//routes
app.use('/' , require('./routes/route'));
app.use('/user' , require('./routes/user'));
app.use('/auth' , require('./routes/auth'));


//error handler
app.use((req , res , next) =>{
    next(createHttpErrors.NotFound())
});
app.use((error , req , res , next) => {
    error.status = error.status || 500 
    res.status(error.status);
    res.render('error_40x' , {error})
});


//database - app listen 

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI , {
    dbName: process.env.DB_NAME,
    useNewUrlparser: true,
    useUnifiedTopology:true,
        })
        .then(() => {
            console.log('Database connected...');
        })
        .catch((err) => console.log(err.message));

app.listen(PORT , () =>   
        console.log(`app listen on ${PORT}`)
        );