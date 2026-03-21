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
        const { personalInfo, experience, education, skills } = cvData;

        // Create the DOCX sections
        const children = [];

        // Header: Name & Title
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: `${personalInfo.firstName} ${personalInfo.lastName}`.toUpperCase(),
                        bold: true,
                        size: 36, // 18pt
                        font: "Arial"
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: personalInfo.jobTitle.toUpperCase(),
                        size: 24, // 12pt
                        color: "666666",
                        font: "Arial"
                    }),
                ],
                spacing: { after: 200 }
            })
        );

        // Contact Info Bar
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: `${personalInfo.email}  |  ${personalInfo.phone}  |  ${personalInfo.address}`, size: 20, font: "Arial" })
                ],
                spacing: { after: 400 }
            })
        );

        // Summary
        if (personalInfo.summary) {
            children.push(
                new Paragraph({ text: "PROFESSIONAL PROFILE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: personalInfo.summary.replace(/<[^>]*>/g, ''), size: 21, font: "Arial" })], spacing: { after: 300 } })
            );
        }

        // Experience
        if (experience && experience.length > 0) {
            children.push(new Paragraph({ text: "WORK EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            
            experience.forEach(exp => {
                const dateRange = `${exp.startMonth} ${exp.startYear} - ${exp.isPresent ? 'Present' : (exp.endMonth + ' ' + exp.endYear)}`;
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: exp.company, bold: true, size: 22 }),
                            new TextRun({ text: `  -  ${exp.jobTitle}`, italic: true, size: 22 })
                        ],
                        spacing: { before: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: dateRange, size: 18, color: "555555" })
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: (exp.responsibilities || "").replace(/<[^>]*>/g, ''), size: 21, font: "Arial" })],
                        spacing: { after: 200 }
                    })
                );
            });
        }

        // Education
        if (education && education.length > 0) {
            children.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            education.forEach(edu => {
                const gradDate = `${edu.endMonth} ${edu.endYear}`;
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: edu.school, bold: true, size: 22 }),
                            new TextRun({ text: `  -  ${edu.degree}`, italic: true, size: 22 })
                        ],
                        spacing: { before: 100 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: gradDate, size: 18, color: "555555" })],
                        spacing: { after: 100 }
                    })
                );
            });
        }

        // Skills
        if (skills && (skills.technical?.length > 0 || skills.soft?.length > 0)) {
            children.push(new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            
            if (skills.technical?.length > 0) {
                children.push(
                    new Paragraph({ children: [new TextRun({ text: "Technical: ", bold: true, size: 21 }), new TextRun({ text: skills.technical.join(', '), size: 21 })], spacing: { after: 100 } })
                );
            }
            if (skills.soft?.length > 0) {
                children.push(
                    new Paragraph({ children: [new TextRun({ text: "Soft Skills: ", bold: true, size: 21 }), new TextRun({ text: skills.soft.join(', '), size: 21 })], spacing: { after: 100 } })
                );
            }
        }

        // Hobbies
        if (cvData.hobbies && cvData.hobbies.length > 0) {
            children.push(
                new Paragraph({ text: "INTERESTS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: cvData.hobbies.join(', '), size: 21 })], spacing: { after: 300 } })
            );
        }

        // References
        if (cvData.referencesOnRequest) {
            children.push(
                new Paragraph({ text: "REFERENCES", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
                new Paragraph({ text: "References available upon request.", italic: true, size: 21 })
            );
        } else if (cvData.references && cvData.references.length > 0) {
            children.push(new Paragraph({ text: "REFERENCES", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            cvData.references.forEach(ref => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: ref.name, bold: true, size: 22 }),
                            new TextRun({ text: `  -  ${ref.company}`, italic: true, size: 22 })
                        ],
                        spacing: { before: 100 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `${ref.email} | ${ref.phone}`, size: 18, color: "555555" })],
                        spacing: { after: 200 }
                    })
                );
            });
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        // Pack & Send
        const buffer = await Packer.toBuffer(doc);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${cv.title.replace(/\s+/g, '_')}.docx"`,
            'Content-Length': buffer.length
        });

        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('DOCX Engine Error');
    }
};
