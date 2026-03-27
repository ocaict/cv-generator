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

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
        const cvData = JSON.parse(cv.data);
        const { personalInfo, experience, education, skills, hobbies, references, referencesOnRequest } = cvData;

        // Custom HTML Parser for Native DOCX
        function parseHtmlToDocx(htmlStr) {
            if (!htmlStr) return [];
            let str = htmlStr.replace(/\r?\n|\r/g, ''); // Clean linebreaks
            // Split aggressively by block ends
            const blocks = str.split(/<\/(?:p|li|h1|h2|h3|h4|div|ul|ol)>/i);
            const elements = [];

            blocks.forEach(block => {
                let cleanBlock = block.trim();
                // Strip lingering block closing tags
                cleanBlock = cleanBlock.replace(/<\/(?:ul|ol)>/gi, '');
                if (!cleanBlock) return;

                let isList = /<li[^>]*>/i.test(cleanBlock);
                let isH1 = /<h1[^>]*>/i.test(cleanBlock);
                let isH2 = /<h2[^>]*>/i.test(cleanBlock);
                let isH3 = /<h3[^>]*>/i.test(cleanBlock);

                // Strip opening block tags to get inline content
                let innerHtml = cleanBlock.replace(/<(?:p|li|h1|h2|h3|h4|div|ul|ol)[^>]*>/gi, '');
                if (!innerHtml.trim()) return;

                const parts = innerHtml.split(/(<[^>]+>)/g);
                let isBold = false;
                let isItalic = false;
                let isUnderline = false;
                const textRuns = [];

                parts.forEach(part => {
                    if (/^<(strong|b)>/i.test(part)) isBold = true;
                    else if (/^<\/(strong|b)>/i.test(part)) isBold = false;
                    else if (/^<(em|i)>/i.test(part)) isItalic = true;
                    else if (/^<\/(em|i)>/i.test(part)) isItalic = false;
                    else if (/^<u>/i.test(part)) isUnderline = true;
                    else if (/^<\/u>/i.test(part)) isUnderline = false;
                    else if (/^<br\s*\/?>/i.test(part)) textRuns.push(new TextRun({ break: 1 }));
                    else if (!part.startsWith('<')) {
                        // Decode entities
                        let text = part.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                        if (text) {
                            textRuns.push(new TextRun({ text, bold: isBold, italic: isItalic, underline: isUnderline ? {} : undefined, size: 21, font: "Arial" }));
                        }
                    }
                });

                if (textRuns.length > 0) {
                    elements.push(new Paragraph({
                        children: textRuns,
                        bullet: isList ? { level: 0 } : undefined,
                        heading: isH1 ? HeadingLevel.HEADING_1 : (isH2 ? HeadingLevel.HEADING_2 : (isH3 ? HeadingLevel.HEADING_3 : undefined)),
                        spacing: { after: 120, before: isList ? 0 : 60 }
                    }));
                }
            });
            return elements;
        }

        const children = [];

        // 1. Header (Name & Contact)
        const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim().toUpperCase() || 'YOUR NAME';
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: fullName, bold: true, size: 36, font: "Arial", color: cvData.themeColor?.replace('#', '') || "111111" })]
            })
        );

        if (personalInfo.jobTitle) {
            children.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: personalInfo.jobTitle.toUpperCase(), size: 24, font: "Arial", color: "555555" })],
                    spacing: { after: 200 }
                })
            );
        }

        let contactInfo = [];
        if (personalInfo.email) contactInfo.push(personalInfo.email);
        if (personalInfo.phone) contactInfo.push(personalInfo.phone);
        if (personalInfo.city || personalInfo.address) contactInfo.push([personalInfo.address, personalInfo.city].filter(Boolean).join(', '));
        if (contactInfo.length) {
            children.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: contactInfo.join("  |  "), size: 20, font: "Arial", color: "666666" })],
                    spacing: { after: 400 }
                })
            );
        }

        // 2. Summary
        if (personalInfo.summary && personalInfo.summary.trim()) {
            children.push(new Paragraph({ text: "PROFESSIONAL PROFILE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            children.push(...parseHtmlToDocx(personalInfo.summary));
        }

        // 3. Experience
        if (experience && experience.length > 0) {
            children.push(new Paragraph({ text: "WORK EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            experience.forEach(exp => {
                const dateRange = `${exp.startMonth || ''} ${exp.startYear || ''} - ${exp.isPresent ? 'Present' : (exp.endMonth || '') + ' ' + (exp.endYear || '')}`.trim();
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: exp.jobTitle || 'Role', bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: `  -  ${exp.company || 'Company'}`, italic: true, size: 24, font: "Arial", color: "444444" })
                        ],
                        spacing: { before: 150 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: dateRange, size: 20, font: "Arial", color: "777777" })],
                        spacing: { after: 100 }
                    })
                );
                if (exp.responsibilities) children.push(...parseHtmlToDocx(exp.responsibilities));
            });
        }

        // 4. Education
        if (education && education.length > 0) {
            children.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            education.forEach(edu => {
                const gradDate = `${edu.endMonth || ''} ${edu.endYear || ''}`.trim();
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: edu.degree || 'Degree', bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: `  -  ${edu.school || 'School'}`, italic: true, size: 24, font: "Arial", color: "444444" })
                        ],
                        spacing: { before: 150 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: gradDate, size: 20, font: "Arial", color: "777777" })],
                        spacing: { after: 100 }
                    })
                );
                if (edu.description) children.push(...parseHtmlToDocx(edu.description));
            });
        }

        // 5. Skills
        if (skills && (skills.technical?.length > 0 || skills.soft?.length > 0)) {
            children.push(new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            if (skills.technical?.length > 0) {
                children.push(new Paragraph({ children: [new TextRun({ text: "Technical: ", bold: true, size: 21, font: "Arial" }), new TextRun({ text: skills.technical.join(', '), size: 21, font: "Arial" })], spacing: { after: 60 } }));
            }
            if (skills.soft?.length > 0) {
                children.push(new Paragraph({ children: [new TextRun({ text: "Soft Skills: ", bold: true, size: 21, font: "Arial" }), new TextRun({ text: skills.soft.join(', '), size: 21, font: "Arial" })], spacing: { after: 60 } }));
            }
        }

        // 6. Interests
        if (hobbies && hobbies.length > 0) {
            children.push(new Paragraph({ text: "INTERESTS", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            children.push(new Paragraph({ children: [new TextRun({ text: hobbies.join(', '), size: 21, font: "Arial" })] }));
        }

        // 7. References
        if (referencesOnRequest || (references && references.length > 0)) {
            children.push(new Paragraph({ text: "REFERENCES", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            if (referencesOnRequest) {
                children.push(new Paragraph({ text: "References available upon request.", italic: true, size: 21, font: "Arial" }));
            } else {
                references.forEach(ref => {
                    children.push(
                        new Paragraph({ children: [new TextRun({ text: ref.name, bold: true, size: 21, font: "Arial" }), new TextRun({ text: ` - ${ref.company}`, italic: true, size: 21, font: "Arial" })] }),
                        new Paragraph({ children: [new TextRun({ text: `${ref.email} | ${ref.phone}`, size: 20, font: "Arial", color: "555555" })], spacing: { after: 150 } })
                    );
                });
            }
        }

        // Generate the strict DOCX buffer using native engine
        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: children,
            }],
        });

        try {
            const buffer = await Packer.toBuffer(doc);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${cv.title.replace(/\s+/g, '_')}.docx"`,
                'Content-Length': buffer.length
            });
            res.send(buffer);
        } catch (docxErr) {
            console.error('Packer Error:', docxErr);
            res.status(500).send('DOCX Packer Error');
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
