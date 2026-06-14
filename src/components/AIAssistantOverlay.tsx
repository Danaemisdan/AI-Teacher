'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function AIAssistantOverlay() {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string, products?: any[]}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [mode, setMode] = useState<'chat' | 'negotiate'>('chat');
  const [negotiateProduct, setNegotiateProduct] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
      const handleOpenNegotiation = (e: any) => {
          setIsOpen(true);
          setMode('negotiate');
          setNegotiateProduct(e.detail);
          setMessages(prev => [
              ...prev,
              { role: 'agent', text: `I see you're interested in the ${e.detail.title}. It's currently priced at $${e.detail.price}. I'm authorized to offer a slight discount. What price were you thinking?` }
          ]);
      };
      window.addEventListener('open-negotiation', handleOpenNegotiation);
      return () => window.removeEventListener('open-negotiation', handleOpenNegotiation);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, history: messages, mode, negotiateProduct })
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let agentText = "";
      let recommendedProducts: any[] = [];

      setMessages(prev => [...prev, { role: 'agent', text: '' }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (line.includes('event: token')) {
              agentText += data;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: agentText };
                return newMsgs;
              });
            }
            if (line.includes('event: products') && Array.isArray(data)) {
                recommendedProducts = data;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], products: recommendedProducts };
                    return newMsgs;
                });
            }
            if (line.includes('event: negotiation_success')) {
                const dealItem = data;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: agentText + `\n\n✅ Deal verified! Added to cart at $${dealItem.price}.` };
                    return newMsgs;
                });
                addToCart(dealItem);
                setTimeout(() => {
                   setMode('chat');
                   setNegotiateProduct(null);
                }, 4000);
            }
            if (line.includes('event: done')) {
                setIsLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-16 w-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </button>

      {/* Overlay Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="h-[80px] bg-gray-900 text-white px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Nexmart Concierge</h3>
              <p className="text-xs font-medium flex gap-2">
                  <span className="text-emerald-400">Online • Agent</span>
                  {mode === 'negotiate' && <span className="bg-emerald-500/20 text-emerald-300 px-2 rounded-full">Haggling Mode</span>}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Bot className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">I'm your personal shopping assistant.<br/>How can I help you navigate Nexmart today?</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 max-w-[85%] rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? <span className="animate-pulse">Thinking...</span> : '')}
                </div>
                
                {/* Product Recommendations */}
                {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 w-full max-w-[90%]">
                        {msg.products.map(p => (
                            <div key={p.id} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-4 shadow-sm">
                                <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h4>
                                    <p className="text-blue-600 font-bold text-sm">${p.price.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => addToCart({ id: p.id, title: p.title, price: p.price, category: p.category || 'General', image: p.image || '' })}
                                    className="bg-gray-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors active:scale-95"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'negotiate' ? "Make an offer..." : "Ask for products, deals, or recommendations..."} 
              className="flex-1 bg-gray-100 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-900"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
