/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ChevronRight, Hash, Loader2, Sparkles, BookOpen, Map, Palette, Dumbbell, Zap, ArrowLeft, Atom, Microscope, FlaskConical, MessageSquare, Send, User, Bot, Trash2 } from 'lucide-react';
import { Question } from './types';
import { generateOromoQuestions, sendChatMessage } from './services/geminiService';

type AppMode = 'menu' | 'quiz' | 'chat';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const TOPICS = [
  { id: 'physics', name: 'Fiiziksii K-11', icon: Atom, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'biology', name: 'Baayoloji K-11', icon: Microscope, color: 'bg-lime-100 text-lime-700 border-lime-200' },
  { id: 'chemistry', name: 'Keemistiri K-11', icon: FlaskConical, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'seenaa', name: 'Seenaa', icon: BookOpen, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'aadaa', name: 'Aadaa', icon: Palette, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'geography', name: 'Ji\'oogiraafii', icon: Map, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'sportii', name: 'Sportii', icon: Dumbbell, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'waliigala', name: 'Waliigala', icon: Zap, color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('menu');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const fetchQuestions = useCallback(async (selectedTopic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuestions = await generateOromoQuestions(10, selectedTopic);
      setQuestions(newQuestions);
      setCurrentStep(0);
      setScore(0);
      setIsFinished(false);
      setTopic(selectedTopic);
      setMode('quiz');
    } catch (err) {
      setError("Dadhabbii uumameera. Maaloo deebisii yaali.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startQuiz = (selectedTopic: string) => {
    fetchQuestions(selectedTopic);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: inputMessage }] };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(currentInput, chatMessages);
      const aiMsg: ChatMessage = { role: 'model', parts: [{ text: response }] };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = { role: 'model', parts: [{ text: "Dadhabbii uumameera. Maaloo irra deebisii yaali." }] };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const currentQuestion = questions[currentStep];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || feedback) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      setShowAnswer(true);
    }

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(s => s + 1);
        setUserAnswer('');
        setFeedback(null);
        setShowAnswer(false);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  const restartQuiz = () => {
    setTopic(null);
    setQuestions([]);
    setMode('menu');
  };

  const progress = questions.length > 0 ? ((currentStep) / questions.length) * 100 : 0;

  if (mode === 'menu' && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 font-sans text-[#1A1A1A]">
        <div className="max-w-md w-full">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-[#5A5A40] mb-2">Kayo Tolesa app</h1>
            <p className="text-[#5A5A40]/60 italic">AI fayyadamanii baradhu</p>
          </header>

          <div className="grid gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('chat')}
              className="w-full bg-[#5A5A40] p-6 rounded-[24px] shadow-lg flex items-center gap-4 text-left transition-all text-white group"
            >
              <div className="p-4 rounded-2xl bg-white/20">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold">Kayo AI Chat</h3>
                <p className="text-xs text-white/60 uppercase tracking-widest font-black">AI wajjin haasa'i</p>
              </div>
              <ChevronRight className="text-white/40 group-hover:text-white transition-colors" />
            </motion.button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E5DF]"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-[#5A5A40]/30 font-bold bg-[#F5F5F0] px-4">Gaaffilee & Quiz</div>
            </div>

            {TOPICS.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz(t.name)}
                className="w-full bg-white p-5 rounded-[24px] shadow-sm border border-[#E5E5DF] flex items-center gap-4 text-left transition-all hover:shadow-md group"
              >
                <div className={`p-3 rounded-2xl ${t.color} transition-colors group-hover:bg-opacity-80`}>
                  <t.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-bold">{t.name}</h3>
                </div>
                <ChevronRight className="text-[#5A5A40]/20 group-hover:text-[#5A5A40] transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'chat') {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col font-sans text-[#1A1A1A]">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E5DF] p-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={restartQuiz} className="p-2 hover:bg-[#F5F5F0] rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-[#5A5A40]" />
              </button>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#5A5A40]">Kayo AI Chat</h1>
                <p className="text-[10px] text-green-600 uppercase tracking-widest font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            {chatMessages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors"
                title="Chat qulqulleessi"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full pb-32">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 mt-20">
              <div className="p-6 bg-white rounded-full mb-4 shadow-sm border border-[#E5E5DF]">
                <MessageSquare size={48} className="text-[#5A5A40]" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Akkam ree?</h2>
              <p className="max-w-xs italic text-sm">Hagam keessan, waa'ee barnootaa ykn aadaa Oromoo na gaafachuu dandeessu.</p>
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-xl h-fit ${msg.role === 'user' ? 'bg-[#5A5A40] text-white' : 'bg-white border border-[#E5E5DF]'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} className="text-[#5A5A40]" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-3xl ${
                  msg.role === 'user' 
                    ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                    : 'bg-white border border-[#E5E5DF] rounded-tl-none shadow-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
              </motion.div>
            ))
          )}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#E5E5DF] h-fit">
                <Bot size={20} className="text-[#5A5A40]" />
              </div>
              <div className="bg-white border border-[#E5E5DF] p-4 rounded-3xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/30 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input area */}
        <footer className="bg-white border-t border-[#E5E5DF] p-4 fixed bottom-0 left-0 right-0 z-20">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Waan xiinxaluu barbaadde barreessi..."
              className="flex-1 bg-[#F5F5F0] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-[#5A5A40] text-white p-4 rounded-2xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              <Send size={24} />
            </button>
          </form>
        </footer>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 font-sans text-[#1A1A1A]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-12 h-12 text-[#5A5A40]" />
        </motion.div>
        <h2 className="text-2xl font-serif font-bold text-[#5A5A40] animate-pulse">Gaaffilee qopheessaa jirra...</h2>
        <p className="text-[#5A5A40]/60 mt-2 italic text-sm text-center max-w-xs">
          AI fayyadamnee gaaffilee haaraa fi bohaarsaa ta'an isinii qopheessaa jirra.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 font-sans text-[#1A1A1A]">
        <div className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center border border-red-100">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4 text-red-900">Dogoggora!</h1>
          <p className="text-red-700/80 mb-10">{error}</p>
          <button
            onClick={fetchQuestions}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A4A35] transition-colors"
          >
            <RotateCcw size={20} />
            Deebisii yaali
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 font-sans text-[#1A1A1A]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center border border-[#E5E5DF]"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#5A5A40]/10 rounded-full">
                <Trophy className="w-16 h-16 text-[#5A5A40]" />
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-2">Galaatoomaa!</h1>
            <p className="text-[#5A5A40] mb-10 italic">Quiz Xumurameera</p>
            
            <div className="bg-[#F5F5F0] rounded-3xl p-8 mb-10 border border-[#E5E5DF]">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#5A5A40]/40 mb-3">Qabxii kee (Score)</p>
              <p className="text-6xl font-serif font-bold text-[#5A5A40]">{score} / {questions.length}</p>
            </div>

            <button
              onClick={restartQuiz}
              className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A4A35] transition-colors active:scale-95"
            >
              <Sparkles size={20} />
              Gaaffilee Haaraa Fidi
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 font-sans text-[#1A1A1A]">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={restartQuiz}
              className="p-2 hover:bg-[#5A5A40]/10 rounded-full text-[#5A5A40] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-[#5A5A40]">Beekkumsa {topic}</h1>
              <p className="text-[10px] text-[#5A5A40]/60 uppercase tracking-[0.2em] font-black">AI-tti Kan Qophaa'e</p>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded-full border border-[#E5E5DF] text-xs font-bold flex items-center gap-2">
            <Hash size={12} className="text-[#5A5A40]" />
            {currentStep + 1} / {questions.length}
          </div>
        </div>

        {/* Card */}
        <motion.div 
          layout
          className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-[#E5E5DF] overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#F5F5F0] rounded-full mb-10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#5A5A40]"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#5A5A40]/30 underline underline-offset-4">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-medium mb-10 leading-tight">
                {currentQuestion.text}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Deebii kee galchi..."
                    disabled={!!feedback}
                    className="w-full bg-[#F5F5F0] border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {feedback === 'correct' && <CheckCircle2 className="text-green-600" />}
                    {feedback === 'wrong' && <XCircle className="text-red-600" />}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!userAnswer.trim() || !!feedback}
                  className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  Gurguri (Submit)
                  <ChevronRight size={20} />
                </motion.button>
              </form>

              {showAnswer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-sm"
                >
                  <p className="font-bold mb-1">Deebii Sirrii:</p>
                  <p className="text-lg uppercase font-black">{currentQuestion.answer}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer Score */}
        <div className="mt-6 text-center">
          <p className="text-[#5A5A40]/40 text-xs font-medium uppercase tracking-widest">
            Tapha qabxii: <span className="text-[#5A5A40] font-bold">{score}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
