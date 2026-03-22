setInterval(() => {}, 1000); // Keep-alive hack for debugging
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.SESSION_SECRET) {
    console.error('\x1b[31m[ERROR]\x1b[0m SESSION_SECRET is not defined. Please set it in your .env file.');
    process.exit(1);
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Set to true if using HTTPS
}));

app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const authRoutes = require('./src/routes/auth');
const cvRoutes = require('./src/routes/cv');
const aiRoutes = require('./src/routes/ai');

app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/', cvRoutes);

// Landing page
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('index');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${err.stack}`);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message || 'Something broke!';
    
    res.status(statusCode).send(message);
});

process.on('exit', (code) => {
    console.log(`\x1b[31m[DEBUG]\x1b[0m Process is exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error(`\x1b[31m[DEBUG]\x1b[0m Uncaught Exception:`, err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`\x1b[31m[DEBUG]\x1b[0m Unhandled Rejection at:`, promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`\x1b[32m[Server]\x1b[0m CV Generator is running on http://localhost:${PORT}`);
});
