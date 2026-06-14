'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Cpu, Activity } from 'lucide-react';
import { WorkflowState } from '@/app/page';

export default function AgentCommandCenter({ workflowState, setWorkflowState, setCurrentTask, messages, setMessages }: any) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, workflowState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || workflowState !== 'IDLE') return;

        const task = input.trim();
        setInput('');
        setCurrentTask(task);
        setMessages((prev: any) => [...prev, { role: 'user', text: task }]);
        
        // Step 1: Researching
        setWorkflowState('RESEARCHING');
        setMessages((prev: any) => [...prev, { role: 'agent', text: 'Acknowledged. Deploying procurement agents to scan the global inventory network...' }]);

        // Simulate LLM delay for research
        setTimeout(() => {
            // Step 2: Negotiating
            setWorkflowState('NEGOTIATING');
            setMessages((prev: any) => [...prev, { role: 'agent', text: 'Vendors located. Initiating autonomous high-frequency negotiation protocols to secure the best bulk pricing.' }]);
            
            setTimeout(() => {
                // Step 3: Ready
                setWorkflowState('READY');
                setMessages((prev: any) => [...prev, { role: 'agent', text: 'Transaction bundled and finalized. The optimal deal is ready for your execution on the Canvas.' }]);
            }, 6000);
            
        }, 4000);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            {/* Header */}
            <div className="h-[80px] px-6 border-b border-gray-800 flex items-center justify-between flex-shrink-0 bg-[#0A0A0A]">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Cpu className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-white tracking-tight">Nexmart Core</h2>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">System Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Activity className="h-16 w-16 mb-4 text-gray-500" />
                        <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-2">Awaiting Directive</p>
                        <p className="text-xs text-gray-500 max-w-[250px]">Input your procurement parameters. The agent fleet will execute autonomously.</p>
                    </div>
                ) : (
                    messages.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.role === 'agent' && <span className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 ml-1">Nexmart Agent</span>}
                            <div className={`px-5 py-3.5 max-w-[90%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-black font-medium rounded-2xl rounded-tr-sm' : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-2xl rounded-tl-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {workflowState !== 'IDLE' && workflowState !== 'READY' && (
                    <div className="flex items-center gap-3 text-emerald-400 text-sm font-medium mt-2 px-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="animate-pulse">{workflowState === 'RESEARCHING' ? 'Scanning network...' : 'Haggling with vendors...'}</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#0A0A0A] border-t border-gray-800 flex-shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-20"></div>
                    <div className="relative flex items-center bg-gray-950 border border-gray-800 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-colors">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={workflowState !== 'IDLE'}
                            placeholder="e.g., Procure 50 laptops under $500 each..."
                            className="flex-1 bg-transparent border-none text-white px-5 py-4 text-sm outline-none placeholder:text-gray-600 disabled:opacity-50"
                        />
                        <button 
                            type="submit"
                            disabled={workflowState !== 'IDLE' || !input.trim()}
                            className="h-12 w-12 mr-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
