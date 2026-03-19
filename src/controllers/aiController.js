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
            prompt = `Create a compelling 3-4 sentence CV summary. 
            User Input/Facts: ${input}
            Target Job Title: ${context?.jobTitle || 'Professional'}
            Tone: ${context?.targetTone || 'Professional'}
            Rules: High-impact, results-driven language. NO PREAMBLE. OUTPUT ONLY THE SUMMARY.`;
            break;

        case 'experience':
            prompt = `Refine these job responsibilities using the STAR method (Action-Result).
            Original: ${input}
            Target Tone: ${context?.targetTone || 'Professional'}
            Rules: Use strong action verbs. Return EXACTLY TWO high-impact bullet points as RAW HTML <ul><li>...</li><li>...</li></ul> only. NO INTRODUCTION, NO ALTERNATIVES, NO NOTES.`;
            break;

        case 'skills':
            prompt = `Based on "${context?.jobTitle || 'this role'}", suggest 8 relevant technical and soft skills.
            Tone: ${context?.targetTone || 'Professional'}
            Rules: Comma-separated list ONLY. NO INTRO. NO NOTE.`;
            break;

        case 'tone':
            prompt = `Rewrite the following text to have a ${context?.targetTone || 'Professional'} tone:
            Text: ${input}`;
            break;

        default:
            prompt = `Improve this text for a professional CV: ${input}`;
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
