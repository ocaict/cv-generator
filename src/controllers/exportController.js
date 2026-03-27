const puppeteer = require('puppeteer');
const prisma = require('../config/db');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ListLevel, BorderStyle, Table, TableRow, TableCell, WidthType } = require('docx');

exports.exportPDF = async (req, res) => {
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

        const cvData = JSON.parse(cv.data);
        
        // Render the HTML using Express native render to string
        req.app.render('cv-editor/pdf-view', { 
            cv, 
            cvData, 
            layout: false 
        }, async (err, html) => {
            if (err) {
                 console.error(err);
                 return res.status(500).send('Render Error');
            }

            try {
                // Launch Puppeteer to generate PDF from HTML string
                const browser = await puppeteer.launch({
                    headless: "new",
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: 'networkidle0' });
                
                const pdf = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
                });

                await browser.close();

                // Send the PDF buffer to client
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${cv.title.replace(/\s+/g, '_')}.pdf"`,
                    'Content-Length': pdf.length
                });

                res.send(pdf);
            } catch (pdfErr) {
                console.error(pdfErr);
                res.status(500).send('PDF Engine Error: ' + pdfErr.message);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('System Error');
    }
};

exports.exportDOCX = async (req, res) => {
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

        const cvData = JSON.parse(cv.data);
        
        // Generate pure semantic HTML structure for DOCX parser to prevent Word XML corruption
        const { personalInfo, experience, education, skills, hobbies, references, referencesOnRequest } = cvData;
        const themeColor = cvData.themeColor || '#4f46e5';

        let docxHtml = `
            <!DOCTYPE html><html><head><style>
            body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #222222; }
            h1 { font-size: 24pt; text-align: left; text-transform: uppercase; margin-bottom: 4pt; color: #111; }
            h2 { font-size: 13pt; color: ${themeColor}; border-bottom: 1.5px solid ${themeColor}; padding-bottom: 2pt; margin-top: 16pt; margin-bottom: 8pt; text-transform: uppercase; letter-spacing: 1px; }
            p { margin: 0 0 4pt 0; line-height: 1.4; font-size: 11pt; }
            .header-info { font-size: 10pt; margin-bottom: 15pt; color: #555; }
            .job-title { font-weight: bold; font-size: 11pt; color: #111; }
            .company { font-weight: bold; font-style: italic; color: #444; }
            .date { font-size: 10pt; color: #666; margin-bottom: 4pt; }
            ul { margin-top: 2pt; margin-bottom: 8pt; margin-left: 20pt; padding-left: 0; list-style-type: disc; }
            li { margin-bottom: 3pt; font-size: 11pt; }
            .content-block { margin-bottom: 12pt; }
            </style></head><body>
        `;

        // Header Info
        const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Your Name';
        docxHtml += `<h1>${name}</h1>`;
        
        let details = [];
        if (personalInfo.jobTitle) details.push(`<strong>${personalInfo.jobTitle}</strong>`);
        if (personalInfo.email) details.push(personalInfo.email);
        if (personalInfo.phone) details.push(personalInfo.phone);
        if (personalInfo.city || personalInfo.address) details.push([personalInfo.city, personalInfo.address].filter(Boolean).join(', '));
        if (personalInfo.linkedin) details.push(personalInfo.linkedin);
        if (personalInfo.website) details.push(personalInfo.website);
        
        docxHtml += `<p class="header-info">${details.join("  |  ")}</p>`;

        // Summary
        if (personalInfo.summary && personalInfo.summary.trim() !== '') {
            docxHtml += `<h2>Professional Summary</h2>`;
            docxHtml += `<div class="content-block">${personalInfo.summary}</div>`;
        }

        // Experience
        if (experience && experience.length > 0) {
            docxHtml += `<h2>Experience</h2>`;
            experience.forEach(exp => {
                const dates = `${exp.startMonth || ''} ${exp.startYear || ''} - ${exp.isPresent ? 'Present' : (exp.endMonth || '') + ' ' + (exp.endYear || '')}`.trim();
                docxHtml += `<p><span class="job-title">${exp.jobTitle}</span> — <span class="company">${exp.company}</span></p>`;
                docxHtml += `<p class="date">${dates}</p>`;
                if (exp.responsibilities) docxHtml += `<div class="content-block">${exp.responsibilities}</div>`;
            });
        }

        // Education
        if (education && education.length > 0) {
            docxHtml += `<h2>Education</h2>`;
            education.forEach(edu => {
                const dates = `${edu.endMonth || ''} ${edu.endYear || ''}`.trim();
                docxHtml += `<p><span class="job-title">${edu.degree}</span></p>`;
                docxHtml += `<p class="company">${edu.school} <span class="date" style="font-weight:normal;">(${dates})</span></p>`;
                if (edu.description) docxHtml += `<div class="content-block">${edu.description}</div>`;
            });
        }

        // Skills
        if (skills && (skills.technical?.length > 0 || skills.soft?.length > 0)) {
            docxHtml += `<h2>Skills</h2><div class="content-block">`;
            if (skills.technical?.length > 0) docxHtml += `<p><strong>Technical:</strong> ${skills.technical.join(', ')}</p>`;
            if (skills.soft?.length > 0) docxHtml += `<p><strong>Soft Skills:</strong> ${skills.soft.join(', ')}</p>`;
            docxHtml += `</div>`;
        }
        
        // Hobbies
        if (hobbies && hobbies.length > 0) {
            docxHtml += `<h2>Interests</h2>`;
            docxHtml += `<p class="content-block">${hobbies.join(', ')}</p>`;
        }
        
        // References
        if (referencesOnRequest || (references && references.length > 0)) {
            docxHtml += `<h2>References</h2>`;
            if (referencesOnRequest) {
                docxHtml += `<p><em>References available upon request.</em></p>`;
            } else {
                references.forEach(ref => {
                    docxHtml += `<div class="content-block"><p><strong>${ref.name}</strong> — ${ref.company}</p>`;
                    docxHtml += `<p>${ref.email} | ${ref.phone}</p></div>`;
                });
            }
        }

        docxHtml += `</body></html>`;

        try {
            const HTMLtoDOCX = require('html-to-docx');
            // Construct DOCX document via natively parsed semantic HTML
            const fileBuffer = await HTMLtoDOCX(docxHtml, null, {
                table: { row: { cantSplit: true } },
                footer: false,
                pageNumber: false,
                margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // Set to 1-inch (1440 twips)
            });

            // Pack & Send
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${cv.title.replace(/\s+/g, '_')}.docx"`,
                'Content-Length': fileBuffer.length
            });

            res.send(fileBuffer);
        } catch (docxErr) {
            console.error(docxErr);
            res.status(500).send('DOCX Engine Error: ' + docxErr.message);
        }
    } catch (dbError) {
        console.error(dbError);
        res.status(500).send('DOCX Database Error');
    }
};

