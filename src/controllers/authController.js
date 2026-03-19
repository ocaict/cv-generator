const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/auth');

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
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        req.flash('success_msg', 'Registration successful! Please login.');
        res.redirect('/auth/login');
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
