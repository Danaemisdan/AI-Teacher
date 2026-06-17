import React from 'react';
import { ArrowRight, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Product {
    id: string;
    title: string;
    image: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    discount?: string;
}

interface ProductCarouselProps {
    title: string | React.ReactNode;
    subtitle?: string;
    products: Product[];
    type: 'deals' | 'ai_picks';
}

export default function ProductCarousel({ title, subtitle, products, type }: ProductCarouselProps) {
    return (
        <section className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-10">
            <div className="flex items-end justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                        {title}
                    </h2>
                    {subtitle && <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
                </div>
                <button className="text-[#1e3a8a] font-bold text-xs md:text-sm flex items-center gap-1 hover:underline whitespace-nowrap ml-2">
                    View All {type === 'deals' ? 'Deals' : ''} <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
            </div>

            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-6 hide-scrollbar snap-x">
                {products.map((product) => (
                    <div 
                        key={product.id} 
                        className="min-w-[180px] sm:min-w-[200px] md:min-w-[240px] max-w-[180px] sm:max-w-[200px] md:max-w-[240px] bg-white border border-gray-100 rounded-2xl p-3 md:p-4 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex-shrink-0 snap-start relative"
                    >
                        {/* Badges */}
                        {type === 'deals' && product.discount && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md z-10 shadow-sm">
                                {product.discount}
                            </div>
                        )}
                        {type === 'ai_picks' && (
                            <div className="absolute top-4 left-4 bg-[#1e3a8a]/10 text-[#1e3a8a] text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1 uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" /> AI Pick
                            </div>
                        )}

                        {/* Image */}
                        <div className="w-full h-40 bg-gray-50 rounded-xl mb-4 p-4 flex items-center justify-center overflow-hidden">
                            <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1">
                            <h3 className="text-sm font-bold text-gray-800 leading-tight mb-2 line-clamp-2">{product.title}</h3>
                            
                            <div className="mt-auto flex flex-col">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-gray-400 font-bold line-through mb-1">${product.originalPrice.toFixed(2)}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                                        {product.rating} <span className="font-medium">({product.reviews})</span>
                                    </div>
                                    
                                    {type === 'ai_picks' && (
                                        <button className="w-8 h-8 rounded-full border-2 border-[#1e3a8a] text-[#1e3a8a] flex items-center justify-center hover:bg-[#1e3a8a] hover:text-white transition-colors">
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
