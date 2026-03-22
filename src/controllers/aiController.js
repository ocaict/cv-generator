const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Sanitize raw user input before injecting into prompts.
 * Truncates to maxLen chars and strips prompt-injection-prone characters.
 */
function sanitizeInput(raw, maxLen = 2000) {
    if (!raw || typeof raw !== 'string') return '';
    return raw
        .replace(/[\r\n]+/g, ' ')      // Collapse line breaks to single space
        .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
        .replace(/[<>]/g, '')           // Strip angle brackets
        .trim()
        .slice(0, maxLen);
}

/**
 * Sanitize context strings (short fields like job title, tone)
 */
function sanitizeField(raw, maxLen = 100) {
    if (!raw || typeof raw !== 'string') return '';
    return raw.replace(/[^a-zA-Z0-9 ,.\-&/()]/g, '').trim().slice(0, maxLen);
}

/**
 * Main Controller for AI-Powered CV Enhancements
 */
exports.generateAI = async (req, res) => {
    const { type, input, context } = req.body;

    if (!input) {
        return res.status(400).json({ error: "No input provided for AI generation" });
    }

    // --- Sanitize all inputs ---
    const safeInput = sanitizeInput(input);
    const safeJobTitle = sanitizeField(context?.jobTitle || 'Professional');
    const safeTone = sanitizeField(context?.targetTone || 'Professional');
    const safeArea = sanitizeField(context?.targetArea || 'General');

    // Sanitize optional experience context (array of recent jobs)
    let experienceContext = '';
    if (Array.isArray(context?.recentExperience)) {
        experienceContext = context.recentExperience
            .map(e => sanitizeField(e, 120))
            .slice(0, 3)
            .join('; ');
    }

    const safeBlockContext = sanitizeField(context?.blockContext || '', 150);
    
    // Auto-inject blockContext inline to the input data explicitly if missing from input
    let enrichedInput = safeInput;
    if (safeBlockContext) {
        enrichedInput = `[${safeBlockContext}]\n${safeInput}`;
    }

    console.log("=== AI GENERATION DEBUG ===");
    console.log("TYPE:", type);
    console.log("RAW INPUT Sliced:", input.slice(0, 500));
    console.log("ENRICHED INPUT Sliced:", enrichedInput.slice(0, 500));
    console.log("CONTEXT:", JSON.stringify(context).slice(0, 500));
    console.log("===========================");

    if (!safeInput && type !== 'skills') {
        return res.status(400).json({ error: "Input is empty after sanitization." });
    }

    let toneInstructions = "";
    switch (safeTone) {
        case 'Executive':
            toneInstructions = "Use strong, authoritative language focusing on leadership, P&L, strategic vision, and bottom-line impact."; break;
        case 'Creative':
            toneInstructions = "Use narrative-driven language, showing personal brand, innovation, and out-of-the-box thinking."; break;
        case 'Concise':
            toneInstructions = "Use extremely sharp, brief, bullet-focused language. No fluff, just facts."; break;
        case 'Tech/Startup':
            toneInstructions = "Use metric-driven, agile, scale-focused language. Highlight 'shipping features', 'MRR', 'optimization', 'sprints', and product velocity."; break;
        case 'Law/Finance':
            toneInstructions = "Use formal, precise, and compliant language. Emphasise 'due diligence', 'risk mitigation', 'fiduciary responsibility', 'ROI', and rigorous accuracy."; break;
        case 'Healthcare':
            toneInstructions = "Use clinical yet empathetic language. Focus on 'patient outcomes', 'regulatory compliance' (e.g., HIPAA/CQC), 'evidence-based care', and clinical excellence."; break;
        case 'Academic':
            toneInstructions = "Use thorough, formal, research-focused language. Highlight 'methodologies', 'peer-reviewed publications', 'pedagogical', 'grants', and rigorous analysis."; break;
        case 'Professional':
        default:
            toneInstructions = "Use balanced, standard, and highly professional corporate language."; break;
    }

    let prompt = "";
    const systemPrompt = `You are a strict, professional CV writer. 
    CRITICAL RULES:
    1. Output ONLY the requested content. 
    2. ABSOLUTELY NO conversational filler (NO "Here is...", NO "Certainly!", NO "Alternatively...").
    3. NO explanations, NO notes, and NO postambles.
    4. If enhancing an experience, return RAW HTML <ul><li> list only.
    5. Never make up facts — only work with what the user gives you.
    
    TONE & STYLE ENFORCEMENT:
    ${toneInstructions}
    Make sure EVERY word reflects this specific style without sounding robotic.`;

    switch (type) {
        case 'summary':
            prompt = `As an expert CV writer, craft a high-impact Professional Summary (3-4 sentences, approx 50-60 words).
            Input Data/Experience: ${safeInput}
            Target Role: ${safeJobTitle}
            Desired Tone: ${safeTone}
            Guidelines: Start with a strong noun (e.g., "Results-driven...", "Senior..."). Focus on quantifiable achievements and key value propositions. 
            RULES: NO INTRO. NO QUOTES. OUTPUT ONLY THE SUMMARY TEXT.`;
            break;

        case 'experience':
            prompt = `Transform the following job responsibilities into high-impact, results-driven bullet points using the STAR method (Situation, Task, Action, Result).
            Original Content: ${enrichedInput}
            Target Role: ${safeJobTitle}
            Tone: ${safeTone}
            ${experienceContext ? `Career Context: ${experienceContext}` : ''}
            Guidelines: 
            - Use strong action verbs (Spearheaded, Optimized, Orchestrated, Delivered).
            - Focus on measurable results where possible.
            - Ensure ATS compatibility by using relevant industry keywords.
            RULES: Return a RAW HTML <ul> list with 3-5 high-impact <li> items. NO PREAMBLE. NO ALTERNATIVES. NO CONVERSATIONAL FILLER.`;
            break;

        case 'skills':
            const isSoft = context?.blockContext?.includes('Soft Skills');
            const isTechnical = context?.blockContext?.includes('Technical Skills');
            
            prompt = `Based on the career profile below, suggest a modern, high-marketability list of 8-10 ${isSoft ? 'SOFT' : isTechnical ? 'TECHNICAL' : ''} skills.
            Job Title: ${safeJobTitle}
            Current Skills / Experience: ${safeInput || 'None provided'}
            ${experienceContext ? `Recent Experience: ${experienceContext}` : ''}
            Type: ${isSoft ? 'SOFT SKILLS (Interpersonal, Leadership, Communication)' : 'TECHNICAL SKILLS (Hard skills, Tools, Software, Industry knowledge)'}
            Tone: ${safeTone}
            RULES: Return a comma-separated list of skills ONLY (e.g. "Project Management, Agile, SQL"). NO intro text. NO bullet points. NO explanations. NO PREAMBLE.`;
            break;

        case 'education':
            prompt = `Rewrite the following education entry to sound polished and impactful on a professional CV.
            Original Text: ${enrichedInput}
            Target Role Context: ${safeJobTitle}
            Guidelines:
            - Keep it concise (1-2 sentences max).
            - Highlight academic achievements, honours, or relevant coursework if mentioned.
            - Use active, professional language.
            RULES: Output only the refined education description. NO preamble. NO quotes.`;
            break;

        case 'tone':
            prompt = `Rewrite the following CV text to perfectly match a "${safeTone}" professional tone, optimised for a modern CV.
            Original Text: ${safeInput}
            Target Role: ${safeJobTitle}
            RULES: Output only the rewritten text. NO explanations.`;
            break;

        case 'ats':
            // ATS Keyword Scan: compare CV content against a job description
            prompt = `You are an ATS (Applicant Tracking System) expert. Analyse the following CV content against the provided job description.
            CV Content: ${safeInput}
            Job Description: ${sanitizeInput(context?.jobDescription || '', 2000)}
            
            Respond in this EXACT format (no other text):
            SCORE: [number 0-100]
            MATCHED: [comma-separated matched keywords]
            MISSING: [comma-separated important missing keywords]
            TIP: [one specific, actionable improvement sentence]`;
            break;

        case 'cv-review':
            prompt = `You are a senior recruiter and professional CV consultant with 15+ years of experience hiring across multiple industries.
Analyse the following CV content thoroughly and return your assessment in this EXACT structured format (no other text, no preamble):

SCORE: [single integer 0-100 reflecting overall CV quality]
LEVEL: [one of: Needs Work | Developing | Solid | Strong | Exceptional]
STRENGTH_1: [specific strength with brief explanation, max 15 words]
STRENGTH_2: [specific strength with brief explanation, max 15 words]
STRENGTH_3: [specific strength with brief explanation, max 15 words]
WEAKNESS_1: [specific weakness with brief explanation, max 15 words]
WEAKNESS_2: [specific weakness with brief explanation, max 15 words]
WEAKNESS_3: [specific weakness with brief explanation, max 15 words]
ACTION_1: [concrete, actionable improvement tip, max 20 words]
ACTION_2: [concrete, actionable improvement tip, max 20 words]
ACTION_3: [concrete, actionable improvement tip, max 20 words]
VERDICT: [one motivating sentence summarising the CV overall readiness for the job market]

CV Content to Analyse:
${safeInput}

Scoring Criteria (weight each):
- Impact & Quantification (25%): Are achievements measurable? Do bullet points show results?
- Completeness (20%): Are all key sections present? 
  * IMPORTANT: Look for the [SECTION: ...] headers in the provided text.
  * If [SECTION: EDUCATION] contains degrees and descriptions, it is COMPLETE.
  * If [SECTION: TECHNICAL SKILLS] or [SECTION: SOFT SKILLS] contain lists, they are COMPLETE.
  * If the overall score is >80, do not list "Missing sections" as a primary weakness unless something major is truly gone.
- Relevance & ATS Compatibility (20%): Is language targeted, keyword-rich, and modern?
- Clarity & Structure (20%): Is the CV easy to scan? Are sections clearly defined?
- Professional Tone (15%): Is the language confident, active-voice, and typo-free?

CRITICAL: 
1. Check the [SECTION: ...] tags carefully. 
2. If text exists under [SECTION: EDUCATION], DO NOT say "Lack of education details". 
3. If text exists under [SECTION: SOFT SKILLS], DO NOT say "Limited soft skills".
Output ONLY the structured lines. NO preamble.`;
            break;

        case 'cover-letter':
            const companyName = sanitizeField(context?.companyName || 'the company', 120);
            const hiringManager = sanitizeField(context?.hiringManager || '', 80);
            const jobTitle = sanitizeField(context?.jobTitle || 'this position', 100);
            const jobDesc = sanitizeInput(context?.jobDescription || '', 2000);
            const greeting = hiringManager ? `Dear ${hiringManager}` : 'Dear Hiring Manager';

            prompt = `Write a professional, compelling cover letter for the following applicant applying to the stated position.

Applicant CV Summary:
${safeInput}

Target Role: ${jobTitle}
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
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.65,
            max_tokens: 800,
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

        // Final "chatter" filter
        const cleanResult = raw
            .replace(/^[\"']|[\"']$/g, '')
            .replace(/^Certainly!.*?\n/i, '')
            .replace(/^Here is.*?\n/i, '')
            .replace(/^Sure[,!].*?\n/i, '')
            .replace(/\nNote:.*$/is, '')
            .replace(/\nAlternatively:.*$/is, '')
            .trim();

        res.json({ result: cleanResult });

    } catch (error) {
        console.error("AI Generation Error:", error.message);

        // Try fallback model on overload/timeout (no streaming for fallback to keep it simple)
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
