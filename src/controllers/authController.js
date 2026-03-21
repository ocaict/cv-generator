const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/auth');
const supabase = require('../config/supabase');

exports.getRegister = (req, res) => {
    res.render('auth/register');
};

exports.postRegister = async (req, res) => {
    const { email, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/auth/register');
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            req.flash('error_msg', 'Email already exists');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        // Auto-login
        req.session.user = { id: newUser.id, email: newUser.email };
        req.flash('success_msg', 'Welcome! Your account has been created.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/auth/register');
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        req.session.user = { id: user.id, email: user.email };
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/auth/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// Supabase Google Auth
exports.supabaseGoogleLogin = async (req, res) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${req.protocol}://${req.get('host')}/auth/supabase/callback`
        }
    });

    if (error) {
        req.flash('error_msg', 'Social login failed: ' + error.message);
        return res.redirect('/auth/login');
    }

    res.redirect(data.url);
};

exports.supabaseCallback = async (req, res) => {
    // Supabase redirects to this URL with code in the hash or query
    const { code } = req.query;

    if (!code) {
        return res.redirect('/auth/login');
    }

    try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
            req.flash('error_msg', 'Failed to exchange auth code');
            return res.redirect('/auth/login');
        }

        const supabaseUser = data.user;
        const email = supabaseUser.email;

        // Sync with local User table
        let localUser = await prisma.user.findUnique({ where: { email } });
        
        if (!localUser) {
            // Create user if not exists (using a placeholder password since it's OAuth)
            localUser = await prisma.user.create({
                data: {
                    email,
                    password: 'oauth_user', // Fixed placeholder for OAuth accounts
                    name: supabaseUser.user_metadata.full_name || ''
                }
            });
        }

        // Set session
        req.session.user = { id: localUser.id, email: localUser.email, supabaseId: supabaseUser.id };
        
        req.flash('success_msg', 'Successfully logged in with Google!');
        res.redirect('/dashboard');

    } catch (err) {
        console.error("Supabase Callback Error:", err);
        req.flash('error_msg', 'Internal auth error');
        res.redirect('/auth/login');
    }
};

exports.supabaseVerify = async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ error: 'No token provided' });
    }

    try {
        // Use the token to get the user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const email = user.email;

        // Sync with local User table
        let localUser = await prisma.user.findUnique({ where: { email } });
        
        if (!localUser) {
            localUser = await prisma.user.create({
                data: {
                    email,
                    password: 'oauth_user',
                    name: user.user_metadata.full_name || ''
                }
            });
        }

        // Set session
        req.session.user = { id: localUser.id, email: localUser.email, supabaseId: user.id };
        
        return res.json({ success: true, redirect: '/dashboard' });

    } catch (err) {
        console.error("Token Verification Error:", err);
        return res.status(500).json({ error: 'Server error during verification' });
    }
};
