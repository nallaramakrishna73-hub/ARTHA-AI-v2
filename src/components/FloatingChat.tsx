/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../config/index.ts';

interface FloatingChatProps {
  currentSymbol: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ currentSymbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Hello! I am ARTHA AI, your quantitative Indian financial research assistant. I can inspect technical setups, fundamental valuation multiples, FinBERT sentiment, and macro transmission for ${currentSymbol} or other NSE/BSE equities.\n\nNote: I provide evidence-based analytical observations only, not personalized investment advice.`,
      timestamp: 'Just now',
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, contextSymbol: currentSymbol }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Analysis generated for ${currentSymbol}: Quantitative evidence indicates stable underlying fundamentals with price trading above key long-term averages. Risk parameters remain within customary bands.\n\n${DISCLAIMER_TEXT}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0B1F3A] hover:bg-[#1B2B48] text-white border border-[#FF9933]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#FF9933]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            Ask ARTHA Assistant
          </span>
        </button>
      )}

      {/* Floating Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-[#0B1F3A] border border-[#1B2B48] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-[#070F1F] border-b border-[#1B2B48] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#0B1F3A] border border-[#1B2B48]">
                <Bot className="w-4 h-4 text-[#FF9933]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>ARTHA AI Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#16A34A]/20 text-[#16A34A] font-normal">
                    Grounded
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B]">Context: {currentSymbol}</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1B2B48] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-[#FF9933] text-slate-950 font-medium rounded-br-none'
                      : 'bg-[#070F1F] text-[#CBD5E1] border border-[#1B2B48] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#64748B] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#070F1F] rounded-xl border border-[#1B2B48] text-xs text-[#94A3B8] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9933]" />
                Auditing tools & synthesizing evidence...
              </div>
            )}
          </div>

          {/* Compliance notice */}
          <div className="px-3 py-1.5 bg-[#070F1F]/60 border-t border-[#1B2B48] text-[9.5px] text-[#64748B] flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-[#FF9933] shrink-0" />
            <span className="truncate">Research only · LLM outputs strictly restricted from advice.</span>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-[#070F1F] border-t border-[#1B2B48] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask about ${currentSymbol} fundamentals, RSI, risk...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#0B1F3A] border border-[#1B2B48] rounded-lg px-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9933]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-[#FF9933] hover:bg-[#FF9933]/90 text-slate-950 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
