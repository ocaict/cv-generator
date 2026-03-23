/**
 * AI Co-pilot Logic
 * Handle floating chat interactions and streaming AI responses.
 */

document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.getElementById('ai-chat-bubble');
    const windowEl = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-ai-chat');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const messagesContainer = document.getElementById('ai-chat-messages');

    // Toggle Chat
    bubble?.addEventListener('click', () => {
        windowEl.classList.toggle('active');
        if (windowEl.classList.contains('active')) {
            chatInput.focus();
        }
    });

    closeBtn?.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });

    // Handle Send
    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // 1. Add User Message to UI
        appendMessage('user', msg);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 2. Prepare AI Container with Loading State
        const aiMsgId = 'ai-msg-' + Date.now();
        appendMessage('ai', '', aiMsgId, true);
        
        try {
            // 3. Call Streaming API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    cvData: typeof cvData !== 'undefined' ? cvData : {}
                })
            });

            if (!response.ok) throw new Error('Chat failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let fullText = '';
            
            // Remove loading pulse once stream starts
            const aiMsgEl = document.getElementById(aiMsgId);
            const contentEl = aiMsgEl.querySelector('.message-content');
            contentEl.innerHTML = ''; // Clear loading

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let newlineIndex;

                while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
                    const currentEvent = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 2);

                    const dataLine = currentEvent.split('\n').find(l => l.startsWith('data: '));
                    if (dataLine) {
                        const dataStr = dataLine.slice(6);
                        if (dataStr === '[DONE]') break;
                        
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text) {
                                fullText += parsed.text;
                                // Simple markdown-to-html (bold/lists)
                                contentEl.innerHTML = formatAIResponse(fullText);
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }
                        } catch (e) { }
                    }
                }
            }

        } catch (err) {
            console.error('AI Chat Error:', err);
            const aiMsgEl = document.getElementById(aiMsgId);
            if (aiMsgEl) {
                aiMsgEl.querySelector('.message-content').innerHTML = '<span class="text-red-500 italic">Sorry, I hit a snag. Please try again or check your connection.</span>';
            }
        }
    });

    // Auto-expand textarea
    chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });

    // Enter to submit (Shift+Enter for newline)
    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    /**
     * Helper to add messages to the UI
     */
    function appendMessage(role, text, id = '', isLoading = false) {
        const div = document.createElement('div');
        div.id = id;
        div.className = role === 'user' ? 'message-user flex justify-end space-x-3' : 'message-ai flex items-start space-x-3';
        
        const bubbleClass = role === 'user' 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-tl-none border border-gray-100 dark:border-slate-700';

        const avatar = role === 'user' 
            ? '' 
            : '<div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-indigo-500 font-black text-xs">AI</div>';

        div.innerHTML = `
            ${avatar}
            <div class="${bubbleClass} p-4 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] shadow-sm message-content">
                ${isLoading ? '<div class="flex space-x-1"><div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div><div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:0.4s"></div></div>' : formatAIResponse(text)}
            </div>
        `;

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Very basic markdown-like formatter for AI responses
     */
    function formatAIResponse(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
});
