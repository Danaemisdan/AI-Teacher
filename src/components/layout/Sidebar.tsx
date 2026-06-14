'use client'

import React, { useState } from 'react'
import { Plus, Clock, Bookmark, ShoppingCart, Box, Settings } from 'lucide-react'
import Image from 'next/image'

export function Sidebar() {
  const [activeTab, setActiveTab] = useState('Workspace')

  const libraryTabs = [
    { id: 'Workspace', icon: Plus, label: 'New Workspace' },
    { id: 'History', icon: Clock, label: 'Execution History' },
    { id: 'Saved', icon: Bookmark, label: 'Saved Assets' },
    { id: 'Cart', icon: ShoppingCart, label: 'Active Cart', badge: '3' },
    { id: 'Orders', icon: Box, label: 'Order Ledgers' }
  ]

  return (
    <div className="flex z-50 relative h-full w-64 flex-col border-r border-[#1a1a1a] bg-[#050505] p-5">
      {/* Absolute Minimal Logo */}
      <div className="flex items-center gap-3 px-2 pb-8 pt-2">
        <Image src="/logo.png" alt="Logo" width={24} height={24} className="opacity-90 grayscale" />
        <span className="text-[14px] font-medium tracking-tight text-white font-['Outfit']">Nexmart</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] font-['Outfit']">Dashboard</div>
        
        {libraryTabs.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
              activeTab === item.id 
              ? 'bg-[#1a1a1a] text-white' 
              : 'text-[#888888] hover:bg-[#111111] hover:text-[#cccccc]'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-[14px] w-[14px] shrink-0 ${activeTab === item.id ? 'text-white' : 'text-[#555555]'}`} />
              {item.label}
            </div>
            {item.badge && (
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-white text-[10px] font-bold text-black">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-[#888888] transition-colors hover:bg-[#111111] hover:text-white">
          <Settings className="h-[14px] w-[14px] shrink-0 text-[#555555]" />
          Settings
        </button>
      </div>
    </div>
  )
}
