import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    MessageSquare,
    ShieldCheck,
    Zap,
    ArrowLeft,
    ChevronRight,
    Loader2,
    Cpu,
    Sparkles
} from 'lucide-react';
import { api, API_BASE } from '../services/api';

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '70%' }}
    >
        <div style={{
            padding: '1rem 1.75rem',
            borderRadius: '24px 24px 24px 4px',
            background: 'white',
            color: 'var(--text)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>AgroAssist AI is typing</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingTop: '4px' }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                        }}
                        style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', opacity: 0.6 }}
                    />
                ))}
            </div>
        </div>
    </motion.div>
);

const ExpertChat = () => {
    const user = JSON.parse(localStorage.getItem('agro_user'));
    const [messages, setMessages] = useState([]);
    const [isChatActive, setIsChatActive] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isChatActive && messages.length === 0) {
            setMessages([
                { sender: 'bot', text: `Hello! I am AgroAssist AI, your agricultural advisor. How can I assist you with your farming today, ${user ? user.fullname.split(' ')[0] : 'Farmer'}?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]);
        }
    }, [isChatActive]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { sender: 'user', text: input, time };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setIsTyping(true); // Show typing animation

        let botMsgId = null;

        try {
            const token = localStorage.getItem('agro_token');
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: currentInput })
            });

            if (!response.ok) throw new Error('Failed to connect to AI service');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';
            let startedStreaming = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                if (!startedStreaming && accumulatedText.length > 0) {
                    startedStreaming = true;
                    setIsTyping(false); // Hide typing indicator
                    botMsgId = Date.now();
                    // Create the actual bot message bubble
                    setMessages(prev => [...prev, {
                        id: botMsgId,
                        sender: 'bot',
                        text: '',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isStreaming: true
                    }]);
                }

                if (botMsgId) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMsgId
                            ? { ...msg, text: accumulatedText, isStreaming: false }
                            : msg
                    ));
                }
            }

        } catch (error) {
            console.error("AI Chat Error:", error);
            setIsTyping(false);
            const errorMsg = `⚠️ Connection error: ${error.message}. Ensure Ollama is running.`;
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: errorMsg,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    if (!localStorage.getItem('agro_token')) {
        return (
            <div className="main-container section-padding">
                <header style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, #2c3e50, #000000)', padding: '1rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <Bot color="#00d2ff" size={40} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '3.5rem' }}>AI Agriculture <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Advisor</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0.75rem auto 0' }}>
                            Get specialized AI-powered farming advice available exclusively for registered members.
                        </p>
                    </motion.div>
                </header>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <motion.div
                        className="card"
                        style={{ padding: '4rem 3rem', textAlign: 'center', borderRadius: '32px', border: '1px dashed var(--border)', background: 'rgba(0,0,0,0.02)' }}
                    >
                        <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Registered Access Only</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            AgroAssist AI uses local intelligence to provide personalized crop guidance, pest diagnostics, and soil health advice. Please sign in to unleash its full potential.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '1rem 3rem', borderRadius: '100px' }}
                            onClick={() => window.location.hash = '#login'}
                        >
                            Sign In to Access AI
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!isChatActive) {
        return (
            <div className="main-container section-padding">
                <header style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, #2c3e50, #000000)', padding: '1rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <Bot color="#00d2ff" size={40} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '3.5rem' }}>AI Agriculture <span className="serif" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Advisor</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0.75rem auto 0' }}>
                            Ask AgroAssist AI about crops, soil health, fertilizers, pest control, irrigation, market insights, and government schemes.
                        </p>
                    </motion.div>
                </header>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <motion.div
                        className="card"
                        style={{
                            padding: '4rem 3rem',
                            textAlign: 'center',
                            borderRadius: '40px',
                            background: 'white',
                            border: '2px solid transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2rem',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, borderColor: 'var(--primary)' }}
                    >
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.03 }}>
                            <Cpu size={300} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', marginBottom: '1rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', textAlign: 'left' }}>
                                <Zap size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Fast & Local</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Powered by Mistral, running securely on your hardware.</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', textAlign: 'left' }}>
                                <Sparkles size={24} color="#00d2ff" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Farming Focus</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Specialized knowledge in agriculture and rural development.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsChatActive(true)}
                            className="btn btn-primary"
                            style={{ padding: '1.2rem 3rem', borderRadius: '100px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-primary)' }}
                        >
                            Start AI Chat <ChevronRight size={24} />
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container section-padding" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <motion.div
                className="card"
                style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xl)' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Chat Header */}
                <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button onClick={() => setIsChatActive(false)} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}><ArrowLeft size={24} /></button>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2c3e50, #000000)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={28} color="#00d2ff" />
                            </div>
                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#00b894', border: '3px solid white', borderRadius: '50%' }}></div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                AgroAssist AI <ShieldCheck size={18} color="var(--primary)" />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#00b894', fontWeight: 700 }}>Mistral Local Agent • Online</div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#edf2f7', padding: '0.4rem 1rem', borderRadius: '100px' }}>AI Advisor Session</span>
                    </div>

                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    padding: '1.25rem 1.75rem',
                                    borderRadius: msg.sender === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                    background: msg.sender === 'user' ? 'var(--primary)' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text)',
                                    boxShadow: msg.sender === 'user' ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    fontWeight: 500,
                                    border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none',
                                    fontStyle: msg.isStreaming ? 'italic' : 'normal',
                                    opacity: msg.isStreaming ? 0.7 : 1
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.5rem', fontWeight: 600 }}>{msg.time}</div>
                            </motion.div>
                        ))}
                        {isTyping && <TypingIndicator />}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{ padding: '1.5rem 2.5rem', background: 'white', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Type your agricultural query here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isLoading}
                                style={{
                                    margin: 0,
                                    padding: '1.25rem 1.75rem',
                                    borderRadius: '16px',
                                    border: '2px solid #f1f5f9',
                                    background: '#f8fafc',
                                    fontSize: '1.1rem',
                                    width: '100%',
                                    transition: 'var(--transition)',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                            />
                            <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.75rem' }}>
                                <Zap size={24} color="var(--primary)" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ borderRadius: '16px', width: '60px', height: '60px', padding: 0 }}
                        >
                            {isLoading ? <Loader2 className="spinning" size={24} /> : <Send size={24} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExpertChat;
