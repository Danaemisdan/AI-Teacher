import React from 'react';
import { Sparkles, ShieldCheck, Truck, Lock } from 'lucide-react';

export default function TrustBadges() {
    const badges = [
        {
            icon: <Sparkles className="w-6 h-6 text-[#00B368]" />,
            title: "AI-Powered Recommendations",
            desc: "Personalized picks just for you"
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-[#00B368]" />,
            title: "Best Price Guarantee",
            desc: "We ensure you get the best deal"
        },
        {
            icon: <Truck className="w-6 h-6 text-[#00B368]" />,
            title: "Fast & Reliable Delivery",
            desc: "Quick delivery at your doorstep"
        },
        {
            icon: <Lock className="w-6 h-6 text-[#00B368]" />,
            title: "Secure Shopping",
            desc: "100% secure & trusted payments"
        }
    ];

    return (
        <section className="max-w-7xl mx-auto w-full px-6 py-6 border-y border-gray-100 my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#00B368]/10 flex items-center justify-center flex-shrink-0">
                            {badge.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{badge.title}</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5">{badge.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
