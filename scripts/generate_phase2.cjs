const fs = require('fs');
const path = require('path');

const phase2Concepts = [
    {
        id: "water_cycle",
        domain: "geography",
        title: "The Water Cycle",
        desc: "An interactive journey of water through the Earth's systems.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4facfe"/>
      <stop offset="100%" stop-color="#00f2fe"/>
    </linearGradient>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0250c5"/>
      <stop offset="100%" stop-color="#2a0845"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#skyGrad)" rx="20"/>
  <!-- Ocean -->
  <path d="M 0 450 Q 200 420 400 450 T 800 450 L 800 600 L 0 600 Z" fill="url(#oceanGrad)"/>
  
  <g id="evaporation">
    <path d="M 600 420 Q 620 300 600 200" stroke="rgba(255,255,255,0.7)" stroke-width="4" stroke-dasharray="10,10" fill="none"/>
    <path d="M 650 430 Q 670 320 650 220" stroke="rgba(255,255,255,0.7)" stroke-width="4" stroke-dasharray="10,10" fill="none"/>
    <text x="660" y="320" fill="white" font-size="20">Evaporation</text>
  </g>
  
  <g id="condensation">
    <ellipse cx="400" cy="150" rx="120" ry="50" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="450" cy="120" rx="80" ry="40" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="330" cy="130" rx="90" ry="45" fill="rgba(255,255,255,0.9)"/>
    <text x="340" y="140" fill="#333" font-size="20">Condensation</text>
  </g>
  
  <g id="precipitation">
    <line x1="300" y1="200" x2="280" y2="350" stroke="#00f2fe" stroke-width="4" stroke-dasharray="10,5"/>
    <line x1="350" y1="200" x2="330" y2="350" stroke="#00f2fe" stroke-width="4" stroke-dasharray="10,5"/>
    <line x1="400" y1="200" x2="380" y2="350" stroke="#00f2fe" stroke-width="4" stroke-dasharray="10,5"/>
    <text x="210" y="280" fill="white" font-size="20">Precipitation</text>
  </g>
</svg>`,
        steps: [
            { highlight: "evaporation", speech: "The water cycle begins with evaporation. The sun heats up water in rivers, lakes, and oceans, turning it into water vapor that rises into the air." },
            { highlight: "condensation", speech: "As the water vapor rises higher, it cools down and condenses to form clouds. This process is called condensation." },
            { highlight: "precipitation", speech: "When the clouds become too heavy, the water falls back to Earth as rain, snow, sleet, or hail. This is known as precipitation." }
        ]
    },
    {
        id: "carbon_cycle",
        domain: "geography",
        title: "The Carbon Cycle",
        desc: "How carbon moves through the Earth's biosphere.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#e9ecef" rx="20"/>
  <circle cx="400" cy="300" r="200" fill="none" stroke="#adb5bd" stroke-width="8" stroke-dasharray="20,10"/>
  
  <g id="respiration">
    <circle cx="200" cy="300" r="60" fill="#ff6b6b"/>
    <text x="160" y="305" fill="white" font-size="16">Respiration</text>
    <path d="M 260 270 Q 300 200 400 120" stroke="#ff6b6b" stroke-width="4" fill="none" marker-end="url(#arrow)"/>
  </g>
  
  <g id="emissions">
    <rect x="540" y="240" width="120" height="120" fill="#495057" rx="10"/>
    <text x="560" y="305" fill="white" font-size="16">Emissions</text>
    <path d="M 540 270 Q 500 200 420 120" stroke="#495057" stroke-width="4" fill="none" marker-end="url(#arrow)"/>
  </g>
  
  <g id="absorption">
    <polygon points="400,450 350,550 450,550" fill="#2b8a3e"/>
    <text x="360" y="530" fill="white" font-size="16">Absorption</text>
    <path d="M 400 140 Q 400 300 400 430" stroke="#2b8a3e" stroke-width="4" fill="none" marker-end="url(#arrow)"/>
  </g>
  
  <text x="330" y="100" fill="#212529" font-size="24" font-weight="bold">Atmospheric CO2</text>
</svg>`,
        steps: [
            { highlight: "respiration", speech: "Animals and plants release carbon dioxide back into the atmosphere through cellular respiration." },
            { highlight: "emissions", speech: "Human activities, such as burning fossil fuels in factories and cars, release massive amounts of carbon emissions into the air." },
            { highlight: "absorption", speech: "To balance this, trees and plants absorb atmospheric CO2 through photosynthesis, acting as a crucial carbon sink." }
        ]
    },
    {
        id: "plate_tectonics",
        domain: "geography",
        title: "Plate Tectonics",
        desc: "The movement of Earth's lithospheric plates.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#f8f9fa" rx="20"/>
  
  <g id="divergent">
    <rect x="100" y="100" width="200" height="150" fill="#ffa8a8" stroke="#f03e3e" stroke-width="4"/>
    <rect x="320" y="100" width="200" height="150" fill="#ffa8a8" stroke="#f03e3e" stroke-width="4"/>
    <path d="M 280 175 L 250 175 M 340 175 L 370 175" stroke="#333" stroke-width="6" marker-end="url(#arrow)"/>
    <text x="250" y="90" font-size="20">Divergent Boundary</text>
  </g>
  
  <g id="convergent">
    <rect x="100" y="350" width="250" height="150" fill="#a5d8ff" stroke="#1c7ed6" stroke-width="4"/>
    <rect x="320" y="350" width="250" height="150" fill="#a5d8ff" stroke="#1c7ed6" stroke-width="4"/>
    <path d="M 200 425 L 280 425 M 470 425 L 390 425" stroke="#333" stroke-width="6" marker-end="url(#arrow)"/>
    <text x="250" y="340" font-size="20">Convergent Boundary</text>
  </g>
  
  <g id="transform">
    <rect x="580" y="100" width="150" height="150" fill="#d8f5a2" stroke="#66a80f" stroke-width="4"/>
    <rect x="580" y="270" width="150" height="150" fill="#d8f5a2" stroke="#66a80f" stroke-width="4"/>
    <path d="M 750 150 L 750 200 M 710 370 L 710 320" stroke="#333" stroke-width="6" marker-end="url(#arrow)"/>
    <text x="560" y="90" font-size="20">Transform</text>
  </g>
</svg>`,
        steps: [
            { highlight: "divergent", speech: "At divergent boundaries, tectonic plates move apart from each other. This often creates new crust as magma rises to the surface." },
            { highlight: "convergent", speech: "At convergent boundaries, plates collide. One plate is often pushed under the other, creating deep trenches or massive mountain ranges." },
            { highlight: "transform", speech: "At transform boundaries, plates slide horizontally past one another, building up tension that is often released as earthquakes." }
        ]
    },
    {
        id: "volcanic_eruption",
        domain: "geography",
        title: "Volcanic Eruptions",
        desc: "The anatomy of an active volcano.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#868e96" rx="20"/>
  <polygon points="100,500 400,200 700,500" fill="#495057"/>
  
  <g id="magma_chamber">
    <ellipse cx="400" cy="530" rx="150" ry="50" fill="#f03e3e"/>
    <text x="320" y="535" fill="white" font-size="20">Magma Chamber</text>
  </g>
  
  <g id="vent">
    <path d="M 380 500 L 390 200 L 410 200 L 420 500 Z" fill="#ff922b"/>
    <text x="440" y="350" fill="white" font-size="20">Main Vent</text>
  </g>
  
  <g id="ash_cloud">
    <circle cx="400" cy="120" r="60" fill="#343a40" opacity="0.8"/>
    <circle cx="340" cy="100" r="50" fill="#343a40" opacity="0.8"/>
    <circle cx="460" cy="90" r="70" fill="#343a40" opacity="0.8"/>
    <text x="360" y="125" fill="white" font-size="20">Ash Cloud</text>
  </g>
</svg>`,
        steps: [
            { highlight: "magma_chamber", speech: "Deep beneath the volcano lies the magma chamber, a large underground pool of molten rock." },
            { highlight: "vent", speech: "When pressure builds, magma rises through the main vent, a central tube connecting the chamber to the surface." },
            { highlight: "ash_cloud", speech: "Upon eruption, explosive gases launch fragmented rock into the air, creating a massive, dark ash cloud that can block out the sun." }
        ]
    },
    {
        id: "layers_of_earth",
        domain: "geography",
        title: "Layers of the Earth",
        desc: "A cross-section of our planet's interior.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#1e1e2f" rx="20"/>
  
  <g id="crust">
    <circle cx="400" cy="300" r="250" fill="none" stroke="#5c940d" stroke-width="15"/>
    <text x="660" y="150" fill="#a9e34b" font-size="24">Crust</text>
  </g>
  
  <g id="mantle">
    <circle cx="400" cy="300" r="235" fill="#e67700"/>
    <text x="650" y="300" fill="#ffa94d" font-size="24">Mantle</text>
  </g>
  
  <g id="core">
    <circle cx="400" cy="300" r="130" fill="#c92a2a"/>
    <circle cx="400" cy="300" r="60" fill="#fff3bf"/>
    <text x="500" y="450" fill="#ffc078" font-size="24">Outer & Inner Core</text>
  </g>
</svg>`,
        steps: [
            { highlight: "crust", speech: "The outermost layer is the crust. It's relatively thin, solid, and is where all life on Earth exists." },
            { highlight: "mantle", speech: "Beneath the crust is the mantle, a thick layer of semi-solid rock that flows slowly over millions of years." },
            { highlight: "core", speech: "At the very center is the core, split into a liquid outer core and a solid inner core made mostly of scorching hot iron." }
        ]
    }
];

const basePath = path.join(__dirname, 'public/assets/diagrams');

phase2Concepts.forEach(concept => {
    const dir = path.join(basePath, concept.domain, concept.id, 'v1');
    fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(path.join(dir, 'diagram.svg'), concept.svg);
    fs.writeFileSync(path.join(dir, 'lesson.json'), JSON.stringify({ steps: concept.steps }, null, 2));
    
    console.log("Created " + concept.id);
});
