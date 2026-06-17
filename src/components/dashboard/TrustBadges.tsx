import React from 'react';
import { Sparkles, ShieldCheck, Truck, Lock } from 'lucide-react';

export default function TrustBadges() {
    const badges = [
        {
            icon: <Sparkles className="w-6 h-6 text-[#1e3a8a]" />,
            title: "AI-Powered Recommendations",
            desc: "Personalized picks just for you"
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-[#1e3a8a]" />,
            title: "Best Price Guarantee",
            desc: "We ensure you get the best deal"
        },
        {
            icon: <Truck className="w-6 h-6 text-[#1e3a8a]" />,
            title: "Fast & Reliable Delivery",
            desc: "Quick delivery at your doorstep"
        },
        {
            icon: <Lock className="w-6 h-6 text-[#1e3a8a]" />,
            title: "Secure Shopping",
            desc: "100% secure & trusted payments"
        }
    ];

    return (
        <section className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 border-y border-gray-100 my-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {badges.map((badge, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center flex-shrink-0">
                            {badge.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{badge.title}</span>
                            <span className="hidden sm:block text-xs text-gray-500 font-medium mt-0.5">{badge.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
