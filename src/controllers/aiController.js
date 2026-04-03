const { Groq } = require('groq-sdk');
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to sanitize input
const sanitizeInput = (text, maxLength = 15000) => {
    if (!text) return '';
    return text.trim().slice(0, maxLength);
};

// Helper for specific small fields
const sanitizeField = (text, maxLength = 100) => {
    if (!text) return '';
    return text.trim().slice(0, maxLength);
};

const systemPrompt = `You are an elite, world-class career coach and professional CV writer. 
Your goal is to help candidates land high-paying roles at top-tier companies (FAANG, Fortune 500, top startups). 
You are sharp, metric-oriented, and know exactly what modern recruiters and ATS systems look for.
You always emphasize impact, quantifiable results (numbers, %, $), and the S.T.A.R. method (Situation, Task, Action, Result).
Your advice is elite, modern, and high-impact.`;

/**
 * Handle all AI generation requests in one clean controller
 */
exports.generate = async (req, res) => {
    const { type, input, context, tone } = req.body;
    let prompt = '';
    const safeInput = sanitizeInput(input, 15000);
    const safeJobTitle = sanitizeField(context?.jobTitle || '', 100);
    const safeTone = sanitizeField(tone || 'Professional', 50);

    switch (type) {
        case 'cv-review':
            prompt = `Analyze this candidate's CV as a senior recruiter at a top-tier company. Provide a comprehensive, high-impact review.
            
            CV Data Summary:
            ${safeInput}
            
            Target Position: ${safeJobTitle || 'General Professional'}
            
            Respond in this EXACT format (no other text):
            SCORE: [Overall score 1-100]
            LEVEL: [Junior | Mid-Level | Senior | Expert]
            VERDICT: [A single-sentence first impression of the profile]
            STRENGTH_1: [Specific strength 1]
            STRENGTH_2: [Specific strength 2]
            STRENGTH_3: [Specific strength 3]
            WEAKNESS_1: [Direct weakness 1]
            WEAKNESS_2: [Direct weakness 2]
            WEAKNESS_3: [Direct weakness 3]
            ACTION_1: [Specific, high-impact improvement suggestion 1]
            ACTION_2: [Specific, high-impact improvement suggestion 2]
            ACTION_3: [Specific, high-impact improvement suggestion 3]`;
            break;

        case 'headline':
            prompt = `Write 3 high-impact, professional CV headlines for a ${safeJobTitle || 'Professional'}.
            Use this CV context: ${safeInput}
            
            Tone: ${safeTone}
            Format: Return ONLY the 3 options, one per line. No numbers. No chatter.`;
            break;

        case 'summary':
            prompt = `Write a powerful, 2-3 sentence professional summary for a ${safeJobTitle || 'Professional'}.
            Focus on achievements and years of experience. Use this context: ${safeInput}
            
            Tone: ${safeTone}
            Format: Only the summary text. No quotes.`;
            break;

        case 'experience':
            prompt = `Rewrite these job responsibilities using the S.T.A.R. method and strong action verbs.
            Inject quantifiable metrics (e.g., "Increased revenue by 20%", "Reduced latency by 50ms") wherever plausible.
            
            Original Text: ${safeInput}
            Role: ${safeJobTitle || 'Professional'}
            Tone: ${safeTone}
            
            Format: Clean HTML bullet points (<li>). No <ul> wrapper.`;
            break;

        case 'interview-prep-questions':
            prompt = `As a Senior Hiring Manager conducting an interview for a ${safeJobTitle || 'top candidate'}, generate 5 tailored, high-pressure interview questions based on the candidate's specific background and a tip on how to frame the answer using their experience. 

CV CONTEXT:
${safeInput}

Categories:
- Behavioral: Focused on past experiences (STAR method).
- Technical: Focused on specific skills (hard skills).
- Situational: Focused on how they would handle future scenarios.

Format:
Q: [Question text]
A: [Framing tip: How should the candidate use their specific experience to answer this?]
T: [Type: Behavioral | Technical | Situational]

RULES:
- Questions must be SPECIFIC to the candidate's provided experience.
- DO NOT use generic questions like "Tell me about yourself".
- Provide concrete "A:" tips referencing items from their CV.
- Return ONLY the Q:, A:, T: blocks. No other text.`;
            break;

        case 'market-strategy':
            prompt = `As an elite compensation analyst and talent strategist, perform a dual analysis of this CV.
            
            CV Data:
            ${safeInput}
            
            Target Market: ${safeJobTitle || 'Global / Remote'}
            
            Task 1: Salary Estimation
            - Analyze experience level, tech stack demand, and responsibility scope.
            - Provide LOWER, MEDIAN, and UPPER annual salary estimates.
            
            Task 2: Competency Heatmap
            - Identify top 5 most marketable assets/skills.
            - Score each 1-10 based on scarcity and impact potential.
            
            Respond in this EXACT format (no other text):
            LOWER: [e.g. $80,000]
            MEDIAN: [e.g. $100,000]
            UPPER: [e.g. $130,000]
            CURRENCY: [e.g. USD]
            TREND: [One sentence market trend]
            CONFIDENCE: [Low | Medium | High]
            COMP: [Skill 1] SCORE: [1-10] REASON: [Short reason]
            COMP: [Skill 2] SCORE: [1-10] REASON: [Short reason]
            COMP: [Skill 3] SCORE: [1-10] REASON: [Short reason]
            COMP: [Skill 4] SCORE: [1-10] REASON: [Short reason]
            COMP: [Skill 5] SCORE: [1-10] REASON: [Short reason]`;
            break;



        case 'ats':
            const jdInput = sanitizeInput(context?.jobDescription || '', 4000);
            prompt = `As an elite technical recruiter and ATS (Applicant Tracking System) expert, analyze this candidate's CV against the provided Job Description.
            
            CV Data:
            ${safeInput}
            
            Job Description:
            ${jdInput}
            
            Tasks:
            1. Calculate a "Match Score" out of 100 based on core requirements.
            2. Identify 5 key MATCHED keywords or skills.
            3. Identify 5 important MISSING keywords or skills that the candidate likely has but didn't mention, or needs to highlight.
            4. Provide 1 high-impact "Power Tip" to immediately improve this match.
            
            Respond in this EXACT format (no other text):
            SCORE: [Number]
            MATCHED: [Skill 1, Skill 2, ...]
            MISSING: [Skill 1, Skill 2, ...]
            TIP: [One single powerful improvement tip]`;
            break;

        case 'cover-letter':
            const companyName = sanitizeField(context?.companyName || 'the company', 120);
            const hiringManager = sanitizeField(context?.hiringManager || '', 80);
            const targetRole = sanitizeField(context?.jobTitle || 'this position', 100);
            const jobDesc = sanitizeInput(context?.jobDescription || '', 2000);
            const greeting = hiringManager ? `Dear ${hiringManager}` : 'Dear Hiring Manager';

            prompt = `Write a professional, compelling cover letter for the following applicant applying to the stated position.

Applicant CV Summary:
${safeInput}

Target Role: ${targetRole}
Target Company: ${companyName}
Job Description Highlights: ${jobDesc || 'Not provided'}

Requirements:
- Start with: "${greeting},"
- Opening paragraph: Express genuine enthusiasm for the specific role and company. Mention the job title by name.
- Middle paragraph(s): Connect 2-3 specific achievements/skills from the CV to the key requirements of the job. Be concrete and use numbers where the CV provides them.
- Closing paragraph: Reiterate interest, express readiness to discuss further, and close professionally.
- Sign off with: "Yours sincerely," followed by a blank line for the name.
- Total length: 3-4 paragraphs, approximately 250-320 words.
- Tone: ${safeTone}, polished, human — NOT robotic or generic.

CRITICAL RULES: Output ONLY the letter body starting from the greeting. NO subject line. NO address header. NO explanations. NO alternatives.`;
            break;

        default:
            prompt = `Improve this text for a top-tier professional CV, focusing on clarity, impact, and professional tone. Target Role: ${safeJobTitle}. Text: ${safeInput}`;
    }

    try {
        const isStreaming = req.body.stream === true;
        // Increase max_tokens for cover letters
        const tokens = (type === 'cover-letter') ? 3000 : 1000;

        // Use 8B model for high-token tasks to avoid TPM limits
        const targetModel = (type === 'translate' || type === 'cover-letter' || type === 'market-strategy') 
            ? "llama-3.1-8b-instant" 
            : "llama-3.3-70b-versatile";

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: targetModel,
            temperature: 0.65,
            max_tokens: tokens,
            top_p: 1,
            stream: isStreaming,
        });

        if (isStreaming) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const chunk of chatCompletion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
            }
            res.write('data: [DONE]\n\n');
            return res.end();
        }

        const raw = chatCompletion.choices[0]?.message?.content || "No content generated";

        let cleanResult = raw
            .replace(/^Certainly!.*?\n/i, '')
            .replace(/^Here is.*?\n/i, '')
            .replace(/^Sure[,!].*?\n/i, '')
            .replace(/\nNote:.*$/is, '')
            .replace(/\nAlternatively:.*$/is, '')
            .trim();

        // New Logic: Extract content from markdown blocks if they exist
        const blockMatch = cleanResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (blockMatch) {
            cleanResult = blockMatch[1].trim();
        }

        // Remove leading/trailing quotes if the AI wrapped the pulse response
        cleanResult = cleanResult.replace(/^[\"']|[\"']$/g, '');

        res.json({ result: cleanResult });

    } catch (error) {
        console.error("AI Generation Error:", error.message);

        if (error.status === 503 || error.status === 500) {
            try {
                const fallback = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.65,
                    max_tokens: 600,
                    stream: false,
                });
                const fallbackResult = fallback.choices[0]?.message?.content?.trim() || '';
                return res.json({ result: fallbackResult, fallback: true });
            } catch (fallbackErr) {
                console.error("Fallback model also failed:", fallbackErr.message);
            }
        }

        if (error.status === 413) {
            return res.status(413).json({ error: "Input is too long for the AI assistant." });
        }
        if (error.status === 429) {
            return res.status(429).json({ error: "AI service is busy. Please try again in a moment." });
        }

        res.status(500).json({ error: "The AI assistant is currently unavailable. Please try again shortly." });
    }
};

