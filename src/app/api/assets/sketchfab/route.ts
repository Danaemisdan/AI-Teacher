import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const animated = searchParams.get('animated') === 'true';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const queryLower = query.toLowerCase();

        // 1. HARDCODED PERFECT ASSETS REGISTRY
        // These are hand-picked, known-good models to prevent API search volatility
        const ASSET_REGISTRY = [
            { keywords: ['skeleton', 'bone', 'skeletal', 'skull'], uid: '060fd1bedebd4e05a723f2014d66280f' },
            { keywords: ['heart', 'cardiac', 'ventricle'], uid: '10e9a26f7e004a09bb357d30e4e35f29' },
            { keywords: ['brain', 'cerebral', 'neuro'], uid: '7a27c17fd6c0488bb31ab093236a47fb' },
            { keywords: ['solar system', 'planet', 'galaxy'], uid: '41f4813589b244dcaefd5eeb242ce0ba' }
        ];

        let targetUid = null;
        for (const entry of ASSET_REGISTRY) {
            if (entry.keywords.some(kw => queryLower.includes(kw))) {
                targetUid = entry.uid;
                break;
            }
        }

        let bestModel;

        if (targetUid) {
            // Fetch the specific known-good model
            const res = await fetch(`https://api.sketchfab.com/v3/models/${targetUid}`);
            if (!res.ok) throw new Error(`Sketchfab API error: ${res.status}`);
            bestModel = await res.json();
        } else {
            // 2. DYNAMIC FALLBACK SEARCH
            const animatedQuery = animated ? '&animated=true' : '';
            const res = await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true${animatedQuery}`);
            
            if (!res.ok) throw new Error(`Sketchfab API error: ${res.status}`);
            
            const data = await res.json();
            const models = data.results || [];
            
            if (models.length === 0) {
                return NextResponse.json({ error: 'No models found' }, { status: 404 });
            }
            bestModel = models[0];
        }

        // Ensure the embed URL has autoplay, animation autoplay, transparent background, and clean UI settings
        let embedUrl = bestModel.embedUrl || `https://sketchfab.com/models/${bestModel.uid}/embed`;
        if (embedUrl) {
            embedUrl += '?autostart=1&animation_autoplay=1&transparent=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0';
        }
        


        return NextResponse.json({ 
            title: bestModel.name,
            embedUrl: embedUrl,
            author: bestModel.user?.displayName || 'Unknown'
        });
        
    } catch (error: any) {
        console.error('Sketchfab fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
