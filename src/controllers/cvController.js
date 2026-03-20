const prisma = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const cvs = await prisma.cV.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.render('dashboard/index', { cvs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCreateCV = (req, res) => {
    res.render('cv-editor/create');
};

exports.postCreateCV = async (req, res) => {
    const { title, templateId } = req.body;
    const userId = req.session.user.id;

    const initialData = {
        personalInfo: { 
            firstName: "", 
            lastName: "", 
            jobTitle: "", 
            summary: "", 
            email: "", 
            phone: "", 
            address: "",
            city: "",
            zipCode: "",
            photo: null,
            dateOfBirth: "",
            nationality: "",
            maritalStatus: "",
            drivingLicense: "",
            linkedin: "",
            website: ""
        },
        education: [],
        experience: [],
        hobbies: [],
        references: [],
        referencesOnRequest: false,
        skills: { technical: [], soft: [] }
    };

    try {
        const newCV = await prisma.cV.create({
            data: {
                userId,
                title,
                templateId,
                data: JSON.stringify(initialData)
            }
        });
        res.redirect(`/cv-editor/${newCV.id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to create CV');
        res.redirect('/dashboard');
    }
};

exports.getEditCV = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        const cv = await prisma.cV.findFirst({
            where: { id: parseInt(id), userId }
        });

        if (!cv) {
            req.flash('error_msg', 'CV not found');
            return res.redirect('/dashboard');
        }

        let cvData = JSON.parse(cv.data || '{}');
        
        // Safety check to ensure all required fields exist
        if (!cvData.personalInfo) cvData.personalInfo = {};
        if (!cvData.experience) cvData.experience = [];
        if (!cvData.education) cvData.education = [];
        if (!cvData.hobbies) cvData.hobbies = [];
        if (!cvData.references) cvData.references = [];
        if (typeof cvData.referencesOnRequest === 'undefined') cvData.referencesOnRequest = false;
        if (!cvData.skills) cvData.skills = { technical: [], soft: [] };

        res.render('cv-editor/editor', { cv, cvData });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};

exports.postUpdateCV = async (req, res) => {
    const { id } = req.params;
    const { data, title, templateId } = req.body;
    const userId = req.session.user.id;

    try {
        await prisma.cV.updateMany({
            where: { id: parseInt(id), userId },
            data: {
                title,
                templateId,
                themeColor: data.themeColor || '#4f46e5',
                fontPairing: data.fontPairing || 'outfit-inter',
                density: data.density || 'standard',
                sidebarPos: data.sidebarPos || 'left',
                sidebarStyle: data.sidebarStyle || 'minimal',
                photoStyle: data.photoStyle || 'rounded',
                showHeaderIcons: data.showHeaderIcons || 'text',
                data: JSON.stringify(data)
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteCV = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        await prisma.cV.deleteMany({
            where: { id: parseInt(id), userId }
        });
        req.flash('success_msg', 'CV deleted successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};
