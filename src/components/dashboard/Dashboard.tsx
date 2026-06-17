'use client'
import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import CategoriesRow from './CategoriesRow';
import TrustBadges from './TrustBadges';
import ProductCarousel, { Product } from './ProductCarousel';
import BottomNav from './BottomNav';
import AgentOrb from '../os/AgentOrb';
import { Sparkles } from 'lucide-react';

export type WorkflowState = 'IDLE' | 'RESEARCHING' | 'NEGOTIATING' | 'READY' | 'TALKING' | 'LISTENING';

interface DashboardProps {
    isLoggedIn: boolean;
    onOpenAuth: () => void;
}

export default function Dashboard({ isLoggedIn, onOpenAuth }: DashboardProps) {
    const [workflowState, setWorkflowState] = useState<WorkflowState>('IDLE');
    const [currentTask, setCurrentTask] = useState('');
    const [aiProducts, setAiProducts] = useState<any[]>([]);
    const [cartCount, setCartCount] = useState(2);
    
    // AI Engine state
    const [isAiReady, setIsAiReady] = useState(false);
    const [aiProgress, setAiProgress] = useState('Booting OS...');

    // Mock Data
    const dealsProducts: Product[] = [
        { id: '1', title: 'Sony WH-1000XM5 Headphones', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', price: 279.99, originalPrice: 399.99, rating: 4.8, reviews: 2400, discount: '-30%' },
        { id: '2', title: 'Apple Watch Series 9', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80', price: 299.99, originalPrice: 399.00, rating: 4.7, reviews: 1800, discount: '-25%' },
        { id: '3', title: 'Nike Air Max 270', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', price: 119.99, originalPrice: 149.99, rating: 4.6, reviews: 980, discount: '-20%' },
        { id: '4', title: 'Dior Sauvage Eau De Parfum', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80', price: 84.99, originalPrice: 129.99, rating: 4.9, reviews: 1200, discount: '-35%' },
        { id: '5', title: 'MacBook Air M2', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', price: 849.99, originalPrice: 999.00, rating: 4.8, reviews: 1500, discount: '-15%' },
    ];

    const aiPicksProducts: Product[] = [
        { id: '6', title: 'Philips Coffee Maker', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80', price: 89.99, rating: 4.6, reviews: 720 },
        { id: '7', title: 'Arctic Hunter Backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 49.99, rating: 4.7, reviews: 532 },
        { id: '8', title: 'Ray-Ban Aviator', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', price: 129.99, rating: 4.8, reviews: 1100 },
        { id: '9', title: 'Logitech MX Keys', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80', price: 99.99, rating: 4.7, reviews: 643 },
        { id: '10', title: 'Indoor Plant Pot', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80', price: 24.99, rating: 4.5, reviews: 302 },
    ];

    return (
        <div className="h-full w-full overflow-y-auto bg-white flex flex-col hide-scrollbar relative">
            <Header isLoggedIn={isLoggedIn} onOpenAuth={onOpenAuth} cartCount={cartCount} />
            
            <main className="flex-1 flex flex-col pb-24 md:pb-10">
                <AgentOrb 
                    workflowState={workflowState}
                    setWorkflowState={setWorkflowState}
                    setCurrentTask={setCurrentTask}
                    setAiProducts={setAiProducts}
                    setIsAiReady={setIsAiReady}
                    setAiProgress={setAiProgress}
                    aiProgress={aiProgress}
                    isAiReady={isAiReady}
                    setCartCount={setCartCount}
                    inline={false}
                />

                <Hero />

                <CategoriesRow />
                <TrustBadges />

                {/* If AI has outputted products from a search, show those, otherwise show Deals and Picks */}
                {aiProducts.length > 0 ? (
                    <ProductCarousel 
                        title="AI Search Results" 
                        subtitle={`Found ${aiProducts.length} items based on your request.`}
                        products={aiProducts.map(p => ({
                            id: p.id || Math.random().toString(),
                            title: p.title,
                            image: p.image || 'https://via.placeholder.com/400?text=Product',
                            price: p.price,
                            rating: 4.5,
                            reviews: Math.floor(Math.random() * 500)
                        }))} 
                        type="deals" 
                    />
                ) : (
                    <>
                        <ProductCarousel 
                            title={<span>🔥 Today's Best Deals</span>} 
                            products={dealsProducts} 
                            type="deals" 
                        />
                        <ProductCarousel 
                            title={<span>✨ AI Picks for You</span>} 
                            subtitle="Handpicked by Nexmart AI based on your preferences"
                            products={aiPicksProducts} 
                            type="ai_picks" 
                        />
                    </>
                )}
            </main>
            
            <BottomNav />
        </div>
    );
}
