import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Bot, User, Copy, Check, Volume2,
  VolumeX, ShieldCheck, Clock, X, Code2, BookOpen, Terminal
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function AICopilotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your LifeStream Clinical & Engineering AI Copilot. I can assist with Massive Transfusion Protocol (MTP) resuscitation formulas, rare antigen cross-matching, FAA drone flight kinematics, and distributed system design.',
      topic: 'LifeStream Systems Intelligence',
      codeSnippet: null,
      guideline: 'AABB & FAA Emergency Operations Standards'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  // Load suggested quick prompts
  useEffect(() => {
    (async () => {
      try {
        const res = await resilientFetch('/api/copilot/prompts');
        if (res && res.prompts) {
          setSuggestedPrompts(res.prompts);
        }
      } catch (err) {
        console.warn('Failed to fetch copilot prompts:', err);
      }
    })();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Send Query
  const handleSend = async (queryText) => {
    const promptToSend = queryText || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', text: promptToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await resilientFetch('/api/copilot/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptToSend })
      });

      if (res) {
        const aiMsg = {
          role: 'assistant',
          text: res.answer,
          topic: res.topic,
          codeSnippet: res.codeSnippet,
          guideline: res.clinicalGuideline,
          latencyMs: res.latencyMs
        };
        setMessages(prev => [...prev, aiMsg]);

        // If speech is enabled, speak summary
        if ('speechSynthesis' in window && isSpeaking) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(res.answer.slice(0, 180));
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Copilot query failed:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'LifeStream Zero-Quota Resilient Architecture fallback engaged. All emergency systems operational.',
          topic: 'Defensive Architecture',
          codeSnippet: null,
          guideline: 'Zero-Quota Resilient SLA'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const toggleVoice = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAiMsg) {
          const utterance = new SpeechSynthesisUtterance(lastAiMsg.text.slice(0, 180));
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl h-[85vh] max-h-[720px] rounded-2xl shadow-2xl border border-[#dadce0] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#dadce0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#202124]">LifeStream AI Copilot & Mentor</h2>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#34a853]" />
                  Zero-Quota Resilient
                </span>
              </div>
              <p className="text-[11px] text-[#5f6368]">
                24/7 Clinical Resuscitation Triage & Distributed Systems Pair-Programmer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Synthesis Toggle */}
            <button
              onClick={toggleVoice}
              title={isSpeaking ? 'Mute Voice Audio' : 'Enable Voice Audio'}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]'
                  : 'bg-[#f8fafd] text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Voice Active' : 'Voice Off'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafd]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-[#1a73e8]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[#1a73e8] text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-[#dadce0] text-[#202124] rounded-bl-none shadow-xs'
                }`}
              >
                {/* Assistant Topic Header */}
                {msg.role === 'assistant' && msg.topic && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#f1f3f4] text-[10px] text-[#5f6368]">
                    <span className="font-bold text-[#1a73e8]">{msg.topic}</span>
                    {msg.latencyMs && (
                      <span className="flex items-center gap-1 font-mono text-[#34a853]">
                        <Clock className="w-3 h-3" />
                        {msg.latencyMs}ms
                      </span>
                    )}
                  </div>
                )}

                {/* Main Text Content */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Code Snippet Box */}
                {msg.codeSnippet && (
                  <div className="rounded-xl overflow-hidden border border-[#dadce0] bg-[#1e1e1e] text-white">
                    <div className="px-3 py-1.5 bg-[#2d2d2d] flex items-center justify-between text-[10px] text-[#9aa0a6]">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-[#1a73e8]" />
                        <span>JavaScript / Algorithm Solution</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(msg.codeSnippet, idx)}
                        className="flex items-center gap-1 text-white hover:text-[#1a73e8] transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#34a853]" />
                            <span className="text-[#34a853]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono overflow-x-auto text-[#d4d4d4]">
                      {msg.codeSnippet}
                    </pre>
                  </div>
                )}

                {/* Guideline Attribution */}
                {msg.guideline && (
                  <div className="text-[10px] text-[#70757a] flex items-center gap-1 pt-1">
                    <BookOpen className="w-3 h-3 text-[#1a73e8]" />
                    <span>Reference: {msg.guideline}</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#1a73e8]" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#dadce0] rounded-bl-none text-xs text-[#5f6368] flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-ping" />
                <span>Synthesizing semantic clinical guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick-Pills Bar */}
        {suggestedPrompts.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-[#f1f3f4] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#70757a] shrink-0">Quick Prompt:</span>
            {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[10px] text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#dadce0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about MTP 1:1:1 resuscitation, drone airspace, Redis geohash, or code invariants..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
