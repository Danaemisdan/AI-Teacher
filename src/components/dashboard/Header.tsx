import React from 'react';
import { Search, Heart, ShoppingCart, User, Menu, Target } from 'lucide-react';

interface HeaderProps {
    isLoggedIn: boolean;
    onOpenAuth: () => void;
    cartCount?: number;
}

export default function Header({ isLoggedIn, onOpenAuth, cartCount = 2 }: HeaderProps) {
    return (
        <header className="w-full bg-white flex flex-col z-50 sticky top-0 border-b border-gray-100 shadow-sm">
            {/* Topmost Banner */}
            <div className="w-full bg-[#073f2a] text-white text-xs py-2 px-4 flex justify-between items-center font-medium">
                <div className="flex-1 text-center flex items-center justify-center gap-2">
                    <span className="text-green-400">✨</span> AI Picks Just for You - Smarter Shopping, Better Choices!
                </div>
                <div className="flex items-center gap-3">
                    <span>Download App</span>
                    {/* Placeholder for app icons */}
                    <div className="flex gap-1">
                        <span className="opacity-80"></span>
                        <span className="opacity-80">🤖</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between gap-8">
                {/* Logo */}
                <div className="flex items-end gap-1 flex-shrink-0 cursor-pointer">
                    <span className="text-2xl font-black tracking-tight text-gray-900">nexmart</span>
                    <span className="text-sm font-bold text-[#00B368] mb-1">ai commerce</span>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl relative">
                    <input 
                        type="text" 
                        placeholder="Search smart. Nexmart AI finds it for you..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pr-14 outline-none focus:border-[#00B368] focus:bg-white transition-all font-medium text-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00B368] text-white p-2 rounded-full hover:bg-[#009255] transition-colors shadow-md shadow-[#00B368]/20">
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-8 flex-shrink-0">
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00B368] transition-colors group">
                        <Target className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">AI Assistant</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00B368] transition-colors group">
                        <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">Wishlist</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00B368] transition-colors group relative">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-[#00B368] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Cart</span>
                    </button>
                    <button 
                        onClick={!isLoggedIn ? onOpenAuth : undefined}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00B368] transition-colors group"
                    >
                        {isLoggedIn ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 text-white flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4" />
                            </div>
                        ) : (
                            <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-bold">{isLoggedIn ? 'Account' : 'Sign In'}</span>
                    </button>
                </div>
            </div>

            {/* Sub Nav */}
            <div className="max-w-7xl mx-auto w-full px-6 pb-3 flex items-center gap-8">
                <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors">
                    <Menu className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-800">All Categories</span>
                </button>

                <nav className="flex items-center gap-8 flex-1">
                    <a href="#" className="text-sm font-bold text-[#00B368] border-b-2 border-[#00B368] pb-1">Home</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Shop</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Deals</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1 flex items-center gap-1">
                        AI Picks <span className="bg-[#00B368] text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">New</span>
                    </a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Brands</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Track Order</a>
                    <a href="#" className="text-sm font-bold text-gray-600 hover:text-black transition-colors pb-1">Help</a>
                </nav>
            </div>
        </header>
    );
}
