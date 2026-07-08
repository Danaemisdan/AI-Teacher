import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        // First search Wikipedia for the closest page title
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
        const searchData = await searchRes.json();
        const searchResults = searchData.query?.search || [];
        
        if (searchResults.length === 0) {
            return NextResponse.json({ error: 'No Wikipedia pages found for query' }, { status: 404 });
        }
        
        // Iterate through top 5 results to find one that actually has a good image
        for (let i = 0; i < Math.min(5, searchResults.length); i++) {
            const title = searchResults[i].title;
            const imageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`);
            const imageData = await imageRes.json();
            
            const pages = imageData.query?.pages;
            if (pages) {
                const pageId = Object.keys(pages)[0];
                const imageUrl = pages[pageId]?.thumbnail?.source;
                
                if (imageUrl && !imageUrl.includes('Question_book') && !imageUrl.includes('Ambox')) {
                    return NextResponse.json({ 
                        title: title,
                        imageUrl: imageUrl
                    });
                }
            }
        }

        return NextResponse.json({ error: 'No suitable images found in top Wikipedia results' }, { status: 404 });
        
    } catch (error: any) {
        console.error('Wikipedia fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
