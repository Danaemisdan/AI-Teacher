import React from 'react';
import { Search, Heart, ShoppingCart, User, Menu, Target } from 'lucide-react';

interface HeaderProps {
    isLoggedIn: boolean;
    onOpenAuth: () => void;
    cartCount?: number;
}

export default function Header({ isLoggedIn, onOpenAuth, cartCount = 2 }: HeaderProps) {
    return (
        <header className="w-full bg-white flex flex-col z-50 sticky top-0 border-b border-gray-100 shadow-sm relative">
            {/* Topmost Banner */}
            <div className="w-full bg-black text-white text-xs py-2 px-4 flex justify-between items-center font-medium">
                <div className="flex-1 text-center flex items-center justify-center gap-2">
                    <span className="text-[#1e3a8a]">✨</span> AI Picks Just for You - Smarter Shopping, Better Choices!
                </div>
                <div className="flex items-center gap-3 absolute right-4">
                    <span>Download App</span>
                    <div className="flex gap-1">
                        <span className="opacity-80"></span>
                        <span className="opacity-80">🤖</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
                {/* Logo - Pushed to the left */}
                <div className="flex items-center flex-shrink-0 cursor-pointer flex-1">
                    <img src="/logo.png" alt="Nexmart" className="h-8 object-contain" />
                </div>

                {/* Center Notch for the AgentOrb */}
                <div className="flex justify-center items-center flex-shrink-0">
                    <div className="w-[200px] h-[40px]"></div>
                </div>

                {/* Actions - Pushed to the right */}
                <div className="flex items-center gap-8 flex-shrink-0 flex-1 justify-end">
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#1e3a8a] transition-colors group">
                        <Target className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">AI Assistant</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#1e3a8a] transition-colors group">
                        <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">Wishlist</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#1e3a8a] transition-colors group relative">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-[#1e3a8a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Cart</span>
                    </button>
                    <button 
                        onClick={!isLoggedIn ? onOpenAuth : undefined}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#1e3a8a] transition-colors group"
                    >
                        {isLoggedIn ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#3b82f6] text-white flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4" />
                            </div>
                        ) : (
                            <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-bold">{isLoggedIn ? 'Account' : 'Sign In'}</span>
                    </button>
                </div>
            </div>

            {/* Sub Nav & Search */}
            <div className="max-w-7xl mx-auto w-full px-6 pb-4 flex items-center justify-between">
                
                {/* Left Side: Categories & Search Bar kept aside */}
                <div className="flex items-center gap-4 flex-1">
                    <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors flex-shrink-0">
                        <Menu className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-800">All Categories</span>
                    </button>

                    <div className="w-full max-w-sm relative">
                        <input 
                            type="text" 
                            placeholder="Search smart..." 
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 px-6 pr-12 outline-none focus:border-[#1e3a8a] focus:bg-white transition-all font-medium text-sm"
                        />
                        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#1e3a8a] text-white p-1.5 rounded-full hover:bg-[#172554] transition-colors shadow-md shadow-[#1e3a8a]/20">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Center Notch for the AgentOrb */}
                <div className="flex justify-center items-center flex-shrink-0">
                    <div className="w-[200px] h-[10px]"></div>
                </div>

                {/* Right Side: Links kept aside */}
                <nav className="flex items-center gap-6 flex-1 justify-end">
                    <a href="#" className="text-sm font-bold text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1">Home</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1 flex items-center gap-1">
                        AI Picks <span className="bg-[#1e3a8a] text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">New</span>
                    </a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Deals</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Track Order</a>
                </nav>
            </div>
        </header>
    );
}
