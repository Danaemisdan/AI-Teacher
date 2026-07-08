const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'public', 'assets', 'diagrams');

const concepts = [
    {
        id: 'greenhouse_effect',
        category: 'geography',
        title: 'The Greenhouse Effect',
        desc: 'Solar radiation, atmosphere, reflected heat.',
        svg: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="500" fill="#0f172a"/>
    <!-- Earth Surface -->
    <path d="M0,400 Q400,380 800,400 L800,500 L0,500 Z" fill="#22c55e" id="earth_surface"/>
    <!-- Atmosphere -->
    <path d="M0,200 Q400,180 800,200" fill="none" stroke="#60a5fa" stroke-width="20" stroke-dasharray="10 10" opacity="0.3" id="atmosphere"/>
    
    <!-- Sun -->
    <circle cx="100" cy="100" r="60" fill="#fbbf24" id="sun"/>
    <!-- Solar Radiation -->
    <path d="M150,140 L350,300" fill="none" stroke="#fcd34d" stroke-width="4" id="solar_radiation" marker-end="url(#arrow)"/>
    <path d="M130,160 L250,380" fill="none" stroke="#fcd34d" stroke-width="4" />
    
    <!-- Reflected Heat -->
    <path d="M400,380 L600,220" fill="none" stroke="#ef4444" stroke-width="4" id="reflected_heat"/>
    <!-- Trapped Heat -->
    <path d="M600,220 Q700,280 650,380" fill="none" stroke="#ef4444" stroke-width="4" id="trapped_heat"/>
    
    <!-- Greenhouse Gases -->
    <circle cx="500" cy="190" r="10" fill="#94a3b8" id="ghg_molecule"/>
    <circle cx="600" cy="210" r="10" fill="#94a3b8"/>
    <circle cx="700" cy="190" r="10" fill="#94a3b8"/>

    <text x="50" y="50" fill="white" font-size="24" font-family="sans-serif">The Greenhouse Effect</text>
</svg>`,
        steps: [
            { highlight: "sun", speech: "The process begins with the sun, which radiates energy towards our planet." },
            { highlight: "solar_radiation", speech: "This solar radiation passes through the atmosphere and warms the Earth's surface." },
            { highlight: "reflected_heat", speech: "The Earth absorbs some energy, but reflects the rest back towards space as heat." },
            { highlight: "atmosphere", speech: "However, our atmosphere contains greenhouse gases like carbon dioxide and methane." },
            { highlight: "trapped_heat", speech: "These gases trap a portion of the reflected heat, keeping our planet warm enough to sustain life." }
        ]
    },
    {
        id: 'rock_cycle',
        category: 'geography',
        title: 'The Rock Cycle',
        desc: 'Igneous, Sedimentary, Metamorphic.',
        svg: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="500" fill="#1e1b4b"/>
    <text x="300" y="50" fill="white" font-size="24" font-family="sans-serif">The Rock Cycle</text>
    
    <g id="igneous_rock">
        <polygon points="400,100 450,180 350,180" fill="#57534e"/>
        <text x="360" y="210" fill="white">Igneous</text>
    </g>
    
    <g id="sedimentary_rock">
        <rect x="150" y="300" width="100" height="60" fill="#d6d3d1"/>
        <line x1="150" y1="320" x2="250" y2="320" stroke="#78716c" stroke-width="2"/>
        <line x1="150" y1="340" x2="250" y2="340" stroke="#78716c" stroke-width="2"/>
        <text x="140" y="390" fill="white">Sedimentary</text>
    </g>
    
    <g id="metamorphic_rock">
        <ellipse cx="600" cy="330" rx="60" ry="40" fill="#a8a29e"/>
        <path d="M550,330 Q600,310 650,330" fill="none" stroke="#44403c" stroke-width="2"/>
        <path d="M560,340 Q600,320 640,340" fill="none" stroke="#44403c" stroke-width="2"/>
        <text x="540" y="390" fill="white">Metamorphic</text>
    </g>
    
    <path id="weathering" d="M360,180 Q250,200 200,280" fill="none" stroke="#60a5fa" stroke-width="3" stroke-dasharray="5 5" marker-end="url(#arrow)"/>
    <path id="heat_pressure" d="M250,330 Q400,380 540,330" fill="none" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow)"/>
    <path id="melting" d="M600,290 Q500,150 440,150" fill="none" stroke="#f97316" stroke-width="3" marker-end="url(#arrow)"/>
</svg>`,
        steps: [
            { highlight: "igneous_rock", speech: "The rock cycle often starts with Igneous rock, formed when magma cools and solidifies." },
            { highlight: "weathering", speech: "Over millions of years, wind and water break down the rock through weathering and erosion." },
            { highlight: "sedimentary_rock", speech: "These fragments compress to form layered Sedimentary rock." },
            { highlight: "heat_pressure", speech: "When pushed deep underground, intense heat and pressure transform it." },
            { highlight: "metamorphic_rock", speech: "It becomes Metamorphic rock. If it gets hot enough, it melts back into magma, and the cycle continues!" }
        ]
    }
];

async function run() {
    for (const concept of concepts) {
        const dir = path.join(basePath, concept.category, concept.id, 'v1');
        fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(path.join(dir, 'asset.svg'), concept.svg);
        fs.writeFileSync(path.join(dir, 'lesson.json'), JSON.stringify({ steps: concept.steps }, null, 2));
        fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify({ title: concept.title, version: '1.0' }, null, 2));
        console.log("Generated:", concept.id);
    }
    
    const indexFile = path.join(__dirname, 'public', 'assets', 'index.json');
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    
    index['greenhouse effect'] = { asset: 'diagrams/geography/greenhouse_effect', renderer: 'concept_diagram' };
    index['rock cycle'] = { asset: 'diagrams/geography/rock_cycle', renderer: 'concept_diagram' };
    
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 4));
    console.log("Updated index.json");
}
run();
