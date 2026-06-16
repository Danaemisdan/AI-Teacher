import React from 'react';
import { Headphones, Shirt, Coffee, Sparkles, Trophy, Gamepad2, ShoppingBasket, Activity, Car, LayoutGrid } from 'lucide-react';

export default function CategoriesRow() {
    const categories = [
        { name: "Electronics", icon: <Headphones className="w-6 h-6" /> },
        { name: "Fashion", icon: <Shirt className="w-6 h-6" /> },
        { name: "Home & Kitchen", icon: <Coffee className="w-6 h-6" /> },
        { name: "Beauty", icon: <Sparkles className="w-6 h-6" /> },
        { name: "Sports", icon: <Trophy className="w-6 h-6" /> },
        { name: "Toys & Games", icon: <Gamepad2 className="w-6 h-6" /> },
        { name: "Grocery", icon: <ShoppingBasket className="w-6 h-6" /> },
        { name: "Health", icon: <Activity className="w-6 h-6" /> },
        { name: "Automotive", icon: <Car className="w-6 h-6" /> },
        { name: "View All", icon: <LayoutGrid className="w-6 h-6" />, isViewAll: true },
    ];

    return (
        <section className="max-w-7xl mx-auto w-full px-6 py-6">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {categories.map((cat, i) => (
                    <button 
                        key={i} 
                        className="flex flex-col items-center gap-3 min-w-[80px] group flex-shrink-0"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                            cat.isViewAll 
                            ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200' 
                            : 'bg-white border border-gray-100 shadow-sm text-gray-800 group-hover:border-[#1e3a8a] group-hover:text-[#1e3a8a] group-hover:shadow-md'
                        }`}>
                            {cat.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-700 whitespace-nowrap text-center group-hover:text-[#1e3a8a] transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
