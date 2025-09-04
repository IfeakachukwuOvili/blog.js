require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./public/server/config/db');
const {isActiveRoute} = require('./public/server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT||5000  ;

//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: {maxAge: new Date (Date,now() + (3600000))}
}));


app.use(express.static('public'));

//Templating Engine middleware
app.use(expressLayout); 
// this is a middleware package (manages static files in public dynamically) 
// designed to work with  esxiting templating engines like EJS, Handlebars etc;
// it allows me to eaily manage page layouts dynamically

app.set('layout', './layouts/main'); //this is the defualt layout
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

//this is the routing browser 
app.use('/', require('./public/server/routes/main'));
app.use('/', require('./public/server/routes/admin'));
app.use('/', require('./public/server/routes/contact'));

app.listen(PORT, ()=>{
    console.log(`App listening on port ${PORT}`)
});