/**
 * Export Cover Letter as PDF
 * POST /cv-editor/:id/cover-letter/export/pdf
 * Body: { letterText, companyName, jobTitle }
 */
exports.exportCoverLetterPDF = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    const { letterText, companyName, jobTitle } = req.body;

    if (!letterText) return res.status(400).send('No letter content provided.');

    try {
        const cv = await prisma.cV.findFirst({ where: { id: parseInt(id), userId } });
        if (!cv) return res.status(404).send('CV not found.');

        const cvData = JSON.parse(cv.data);
        const { personalInfo } = cvData;
        const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        // Build clean HTML for the letter
        const formattedLetter = letterText
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<p style="margin:0 0 14px 0; color:#1e293b; font-size:11pt; line-height:1.7;">${line}</p>`)
            .join('');

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#fff; color:#1e293b; }
  .page { width:210mm; min-height:297mm; padding:22mm 22mm 18mm 22mm; }
  .header-bar { border-bottom:3px solid #4f46e5; padding-bottom:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-end; }
  .name { font-size:22pt; font-weight:800; color:#0f172a; letter-spacing:-0.5px; text-transform:uppercase; }
  .role { font-size:10pt; font-weight:700; color:#4f46e5; text-transform:uppercase; letter-spacing:2px; margin-top:2px; }
  .contact { font-size:8.5pt; color:#64748b; text-align:right; line-height:1.6; }
  .meta { font-size:9pt; color:#64748b; margin-bottom:24px; }
  .subject { font-size:11pt; font-weight:700; color:#0f172a; margin-bottom:20px; }
  .letter-body p { margin:0 0 14px 0; color:#1e293b; font-size:11pt; line-height:1.7; }
  .footer { margin-top:32px; border-top:1px solid #e2e8f0; padding-top:12px; font-size:8pt; color:#94a3b8; text-align:center; }
</style>
</head>
<body>
<div class="page">
  <div class="header-bar">
    <div>
      <div class="name">${fullName}</div>
      <div class="role">${personalInfo.jobTitle || ''}</div>
    </div>
    <div class="contact">
      ${personalInfo.email ? personalInfo.email + '<br>' : ''}
      ${personalInfo.phone ? personalInfo.phone + '<br>' : ''}
      ${personalInfo.city || personalInfo.address || ''}
    </div>
  </div>
  <div class="meta">${today}</div>
  ${companyName ? `<div class="subject">Re: Application for ${jobTitle || 'Position'} — ${companyName}</div>` : ''}
  <div class="letter-body">${formattedLetter}</div>
  <div class="footer">Generated with CV Generator</div>
</div>
</body>
</html>`;

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' } });
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Cover_Letter_${fullName.replace(/\s+/g, '_')}.pdf"`,
            'Content-Length': pdf.length
        });
        res.send(pdf);

    } catch (error) {
        console.error('Cover Letter PDF Error:', error);
        res.status(500).send('PDF generation failed.');
    }
};