/**
 * Interactive AI Co-pilot Chat
 */
exports.chatAI = async (req, res) => {
    const { message, cvData } = req.body;

    if (!message) {
        return res.status(400).json({ error: "No message provided." });
    }

    const safeMessage = sanitizeInput(message, 1500);
    
    const summary = cvData?.personalInfo?.summary || '';
    const jobTitle = cvData?.personalInfo?.jobTitle || '';
    const experience = (cvData?.experience || []).map(e => `${e.jobTitle} at ${e.company}: ${e.responsibilities}`).join('; ');
    const skills = (cvData?.skills?.technical || []).concat(cvData?.skills?.soft || []).join(', ');

    const contextSummary = `Title: ${jobTitle}\nSummary: ${summary.replace(/<[^>]+>/g, '')}\nRecent Exp: ${experience.slice(0, 1500)}\nSkills: ${skills}`;

    const chatSystemPrompt = `You are a world-class career coach and professional CV writer. 
    You are helping a candidate perfect their CV through a real-time chat interface.
    
    CURRENT CV CONTEXT:
    ${contextSummary}
    
    USER'S MESSAGE:
    ${safeMessage}

    INSTRUCTIONS:
    1. Be concise, encouraging, and professional. Get straight to the value.
    2. Provide actionable advice. If they ask to rewrite a section, show the rewrite.
    3. Use bolding (**text**) for emphasis. 
    4. Use bulleted lists if providing multiple steps or skills.
    5. If suggesting job experience bullets, follow the STAR method (Situation, Task, Action, Result) with metrics.
    6. Maintain a helpful 'co-pilot' persona—be a friendly, top-tier expert.
    7. Use standard Markdown for formatting.
    8. Limit response to approx 250 words unless writing a full section.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: chatSystemPrompt },
                { role: "user", content: safeMessage }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.75,
            max_tokens: 1200,
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        return res.end();

    } catch (error) {
        console.error("AI Chat Error:", error.message);
        
        try {
            const fallback = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an AI career coach. Help the user with their request concisely." },
                    { role: "user", content: safeMessage }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 500,
                stream: false,
            });
            const text = fallback.choices[0]?.message?.content || "";
            res.write(`data: ${JSON.stringify({ text: text })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        } catch (e) {
            res.status(500).json({ error: "Chat service unavailable." });
        }
    }
};
