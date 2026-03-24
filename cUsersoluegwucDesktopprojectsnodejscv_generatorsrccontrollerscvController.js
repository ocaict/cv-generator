
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