/**
 * Export Cover Letter as DOCX
 * POST /cv-editor/:id/cover-letter/export/docx
 * Body: { letterText, companyName, jobTitle }
 */
exports.exportCoverLetterDOCX = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;
    const { letterText, companyName, jobTitle } = req.body;

    if (!letterText) return res.status(400).send('No letter content provided.');

    try {
        const cv = await prisma.cV.findFirst({ where: { id: parseInt(id), userId } });
        if (!cv) return res.status(404).send('CV not found.');

        const cvData = JSON.parse(cv.data);
        const { personalInfo } = cvData;
        const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        const paragraphs = letterText.split('\n').filter(l => l.trim());
        const children = [];

        // Name header
        children.push(new Paragraph({
            children: [new TextRun({ text: fullName.toUpperCase(), bold: true, size: 36, font: 'Arial', color: '0f172a' })],
            alignment: AlignmentType.LEFT, spacing: { after: 40 }
        }));
        if (personalInfo.jobTitle) {
            children.push(new Paragraph({
                children: [new TextRun({ text: personalInfo.jobTitle, size: 20, font: 'Arial', color: '4f46e5' })],
                spacing: { after: 40 }
            }));
        }
        // Contact line
        const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.city].filter(Boolean);
        if (contactParts.length) {
            children.push(new Paragraph({
                children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Arial', color: '64748b' })],
                spacing: { after: 280 }
            }));
        }
        // Date
        children.push(new Paragraph({ children: [new TextRun({ text: today, size: 20, font: 'Arial', color: '64748b' })], spacing: { after: 160 } }));
        // Subject
        if (companyName) {
            children.push(new Paragraph({
                children: [new TextRun({ text: `Re: Application for ${jobTitle || 'Position'} — ${companyName}`, bold: true, size: 22, font: 'Arial' })],
                spacing: { after: 240 }
            }));
        }
        // Letter body
        paragraphs.forEach(para => {
            children.push(new Paragraph({
                children: [new TextRun({ text: para, size: 22, font: 'Arial' })],
                spacing: { after: 200 }
            }));
        });

        const doc = new Document({ sections: [{ properties: {}, children }] });
        const buffer = await Packer.toBuffer(doc);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="Cover_Letter_${fullName.replace(/\s+/g, '_')}.docx"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);

    } catch (error) {
        console.error('Cover Letter DOCX Error:', error);
        res.status(500).send('DOCX generation failed.');
    }
};
