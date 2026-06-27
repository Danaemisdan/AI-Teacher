import { NextResponse } from 'next/server';
import wiki from 'wikipedia';
import youtubesearchapi from 'youtube-search-api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    try {
        // Run both searches in parallel for maximum speed
        const [wikiResult, ytResult] = await Promise.allSettled([
            fetchWiki(query),
            fetchYT(query)
        ]);

        const summary = wikiResult.status === 'fulfilled' ? wikiResult.value.summary : null;
        const imageUrl = wikiResult.status === 'fulfilled' ? wikiResult.value.imageUrl : null;
        // Only return a video if Wikipedia actually found an educational topic!
        // This prevents returning Enrique Iglesias videos when the user says 'can you hear me'.
        const videoId = (ytResult.status === 'fulfilled' && summary) ? ytResult.value : null;

        return NextResponse.json({ summary, imageUrl, videoId });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function fetchWiki(query: string) {
    try {
        const page = await wiki.page(query);
        const summary = await page.summary();
        
        let imageUrl = null;
        if (summary.thumbnail && summary.thumbnail.source) {
            imageUrl = summary.thumbnail.source;
        } else if (summary.originalimage && summary.originalimage.source) {
            imageUrl = summary.originalimage.source;
        }

        return {
            summary: summary.extract,
            imageUrl: imageUrl
        };
    } catch (e) {
        // If exact page match fails, try a search first
        try {
            const searchResults = await wiki.search(query);
            if (searchResults.results.length > 0) {
                const page = await wiki.page(searchResults.results[0].title);
                const summary = await page.summary();
                
                let imageUrl = null;
                if (summary.thumbnail && summary.thumbnail.source) {
                    imageUrl = summary.thumbnail.source;
                }
                
                return {
                    summary: summary.extract,
                    imageUrl: imageUrl
                };
            }
        } catch (searchErr) {
            console.error("Wiki search fallback failed:", searchErr);
        }
        throw e;
    }
}

async function fetchYT(query: string) {
    const res = await youtubesearchapi.GetListByKeyword(query, false, 1);
    if (res && res.items && res.items.length > 0) {
        return res.items[0].id;
    }
    return null;
}
