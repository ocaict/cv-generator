const Groq = require("groq-sdk");

// Initialize Groq with the API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Main Controller for AI-Powered CV Enhancements
 */
exports.generateAI = async (req, res) => {
    const { type, input, context } = req.body;

    if (!input) {
        return res.status(400).json({ error: "No input provided for AI generation" });
    }

    let prompt = "";
    let systemPrompt = `You are a strict, professional CV writer. 
    CRITICAL RULES:
    1. Output ONLY the requested content. 
    2. ABSOLUTELY NO Conversational filler (NO "Here is...", NO "Certainly!", NO "Alternatively...").
    3. NO Explanations, NO Notes, and NO Postambles.
    4. If enhancing an experience, return RAW HTML <ul><li> list only.`;

    // Define prompts based on the requested enhancement type
    switch (type) {
        case 'summary':
            prompt = `As an expert CV writer, craft a high-impact Professional Summary (3-4 sentences approx 50-60 words).
            Input Data/Experience: ${input}
            Target Role: ${context?.jobTitle || 'Professional'}
            Desired Tone: ${context?.targetTone || 'Professional'}
            Guidelines: Start with a strong noun (e.g., "Results-driven...", "Senior..."). Focus on quantifiable achievements and key value propositions. 
            RULES: NO INTRO. NO QUOTES. OUTPUT ONLY THE SUMMARY TEXT.`;
            break;

        case 'experience':
            prompt = `Transform the following job responsibilities into high-impact, results-driven bullet points using the STAR method (Situation, Task, Action, Result).
            Original Content: ${input}
            Target Role: ${context?.jobTitle || 'this position'}
            Tone: ${context?.targetTone || 'Professional'}
            Guidelines: 
            - Use strong action verbs (Spearheaded, Optimized, Orchestrated).
            - Focus on measurable results where possible.
            - Ensure ATS compatibility by using relevant keywords.
            RULES: Return a RAW HTML <ul> list with 3-5 high-impact <li> items. NO PREAMBLE. NO ALTERNATIVES. NO CONVERSATIONAL FILLER.`;
            break;

        case 'skills':
            prompt = `Based on the career profile for a "${context?.jobTitle || 'Professional'}", suggest a modern, high-marketability list of 8-10 skills.
            Current Input: ${input}
            Focus Area: ${context?.targetArea || 'General'}
            Tone: ${context?.targetTone || 'Professional'}
            RULES: Return a comma-separated list of skills ONLY. DO NOT add "Here are..." or any notes.`;
            break;

        case 'tone':
            prompt = `Rewrite the following text to perfectly match a "${context?.targetTone || 'Professional'}" professional tone, optimized for a modern CV.
            Original Text: ${input}
            Context: ${context?.jobTitle || 'Career Content'}`;
            break;

        default:
            prompt = `Improve this text for a top-tier professional CV, focusing on clarity, impact, and professional tone: ${input}`;
    }

    try {
        // Use Llama 3.3 70B Versatile for state-of-the-art results (Free tier on Groq)
        // Alternative: llama-3.1-8b-instant (even faster, slightly less reasoning)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false,
        });

        const result = chatCompletion.choices[0]?.message?.content || "No content generated";
        
        // Final "Chatter" filter (Clean up common AI slips)
        const cleanResult = result
            .replace(/^["']|["']$/g, '')           // Strip starting/ending quotes
            .replace(/^Certainly!.*?\n/i, '')      // Strip "Certainly!"
            .replace(/^Here is.*?\n/i, '')         // Strip "Here is..."
            .replace(/\nNote:.*$/is, '')           // Strip any trailing notes
            .replace(/\nAlternatively:.*$/is, '')  // Strip alternatives
            .trim();

        res.json({ result: cleanResult });
    } catch (error) {
        console.error("AI Generation Error:", error.message);
        
        // Specific handling for rate limits or key issues
        if (error.status === 413) {
            return res.status(413).json({ error: "Input is too long for the AI assistant." });
        }
        
        res.status(500).json({ error: "The AI assistant is currently unavailable. Please try again in a moment." });
    }
};
