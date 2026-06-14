'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { ProductCard, ProductResult } from './ui/ProductCard'

type Message = {
  id: string
  role: 'user' | 'agent'
  text: string
  isSearching?: boolean
  products?: ProductResult[]
}

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', text: 'Hello. I am your Nexmart autonomous agent. What do you need to procure today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setSearchStatus('Agent deploying search protocols...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      })

      if (!res.ok) throw new Error('Agent API unreachable')
      
      const data = await res.json()
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: data.reply,
        products: data.products
      }
      setMessages(prev => [...prev, agentMessage])
      
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'agent', 
        text: 'Error: Connection to LLM orchestrator failed. Ensure local Ollama is running.' 
      }])
    } finally {
      setIsLoading(false)
      setSearchStatus('')
    }
  }

  const handlePurchase = (product: ProductResult) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'agent',
      text: `Understood. Executing smart contract to secure ${product.title} from ${product.source}. Deducting ${product.price} from your wallet.`
    }])
  }

  return (
    <div className="flex h-full w-full flex-col relative text-sm">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-nexmart-cyan/80 to-nexmart-cyan/60 text-[#0B1021] rounded-tr-sm' 
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                }`}
              >
                {msg.role === 'agent' && <Sparkles className="mb-1 h-3 w-3 text-nexmart-orange" />}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Render dynamic product cards if provided by LLM */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 flex w-[90%] flex-col gap-2 relative z-10 self-start">
                  {msg.products.map(p => (
                    <ProductCard key={p.id} product={p} onPurchase={handlePurchase} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-col items-start"
            >
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 p-3 text-white/70 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-nexmart-cyan" />
                <span className="animate-pulse">{searchStatus || 'Processing...'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} className="h-2" />
      </div>

      <div className="p-4 pt-1 backdrop-blur-xl bg-nexmart-bg/50 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Instruct your agent..."
            className="w-full rounded-full border border-white/10 bg-[#0B1021]/80 px-4 py-3 pr-12 text-white placeholder-white/30 outline-none focus:border-nexmart-cyan/50 focus:ring-1 focus:ring-nexmart-cyan/50 transition-all font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-nexmart-cyan text-[#0B1021] transition hover:bg-opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4 ml-[-1px]" />
          </button>
        </form>
        <div className="mt-2 text-center text-[10px] text-white/30 flex justify-center items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Agentic execution environment
        </div>
      </div>
    </div>
  )
}
