export interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    description: string;
    image: string;
    inStock: boolean;
}

export const inventory: Product[] = [
    // Tech & Electronics
    { id: 't1', title: 'Nexmart 5KVA Solar Inverter', price: 1200, category: 'Tech', description: 'High-efficiency hybrid solar inverter, perfect for home backup.', image: '/placeholder-inverter.jpg', inStock: true },
    { id: 't2', title: 'Solar Battery 200Ah 12V', price: 450, category: 'Tech', description: 'Deep cycle gel battery for solar setups.', image: '/placeholder-battery.jpg', inStock: true },
    { id: 't3', title: 'Smartphone Pro Max 256GB', price: 1099, category: 'Tech', description: 'Latest flagship smartphone with advanced AI camera.', image: '/placeholder-phone.jpg', inStock: true },
    
    // Groceries
    { id: 'g1', title: 'Premium Parboiled Rice 50kg', price: 45, category: 'Groceries', description: 'Long grain, stone-free parboiled rice.', image: '/placeholder-rice.jpg', inStock: true },
    { id: 'g2', title: 'Pure Vegetable Oil 5L', price: 15, category: 'Groceries', description: 'Cholesterol-free pure vegetable cooking oil.', image: '/placeholder-oil.jpg', inStock: true },
    { id: 'g3', title: 'Fresh Orange Juice 1L', price: 4.5, category: 'Groceries', description: '100% natural freshly squeezed orange juice.', image: '/placeholder-juice.jpg', inStock: true },

    // Pharmacy
    { id: 'p1', title: 'Panadol Extra (24 Tablets)', price: 3, category: 'Pharmacy', description: 'Fast effective pain relief.', image: '/placeholder-panadol.jpg', inStock: true },
    { id: 'p2', title: 'Vitamin C 1000mg with Zinc', price: 12, category: 'Pharmacy', description: 'Immune system booster supplements.', image: '/placeholder-vitaminc.jpg', inStock: true },
    { id: 'p3', title: 'First Aid Kit - Essential', price: 25, category: 'Pharmacy', description: 'Comprehensive home/car first aid kit.', image: '/placeholder-firstaid.jpg', inStock: true }
];

// Simple mocked search function for the LLM to use
export const searchInventory = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return inventory.filter(product => 
        product.title.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
};
