'use client'
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Handshake } from 'lucide-react';

const inventory = [
    { id: 't1', title: 'Nexmart 5KVA Solar Inverter', price: 1200, category: 'Tech', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop' },
    { id: 't2', title: 'Solar Battery 200Ah 12V', price: 450, category: 'Tech', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=600&auto=format&fit=crop' },
    { id: 't3', title: 'Smartphone Pro Max 256GB', price: 1099, category: 'Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop' },
    { id: 'g1', title: 'Premium Parboiled Rice 50kg', price: 45, category: 'Groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
    { id: 'g2', title: 'Pure Vegetable Oil 5L', price: 15, category: 'Groceries', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop' },
    { id: 'g3', title: 'Fresh Orange Juice 1L', price: 4.5, category: 'Groceries', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451b02?q=80&w=600&auto=format&fit=crop' },
    { id: 'p1', title: 'Panadol Extra (24 Tablets)', price: 3, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ad?q=80&w=600&auto=format&fit=crop' },
    { id: 'p2', title: 'Vitamin C 1000mg with Zinc', price: 12, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1550572017-edb302c388d7?q=80&w=600&auto=format&fit=crop' },
    { id: 'p3', title: 'First Aid Kit - Essential', price: 25, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=600&auto=format&fit=crop' }
];

export default function CatalogGrid({ activeCategory, searchResults, isSearching }: { activeCategory: string, searchResults: any[] | null, isSearching: boolean }) {
  const { addToCart } = useCart();

  let displayedItems = inventory;
  if (searchResults) {
      displayedItems = searchResults;
  } else if (activeCategory && activeCategory !== 'All' && activeCategory !== "Today's Deals") {
      displayedItems = inventory.filter(p => p.category === activeCategory);
  }

  const startNegotiation = (item: any) => {
      window.dispatchEvent(new CustomEvent('open-negotiation', { detail: item }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
        {isSearching ? 'AI is scanning inventory...' : searchResults ? 'AI Semantic Matches' : activeCategory === "Today's Deals" ? 'Trending at Nexmart' : `${activeCategory} Products`}
      </h2>
      
      {displayedItems.length === 0 && !isSearching && (
          <div className="text-gray-500 py-12 text-center text-lg bg-white rounded-2xl border border-gray-200">No products found for this category or search.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayedItems.map((item) => (
          <div key={item.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-gray-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full text-gray-800 shadow-sm">
                {item.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{item.title}</h3>
              <div className="mt-auto flex flex-col gap-3">
                <span className="text-xl font-bold text-blue-600">${item.price.toFixed(2)}</span>
                <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors active:scale-95"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => startNegotiation(item)} 
                      title="Negotiate Price" 
                      className="flex items-center justify-center bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors active:scale-95"
                    >
                        <Handshake className="h-5 w-5" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
