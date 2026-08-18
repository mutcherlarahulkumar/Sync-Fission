import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import teacherimage from '../assets/tutor.png';
import { API_URL, getAuthConfig, isSignedIn } from '../api';

function AIAssistant() {
    const [isChatOpen, setChatOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!prompt.trim()) return;
        const userMessage = prompt;
        setPrompt('');
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setIsLoading(true);
        try {
            // The assistant reads the caller's classes and can book sessions,
            // so the request is authenticated like any other.
            const response = await axios.post(
                `${API_URL}/chat/send`,
                { userInput: userMessage },
                getAuthConfig(),
            );
            setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
        } catch (error) {
            const status = error.response?.status;
            const text =
                status === 401 || status === 403
                    ? 'Please sign in first — I need to know whose classes to look at.'
                    : status === 429
                        ? 'That was a lot of questions at once. Give me a minute and try again.'
                        : 'Sorry, I could not process your request. Please try again.';
            setMessages(prev => [...prev, { text, isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // Devika needs to know whose classes to look at, so she is only offered
    // to signed-in users rather than showing a bubble that can only say no.
    if (!isSignedIn()) return null;

    return (
        <div>
            <button className='ai-assistant' onClick={() => setChatOpen(!isChatOpen)} title="AI Assistant">
                <img src={teacherimage} alt="AI Assistant" style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
            </button>

            {isChatOpen && (
                <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col z-50 border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
                        <div>
                            <h5 className="font-bold text-white text-sm">Devika — AI Teaching Assistant</h5>
                            <p className="text-gray-400 text-xs">Powered by Sync-Fission</p>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm pt-8">
                                Hi! I&apos;m Devika. Ask me anything about your studies!
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                                    msg.isUser
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-500 px-3 py-2 rounded-lg text-sm rounded-bl-none">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-200 px-3 py-3 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Type your message..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                                onClick={sendMessage}
                                disabled={isLoading || !prompt.trim()}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIAssistant;
