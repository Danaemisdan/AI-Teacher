'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, ExternalLink, ShieldCheck } from 'lucide-react'

export interface ProductResult {
  id: string
  title: string
  price: string
  source: string
  url: string
  confidence?: string
}

export function ProductCard({ product, onPurchase }: { product: ProductResult, onPurchase: (p: ProductResult) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative mb-3 flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
    >
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-nexmart-cyan/20 blur-[30px]" />
      
      <div className="z-10 flex items-start justify-between">
        <div className="flex flex-col pr-4">
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-nexmart-cyan">
            <ShieldCheck className="h-3 w-3" />
            Verified Vendor
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-white">{product.title}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexmart-cyan to-nexmart-orange glow-text">
            {product.price}
          </span>
        </div>
      </div>

      <div className="z-10 mt-2 flex items-center justify-between text-xs text-white/50">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-nexmart-orange text-nexmart-orange" />
          4.8
        </span>
        <span className="flex items-center gap-1">
          Source: {product.source}
          <a href={product.url} target="_blank" rel="noreferrer" className="hover:text-nexmart-cyan">
             <ExternalLink className="h-3 w-3" />
          </a>
        </span>
      </div>

      <button 
        onClick={() => onPurchase(product)}
        className="z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nexmart-cyan/80 to-nexmart-cyan/60 p-2.5 text-sm font-semibold text-nexmart-bg shadow-[0_0_15px_rgba(0,240,255,0.3)] transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95"
      >
        <ShoppingCart className="h-4 w-4" />
        Authorize Purchase
      </button>
    </motion.div>
  )
}
