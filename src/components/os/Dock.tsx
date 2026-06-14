'use client'
import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

import { LayoutDashboard, Shirt, Monitor, Home, Cross, ShoppingBasket, Wallet } from 'lucide-react';

import { useSpring } from 'framer-motion';

const stores = [
  { id: 'All', name: 'Nexmart Hub', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e074bfb54ba3f6571244_Competitor%20Research%20-%20XLarge.svg' },
  { id: 'Fashion', name: 'Fashion', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e0746be64ade385fe346_Advertiser%20Library%20-%20XLarge.svg' },
  { id: 'Tech', name: 'Electronics', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e074de2b2ca67e878a78_Shop%20library%20-%20XLarge.svg' },
  { id: 'Home', name: 'Home & Decor', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e074d01e3ec0bc590952_Product%20Library%20-%20XLarge.svg' },
  { id: 'Pharmacy', name: 'Pharmacy', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e074b802cb06a81d85d3_Ad%20Library%20-%20XLarge.svg' },
  { id: 'Groceries', name: 'Groceries', iconUrl: 'https://cdn.prod.website-files.com/69c4a4d640fdca68c1cc9685/69d1e074c5dccb4012165023_Portfolio%20-%20XLarge.svg' },
];

function DockItem({ store, activeStore, setActiveStore }: any) {
  const isActive = activeStore === store.id;

  return (
    <div className="relative flex flex-col items-center group">
      <button
        onClick={() => setActiveStore(store.id)}
        className={`w-14 h-14 relative flex items-center justify-center origin-bottom transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] hover:scale-[1.15] hover:-translate-y-3 ${isActive ? '-translate-y-2 scale-110' : ''}`}
      >
        <img 
            src={store.iconUrl} 
            alt={store.name}
            className="w-full h-full object-contain" 
        />
      </button>
      
      {/* macOS Style Tooltip */}
      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-xl text-black text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
        {store.name}
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-black/60 shadow-sm" />
      )}
    </div>
  );
}

export default function Dock({ activeStore, setActiveStore }: any) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        // Ultra-clean light glass container to match the bright, flat aesthetic
        className="flex items-end gap-4 px-5 py-3 bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] h-[80px]"
      >
        {stores.map((store) => (
          <DockItem 
            key={store.id} 
            store={store} 
            activeStore={activeStore} 
            setActiveStore={setActiveStore} 
            mouseX={mouseX} 
          />
        ))}
      </motion.div>
    </div>
  );
}
