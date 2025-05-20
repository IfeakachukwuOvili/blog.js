require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Adjust the paths below based on your project structure:
const connectDB = require('../main-page/public/server/config/db');
const { isActiveRoute } = require('../main-page/public/server/helpers/routeHelpers');

const app = express();
const PORT = process.env.CMS_PORT || 4000;

// Connect to DB
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
}));

// Serve static files from the main public directory
app.use(express.static(require('path').join(__dirname, '../main-page/public')));

// Templating Engine middleware
app.use(expressLayout);

// Set the admin layout as the default for CMS
app.set('layout', 'layouts/admin');
app.set('views', require('path').join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

// Register only the admin routes for the CMS

// Only serve the CMS admin panel routes
app.use('/', require('./routes/admin'));

// CMS-specific homepage (dashboard or login)
app.get('/', (req, res) => {
    res.render('admin/index', { layout: 'layouts/admin' }); 
});

app.listen(PORT, () => {
    console.log(`CMS server running at http://localhost:${PORT}`);
});