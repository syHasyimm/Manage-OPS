import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, Send, Sparkles, X } from 'lucide-react';

const WELCOME = 'Halo! Ada yang bisa saya bantu terkait pendaftaran siswa baru?';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: WELCOME },
    ]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
        });
    }, [messages, isLoading, reducedMotion]);

    useEffect(() => {
        const openChat = () => setIsOpen(true);
        window.addEventListener('spmb:open-chat', openChat);
        return () => window.removeEventListener('spmb:open-chat', openChat);
    }, []);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

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

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    const panelMotion = reducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 20, scale: 0.96 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 12, scale: 0.98 },
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
          };

    return (
        <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chat-panel"
                        {...panelMotion}
                        className="flex h-[min(31rem,calc(100dvh-6.5rem))] w-[calc(100vw-1.5rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-[0_24px_70px_-24px_rgba(7,24,39,.65)] sm:w-[22rem]"
                    >
                        <div className="bg-[#071827] px-4 py-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gold-300 text-navy-950">
                                        <Bot className="h-5 w-5" />
                                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#071827]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-white">Asisten SPMB</p>
                                            <Sparkles className="h-3.5 w-3.5 text-gold-300" />
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-navy-300">AI | Siap membantu</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-2 text-navy-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                                    aria-label="Tutup chat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex-1 space-y-3 overflow-y-auto bg-[#f7f7f4] px-3 py-4"
                            role="log"
                            aria-live="polite"
                            aria-label="Percakapan dengan Asisten SPMB"
                        >
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                                            message.sender === 'user'
                                                ? 'rounded-br-sm bg-gold-300 text-navy-950'
                                                : 'rounded-bl-sm border border-navy-100 bg-white text-navy-800'
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={reducedMotion ? false : { opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center gap-1 rounded-xl rounded-bl-sm border border-navy-100 bg-white px-3 py-3">
                                        {[0, 1, 2].map((dot) => (
                                            <span
                                                key={dot}
                                                className={`h-1.5 w-1.5 rounded-full bg-navy-400 ${reducedMotion ? '' : 'animate-bounce'}`}
                                                style={{ animationDelay: `${dot * 150}ms` }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="flex items-center gap-2 border-t border-navy-100 bg-white px-3 py-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={onKeyDown}
                                aria-label="Pertanyaan untuk Asisten SPMB"
                                placeholder="Tulis pertanyaan..."
                                disabled={isLoading}
                                className="flex-1 rounded-lg border border-navy-200 bg-navy-50 px-3 py-2.5 text-xs text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/30 disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={send}
                                disabled={!input.trim() || isLoading}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-white transition-colors hover:bg-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-40"
                                aria-label="Kirim pesan"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                whileHover={reducedMotion ? undefined : { y: -3, scale: 1.03 }}
                whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#071827] text-white shadow-[0_14px_34px_-12px_rgba(7,24,39,.8)] ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
                aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
                aria-expanded={isOpen}
            >
                <span className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-gold-300" />
                {isOpen
                    ? <X className="h-5 w-5" />
                    : <Bot className="h-6 w-6 text-gold-300" />
                }
                {!isOpen && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#071827]" />
                )}
            </motion.button>
        </div>
    );
}
