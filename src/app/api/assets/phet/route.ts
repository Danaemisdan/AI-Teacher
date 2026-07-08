import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const queryLower = query.toLowerCase();

        // HARDCODED PHET REGISTRY
        // Maps physics/math/chemistry concepts to their official PhET HTML5 interactive simulation URLs
        const PHET_REGISTRY = [
            { keywords: ['acid', 'base', 'titration', 'ph '], url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html' },
            { keywords: ['concentration', 'molarity', 'solution'], url: 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_all.html' },
            { keywords: ['balance', 'equation', 'react'], url: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html' },
            { keywords: ['gas', 'boyle', 'charles', 'pressure'], url: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html' },
            { keywords: ['gravity', 'force'], url: 'https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics_all.html' },
            { keywords: ['circuit', 'electricity', 'resistor'], url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html' },
            { keywords: ['energy', 'skate'], url: 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html' },
            { keywords: ['friction'], url: 'https://phet.colorado.edu/sims/html/friction/latest/friction_all.html' },
            { keywords: ['states of matter', 'matter', 'solid', 'liquid', 'gas', 'atoms', 'properties'], url: 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html' },
            { keywords: ['pendulum', 'oscillation'], url: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html' },
            { keywords: ['wave', 'interference'], url: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html' },
            { keywords: ['color', 'vision', 'light'], url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html' },
            { keywords: ['fraction', 'math'], url: 'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_all.html' }
        ];

        let targetUrl = null;
        for (const entry of PHET_REGISTRY) {
            if (entry.keywords.some(kw => queryLower.includes(kw))) {
                targetUrl = entry.url;
                break;
            }
        }

        if (targetUrl) {
            return NextResponse.json({ embedUrl: targetUrl });
        } else {
            // Default fallback simulation removed. Error out if no match.
            return NextResponse.json({ error: 'No matching PhET simulation found for this topic.' }, { status: 404 });
        }
        
    } catch (error: any) {
        console.error('PhET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
