const prisma = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Fetch user info for personalization
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
        });

        const cvs = await prisma.cV.findMany({
            where: { userId },
            include: { _count: { select: { views: true } } },
            orderBy: { updatedAt: 'desc' }
        });

        const stats = {
            total: cvs.length,
            publicCount: cvs.filter(cv => cv.isPublic).length,
            templateCount: [...new Set(cvs.map(cv => cv.templateId))].length,
            totalViews: cvs.reduce((sum, cv) => sum + cv._count.views, 0)
        };

        const cvsWithTime = cvs.map(cv => ({
            ...cv,
            relativeTime: getRelativeTime(cv.updatedAt),
            strengthScore: calculateProfileStrength(cv.data),
            viewCount: cv._count.views
        }));

        res.render('dashboard/index', { 
            cvs: cvsWithTime, 
            user: user || req.session.user,
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const calculateProfileStrength = (dataStr) => {
    let score = 0;
    let cvData = {};
    try {
        cvData = JSON.parse(dataStr || '{}');
    } catch (e) {
        return 0;
    }
    
    // 1. Personal Info (15%)
    const pi = cvData.personalInfo || {};
    if (pi.firstName && pi.lastName) score += 5;
    if (pi.email && pi.phone) score += 5;
    if (pi.jobTitle) score += 5;
    
    // 2. Summary (20%)
    const summaryText = (pi.summary || '').replace(/<[^>]+>/g, '').trim();
    if (summaryText.length > 100) score += 20;
    else if (summaryText.length > 20) score += 10;
    
    // 3. Experience (30%)
    const exp = cvData.experience || [];
    if (exp.length >= 2) score += 30;
    else if (exp.length === 1) score += 15;
    
    // 4. Education (15%)
    const edu = cvData.education || [];
    if (edu.length >= 1) score += 15;
    
    // 5. Skills (20%)
    const skills = cvData.skills || {};
    let skillSub = 0;
    if (skills.technical && skills.technical.length >= 4) skillSub += 10;
    else if (skills.technical && skills.technical.length >= 1) skillSub += 5;
    if (skills.soft && skills.soft.length >= 3) skillSub += 10;
    else if (skills.soft && skills.soft.length >= 1) skillSub += 5;
    score += skillSub;

    return Math.min(100, score);
};

const getRelativeTime = (date) => {
    const diff = new Date() - new Date(date);
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (day > 0) return day === 1 ? 'Yesterday' : `${day}d ago`;
    if (hr > 0) return `${hr}h ago`;
    if (min > 0) return `${min}m ago`;
    return 'Just now';
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

exports.duplicateCV = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        const original = await prisma.cV.findFirst({
            where: { id: parseInt(id), userId }
        });

        if (!original) {
            req.flash('error_msg', 'Original CV not found');
            return res.redirect('/dashboard');
        }

        await prisma.cV.create({
            data: {
                userId,
                title: `${original.title} (Copy)`,
                templateId: original.templateId,
                themeColor: original.themeColor,
                fontPairing: original.fontPairing,
                density: original.density,
                sidebarPos: original.sidebarPos,
                sidebarStyle: original.sidebarStyle,
                photoStyle: original.photoStyle,
                showHeaderIcons: original.showHeaderIcons,
                data: original.data
            }
        });

        req.flash('success_msg', 'CV duplicated successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to duplicate CV');
        res.redirect('/dashboard');
    }
};

const crypto = require('crypto');

exports.togglePublic = async (req, res) => {
    const { id } = req.params;
    const { isPublic } = req.body;
    const userId = req.session.user.id;

    try {
        const cv = await prisma.cV.findFirst({
            where: { id: parseInt(id), userId }
        });

        if (!cv) {
            return res.status(404).json({ success: false, error: 'CV not found' });
        }

        let publicSlug = cv.publicSlug;
        if (isPublic && !publicSlug) {
            // Create a slug like firstname-lastname-hash or just a clean hash
            const titleSlug = cv.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            publicSlug = `${titleSlug}-${crypto.randomBytes(4).toString('hex')}`;
        }

        const updated = await prisma.cV.updateMany({
            where: { id: parseInt(id), userId },
            data: { isPublic: Boolean(isPublic), publicSlug }
        });

        res.json({ success: true, isPublic: Boolean(isPublic), publicSlug });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to toggle public status' });
    }
};

exports.getPublicCV = async (req, res) => {
    const { slug } = req.params;

    try {
        const cv = await prisma.cV.findUnique({
            where: { publicSlug: slug }
        });

        if (!cv || !cv.isPublic) {
            return res.status(404).render('errors/404', { message: 'This CV is either private or does not exist.' });
        }

        // --- TRIGGER RECRUITER ANALYTICS (Background Log) ---
        (async () => {
            try {
                const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'Local';
                const loc = req.headers['accept-language']?.split(',')[0] || 'Unknown';

                await prisma.cVView.create({
                    data: {
                        cvId: cv.id,
                        ipAddress: ip,
                        userAgent: req.headers['user-agent'] || 'Unknown',
                        location: loc
                    }
                });
            } catch (trackerErr) {
                console.warn("Analytics tracker failed:", trackerErr.message);
            }
        })();

        const cvData = JSON.parse(cv.data || '{}');
        
        // Render a public view utilizing the pdf-view EJS layout but with standard HTML wrapper
        res.render('cv-editor/public-view', { 
            cv, 
            cvData,
            req,
            fullName: `${cvData.personalInfo?.firstName || ''} ${cvData.personalInfo?.lastName || ''}`.trim(),
            locationStr: [cvData.personalInfo?.city, cvData.personalInfo?.nationality].filter(Boolean).join(', ')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAnalytics = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        const cv = await prisma.cV.findFirst({
            where: { id: parseInt(id), userId },
            include: {
                views: {
                    orderBy: { viewedAt: 'desc' },
                    take: 100
                }
            }
        });

        if (!cv) {
            req.flash('error_msg', 'CV not found');
            return res.redirect('/dashboard');
        }

        const stats = {
            totalViews: cv.views.length,
            uniqueIPs: new Set(cv.views.map(v => v.ipAddress)).size,
            topLocations: {},
            topBrowsers: {},
            dailyTrend: {}
        };

        cv.views.forEach(v => {
            const loc = (v.location || 'Unknown').split(',')[0].trim();
            stats.topLocations[loc] = (stats.topLocations[loc] || 0) + 1;
            const ua = v.userAgent || '';
            const browser = ua.includes('Mobile') ? 'Mobile' :
                          ua.includes('Chrome') ? 'Chrome' : 
                          ua.includes('Firefox') ? 'Firefox' :
                          ua.includes('Safari') ? 'Safari' : 'Desktop/Other';
            stats.topBrowsers[browser] = (stats.topBrowsers[browser] || 0) + 1;
            const date = new Date(v.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            stats.dailyTrend[date] = (stats.dailyTrend[date] || 0) + 1;
        });

        res.render('cv-editor/analytics', { cv, stats });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
