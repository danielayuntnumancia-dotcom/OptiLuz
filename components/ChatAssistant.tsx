import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage, BillAnalysis } from '../types';

interface ChatAssistantProps {
  analysisData: BillAnalysis | null;
  onUpdateAnalysis: (newData: BillAnalysis) => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ analysisData, onUpdateAnalysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: '¡Hola! He analizado tu factura. Si hay algún dato incorrecto o si tienes hábitos especiales (coche eléctrico, teletrabajo...), dímelo y recalcularé las mejores tarifas para ti.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevAnalysisIdRef = useRef<string | undefined>(undefined);

  // Detect new fresh analysis upload to reset chat slightly or inform user
  useEffect(() => {
    if (analysisData?.cups && analysisData.cups !== prevAnalysisIdRef.current) {
        prevAnalysisIdRef.current = analysisData.cups;
        // Optional: Add a message when a completely new bill is uploaded
    }
  }, [analysisData]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Convert internal message format to Gemini history format
      // Filter out messages that might be purely UI updates in a real app, but here we just take text
      const history = messages
        .filter(m => !m.text.startsWith('🔄')) // Filter out system messages if any
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

      const responseText = await sendChatMessage(history, userMsg.text, analysisData);
      
      let finalResponseText = responseText;
      
      // Check if response is JSON (Dashboard Update)
      const trimmedResponse = responseText?.trim();
      if (trimmedResponse && (trimmedResponse.startsWith('{') || trimmedResponse.startsWith('```json'))) {
         try {
            // Clean up markdown if present
            const cleanJson = trimmedResponse.replace(/```json/g, '').replace(/```/g, '');
            const newAnalysis = JSON.parse(cleanJson);
            
            // Validate minimal structure
            if (newAnalysis.recommendations && newAnalysis.totalConsumption) {
                onUpdateAnalysis(newAnalysis);
                finalResponseText = "🔄 He actualizado el dashboard con los nuevos parámetros y recalculado las mejores ofertas para ti.";
            }
         } catch (e) {
             console.error("Error parsing dashboard update JSON", e);
             finalResponseText = "Entendí los cambios, pero tuve un problema técnico al actualizar el gráfico visualmente. Sin embargo, ten en cuenta esos factores.";
         }
      } else if (!finalResponseText) {
          finalResponseText = "Lo siento, no pude procesar eso.";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: finalResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Hubo un error de conexión. Intenta de nuevo.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-20 w-full transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Asistente IA</h3>
         </div>
         <span className="text-xs text-slate-400 dark:text-slate-500">Conectado</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-br-none' 
                : msg.text.startsWith('🔄') 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40 italic'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
            <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <div className="flex gap-2 items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Tengo coche eléctrico..."
              className="flex-1 px-3 py-1 bg-transparent focus:outline-none text-sm text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              disabled={isTyping}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
            </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">La IA puede cometer errores. Verifica la info.</p>
      </form>
    </div>
  );
};

export default ChatAssistant;