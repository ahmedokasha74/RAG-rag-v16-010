"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Play, CheckCircle2, BarChart3 } from "lucide-react";

export default function AIInterviewPage() {
  const [interviewState, setInterviewState] = useState("ready"); // ready, asking, listening, analyzing, completed
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const MOCK_QUESTIONS = [
    "Welcome! To start, can you tell me about a time you solved a complex technical problem under pressure?",
    "That's interesting. How do you usually handle disagreements regarding technical decisions within a team?",
    "Can you describe your experience with modern frontend frameworks like React and Next.js?",
    "Finally, where do you see your technical focus heading in the next 2 to 3 years?"
  ];

  const totalQuestions = MOCK_QUESTIONS.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = () => {
    setInterviewState("asking");
    setMessages([]);
    setCurrentQuestionIdx(0);
    askQuestion(0);
  };

  const askQuestion = (index) => {
    setInterviewState("asking");
    // Simulate AI typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: MOCK_QUESTIONS[index] }]);
      setInterviewState("listening");
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || interviewState !== "listening") return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: inputText }]);
    setInputText("");
    setInterviewState("analyzing");

    // Simulate analyzing and moving to next question
    setTimeout(() => {
      if (currentQuestionIdx < totalQuestions - 1) {
        const nextIdx = currentQuestionIdx + 1;
        setCurrentQuestionIdx(nextIdx);
        askQuestion(nextIdx);
      } else {
        setInterviewState("completed");
      }
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Orb animations based on state
  const orbVariants = {
    ready: { scale: 1, opacity: 0.5, boxShadow: "0px 0px 20px rgba(0,240,255,0.2)" },
    asking: { 
      scale: [1, 1.1, 1], 
      opacity: [0.6, 0.9, 0.6], 
      boxShadow: ["0px 0px 30px rgba(0,240,255,0.4)", "0px 0px 60px rgba(0,240,255,0.8)", "0px 0px 30px rgba(0,240,255,0.4)"],
      transition: { repeat: Infinity, duration: 1.5 } 
    },
    listening: { 
      scale: [1, 1.05, 1], 
      opacity: [0.8, 1, 0.8],
      boxShadow: ["0px 0px 40px rgba(0,255,128,0.4)", "0px 0px 80px rgba(0,255,128,0.8)", "0px 0px 40px rgba(0,255,128,0.4)"],
      transition: { repeat: Infinity, duration: 1 }
    },
    analyzing: {
      rotate: [0, 360],
      scale: 1,
      opacity: 0.8,
      boxShadow: "0px 0px 50px rgba(180,0,255,0.6)",
      transition: { repeat: Infinity, duration: 1, ease: "linear" }
    },
    completed: { scale: 1, opacity: 0.3, boxShadow: "0px 0px 10px rgba(255,255,255,0.1)" }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Interview Agent</h1>
          <p className="text-muted-foreground mt-1">Real-time adaptive technical interview</p>
        </div>
        
        {interviewState !== "ready" && interviewState !== "completed" && (
          <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-end w-full md:w-64">
            <div className="flex justify-between w-full text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-primary">Q{currentQuestionIdx + 1} of {totalQuestions}</span>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {interviewState === "completed" ? (
        <EvaluationScreen />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
          {/* Left Panel: Current Question Display */}
          <div className="w-full lg:w-1/3 glass-panel rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none" />
            
            {interviewState === "ready" ? (
              <div className="text-center z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/30">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Ready to Start
                </h3>
                <p className="text-muted-foreground mb-8">
                  The AI will ask you a series of technical questions. Take your time to type out your answers clearly.
                </p>
                <button 
                  onClick={startInterview}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  Begin Assessment
                </button>
              </div>
            ) : (
              <div className="z-10 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Current Question
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex items-center"
                  >
                    <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed text-foreground">
                      {MOCK_QUESTIONS[currentQuestionIdx]}
                    </h2>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground flex items-center">
                    {interviewState === "asking" && "AI is typing..."}
                    {interviewState === "listening" && "Waiting for your answer..."}
                    {interviewState === "analyzing" && "Analyzing your response..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Conversation */}
          <div className="flex-1 glass-panel rounded-3xl flex flex-col relative overflow-hidden">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && interviewState !== "ready" && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Starting conversation...
                </div>
              )}
              
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-2xl ${
                      msg.role === "ai" 
                        ? "bg-primary/10 border border-primary/20 text-foreground rounded-tl-none" 
                        : "bg-background/60 border border-border/50 text-foreground rounded-tr-none"
                    }`}>
                      {msg.role === "ai" && <div className="text-xs text-primary font-semibold mb-2 uppercase tracking-wider">AI Interviewer</div>}
                      {msg.role === "user" && <div className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">You</div>}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background/30 backdrop-blur-md">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={interviewState === "listening" ? "Type your detailed answer here..." : "Wait for the AI to finish..."}
                    disabled={interviewState !== "listening"}
                    className="w-full bg-background/50 border border-border/50 rounded-xl py-4 px-5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none min-h-[60px] max-h-[200px]"
                    rows={1}
                  />
                </div>

                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || interviewState !== "listening"}
                  className="p-4 h-[60px] w-[60px] flex items-center justify-center bg-primary text-primary-foreground rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Evaluation Screen Component
function EvaluationScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 glass-panel p-8 rounded-3xl"
    >
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Interview Completed</h2>
        <p className="text-muted-foreground mt-2">Here is your AI-generated evaluation report.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Technical Knowledge", score: 88, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { label: "Problem Solving", score: 92, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
          { label: "Communication", score: 75, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
          { label: "Role Relevance", score: 85, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.bg} border ${stat.border} flex flex-col items-center justify-center`}>
            <span className="text-sm text-muted-foreground text-center h-10">{stat.label}</span>
            <span className={`text-4xl font-black ${stat.color}`}>{stat.score}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 glass p-6 rounded-2xl border border-border/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Detailed Feedback
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-green-400 mb-1">Strengths</h4>
              <p className="text-sm text-muted-foreground">Excellent demonstration of system architecture design and modern React patterns. Your response on handling team disagreements showed strong emotional intelligence.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-yellow-400 mb-1">Areas for Improvement</h4>
              <p className="text-sm text-muted-foreground">Could provide more concrete metrics when discussing past complex technical problems. Try to use the STAR method more strictly.</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Final Decision</h3>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 mb-2">
            HIRE
          </div>
          <p className="text-sm text-muted-foreground">
            Strong fit for Senior Frontend Engineering roles.
          </p>
          <button className="mt-6 w-full py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all">
            Download Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}
