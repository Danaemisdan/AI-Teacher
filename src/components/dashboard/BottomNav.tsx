import React from 'react';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomNav() {
    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 py-3 px-8 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
            <button className="flex flex-col items-center gap-1 text-[#1e3a8a] transition-colors">
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#1e3a8a] transition-colors">
                <Search className="w-6 h-6" />
                <span className="text-[10px] font-bold">Search</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#1e3a8a] transition-colors">
                <Heart className="w-6 h-6" />
                <span className="text-[10px] font-bold">Wishlist</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#1e3a8a] transition-colors">
                <User className="w-6 h-6" />
                <span className="text-[10px] font-bold">Profile</span>
            </button>
        </div>
    );
}
