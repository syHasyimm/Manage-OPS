import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bot, Send, Sparkles, X } from 'lucide-react';

const WELCOME = 'Halo! Ada yang bisa saya bantu terkait pendaftaran siswa baru?';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen]     = useState(false);
    const [input, setInput]       = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: WELCOME },
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const send = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setMessages((prev) => [...prev, { sender: 'user', text }]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await axios.post('/chatbot/message', { message: text });
            setMessages((prev) => [...prev, { sender: 'bot', text: data.message }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: 'Maaf, terjadi gangguan. Silakan coba lagi.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
            {/* Chat window */}
            {isOpen && (
                <div className="flex h-[min(30rem,calc(100dvh-6.5rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl sm:w-80">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 px-4 py-3">
                        <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gold-500/10 blur-xl" />
                        <div className="pointer-events-none absolute -bottom-2 left-8 h-10 w-10 rounded-full bg-gold-400/10 blur-lg" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 shadow-lg">
                                    <Bot className="h-5 w-5" />
                                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-400 ring-2 ring-navy-900" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <p className="text-xs font-bold text-white">Asisten SPMB</p>
                                        <Sparkles className="h-3 w-3 text-gold-400" />
                                    </div>
                                    <p className="text-[10px] text-navy-300">AI · Siap membantu</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
                                aria-label="Tutup chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
                        role="log"
                        aria-live="polite"
                        aria-label="Percakapan dengan Asisten SPMB"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'rounded-br-sm bg-gold-500 text-navy-950'
                                            : 'rounded-bl-sm bg-navy-100 text-navy-800'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-navy-100 px-3 py-2.5">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400 [animation-delay:0ms]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400 [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400 [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 border-t border-navy-100 px-3 py-2.5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            aria-label="Pertanyaan untuk Asisten SPMB"
                            placeholder="Ketik pertanyaan Anda..."
                            disabled={isLoading}
                            className="flex-1 rounded-lg border border-navy-200 bg-navy-50 px-3 py-2 text-xs text-navy-900 placeholder:text-navy-400 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={send}
                            disabled={!input.trim() || isLoading}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white transition-colors hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-40"
                            aria-label="Kirim pesan"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-gold-500/25 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
                aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
            >
                {/* gold glow ring */}
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                {/* gold accent bar */}
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gold-500" />
                {isOpen
                    ? <X className="relative h-5 w-5" />
                    : (
                        <div className="relative flex flex-col items-center gap-0.5">
                            <Bot className="h-6 w-6 text-gold-400" />
                        </div>
                    )
                }
                {/* online dot */}
                {!isOpen && (
                    <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-400 ring-2 ring-navy-950">
                        <span className="h-1 w-1 animate-ping rounded-full bg-green-300" />
                    </span>
                )}
            </button>
        </div>
    );
}
