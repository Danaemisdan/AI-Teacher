const fs = require('fs');
const path = require('path');

const phase3Concepts = [
    {
        id: "em_spectrum",
        domain: "physics",
        title: "The Electromagnetic Spectrum",
        desc: "Visualizing the range of all types of EM radiation.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#212529" rx="20"/>
  <text x="400" y="50" fill="white" font-size="24" text-anchor="middle">Electromagnetic Spectrum</text>
  
  <g id="gamma">
    <path d="M 100 300 Q 110 100 120 300 T 140 300 T 160 300 T 180 300 T 200 300" stroke="#cc5de8" stroke-width="4" fill="none"/>
    <text x="150" y="400" fill="#cc5de8" font-size="18" text-anchor="middle">Gamma & X-Ray</text>
  </g>
  
  <g id="visible">
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="red" />
      <stop offset="20%" stop-color="orange" />
      <stop offset="40%" stop-color="yellow" />
      <stop offset="60%" stop-color="green" />
      <stop offset="80%" stop-color="blue" />
      <stop offset="100%" stop-color="violet" />
    </linearGradient>
    <path d="M 200 300 Q 250 150 300 300 T 400 300 T 500 300" stroke="url(#rainbow)" stroke-width="6" fill="none"/>
    <text x="350" y="400" fill="white" font-size="18" text-anchor="middle">Visible Light</text>
  </g>
  
  <g id="radio">
    <path d="M 500 300 Q 600 200 700 300" stroke="#fcc419" stroke-width="4" fill="none"/>
    <text x="600" y="400" fill="#fcc419" font-size="18" text-anchor="middle">Radio & Microwave</text>
  </g>
</svg>`,
        steps: [
            { highlight: "gamma", speech: "On the far left, we have Gamma and X-rays. These have the shortest wavelengths and pack the most intense energy, which is why X-rays can pass through your skin!" },
            { highlight: "visible", speech: "In the middle is a tiny sliver known as Visible Light. This contains all the colors of the rainbow and is the only part of the spectrum our eyes can actually see." },
            { highlight: "radio", speech: "On the far right are Microwaves and Radio waves. They have very long wavelengths and low energy, perfect for carrying music to your car radio or heating up your food." }
        ]
    },
    {
        id: "atomic_structure",
        domain: "physics",
        title: "Atomic Structure",
        desc: "The inner workings of an atom.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#f4f6f8" rx="20"/>
  
  <g id="nucleus">
    <!-- Protons -->
    <circle cx="390" cy="290" r="20" fill="#fa5252"/>
    <circle cx="410" cy="310" r="20" fill="#fa5252"/>
    <circle cx="415" cy="285" r="20" fill="#fa5252"/>
    <!-- Neutrons -->
    <circle cx="410" cy="290" r="20" fill="#868e96"/>
    <circle cx="390" cy="310" r="20" fill="#868e96"/>
    <circle cx="385" cy="285" r="20" fill="#868e96"/>
    
    <text x="480" y="300" fill="#333" font-size="20">Nucleus (Protons & Neutrons)</text>
  </g>
  
  <g id="electrons">
    <!-- Orbits -->
    <ellipse cx="400" cy="300" rx="150" ry="50" fill="none" stroke="#228be6" stroke-width="2" transform="rotate(30, 400, 300)"/>
    <ellipse cx="400" cy="300" rx="150" ry="50" fill="none" stroke="#228be6" stroke-width="2" transform="rotate(-30, 400, 300)"/>
    
    <!-- Electron particles -->
    <circle cx="530" cy="375" r="10" fill="#339af0"/>
    <circle cx="270" cy="225" r="10" fill="#339af0"/>
    <text x="560" y="400" fill="#1864ab" font-size="20">Electrons in Orbit</text>
  </g>
</svg>`,
        steps: [
            { highlight: "nucleus", speech: "At the center of every atom is the nucleus. It is tightly packed with positively charged Protons and neutral Neutrons." },
            { highlight: "electrons", speech: "Buzzing around the nucleus at incredible speeds are the Electrons. They carry a negative charge and exist in cloud-like orbitals." }
        ]
    },
    {
        id: "states_of_matter",
        domain: "physics",
        title: "States of Matter",
        desc: "Particle arrangements in solids, liquids, and gases.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#ffffff" rx="20"/>
  
  <g id="solid">
    <rect x="100" y="250" width="150" height="150" fill="#e3fafc" stroke="#15aabf" stroke-width="4"/>
    <circle cx="120" cy="270" r="15" fill="#0b7285"/>
    <circle cx="155" cy="270" r="15" fill="#0b7285"/>
    <circle cx="190" cy="270" r="15" fill="#0b7285"/>
    <circle cx="225" cy="270" r="15" fill="#0b7285"/>
    <circle cx="120" cy="305" r="15" fill="#0b7285"/>
    <circle cx="155" cy="305" r="15" fill="#0b7285"/>
    <circle cx="190" cy="305" r="15" fill="#0b7285"/>
    <circle cx="225" cy="305" r="15" fill="#0b7285"/>
    <circle cx="120" cy="340" r="15" fill="#0b7285"/>
    <circle cx="155" cy="340" r="15" fill="#0b7285"/>
    <circle cx="190" cy="340" r="15" fill="#0b7285"/>
    <circle cx="225" cy="340" r="15" fill="#0b7285"/>
    <text x="135" y="440" font-size="24">Solid</text>
  </g>
  
  <g id="liquid">
    <rect x="325" y="250" width="150" height="150" fill="#e3fafc" stroke="#15aabf" stroke-width="4"/>
    <circle cx="340" cy="380" r="15" fill="#0b7285"/>
    <circle cx="380" cy="370" r="15" fill="#0b7285"/>
    <circle cx="420" cy="385" r="15" fill="#0b7285"/>
    <circle cx="450" cy="360" r="15" fill="#0b7285"/>
    <circle cx="360" cy="340" r="15" fill="#0b7285"/>
    <circle cx="400" cy="350" r="15" fill="#0b7285"/>
    <text x="360" y="440" font-size="24">Liquid</text>
  </g>
  
  <g id="gas">
    <rect x="550" y="250" width="150" height="150" fill="#e3fafc" stroke="#15aabf" stroke-width="4"/>
    <circle cx="580" cy="280" r="15" fill="#0b7285"/>
    <circle cx="680" cy="300" r="15" fill="#0b7285"/>
    <circle cx="600" cy="370" r="15" fill="#0b7285"/>
    <circle cx="660" cy="380" r="15" fill="#0b7285"/>
    <text x="600" y="440" font-size="24">Gas</text>
  </g>
</svg>`,
        steps: [
            { highlight: "solid", speech: "In a solid, particles are packed tightly together in a fixed, rigid arrangement. They can vibrate, but they cannot move past each other." },
            { highlight: "liquid", speech: "In a liquid, particles are still close together, but they have enough energy to slide past one another, allowing the liquid to take the shape of its container." },
            { highlight: "gas", speech: "In a gas, particles have high energy and are spread far apart, bouncing rapidly and filling up any available space." }
        ]
    },
    {
        id: "nuclear_fission_fusion",
        domain: "physics",
        title: "Fission and Fusion",
        desc: "Two ways to release nuclear energy.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#212529" rx="20"/>
  
  <g id="fission">
    <text x="200" y="100" fill="white" font-size="24" text-anchor="middle">Nuclear Fission</text>
    <circle cx="100" cy="300" r="10" fill="#fab005"/> <!-- Neutron -->
    <path d="M 120 300 L 180 300" stroke="white" stroke-dasharray="5,5" fill="none"/>
    <circle cx="220" cy="300" r="40" fill="#fa5252"/> <!-- Heavy Nucleus -->
    <path d="M 270 280 L 320 220" stroke="white" stroke-dasharray="5,5" fill="none"/>
    <path d="M 270 320 L 320 380" stroke="white" stroke-dasharray="5,5" fill="none"/>
    <circle cx="340" cy="200" r="25" fill="#fa5252"/>
    <circle cx="340" cy="400" r="25" fill="#fa5252"/>
  </g>
  
  <line x1="400" y1="50" x2="400" y2="550" stroke="#495057" stroke-width="2"/>
  
  <g id="fusion">
    <text x="600" y="100" fill="white" font-size="24" text-anchor="middle">Nuclear Fusion</text>
    <circle cx="500" cy="200" r="15" fill="#4dabf7"/>
    <circle cx="500" cy="400" r="15" fill="#4dabf7"/>
    <path d="M 520 220 L 580 280" stroke="white" stroke-dasharray="5,5" fill="none"/>
    <path d="M 520 380 L 580 320" stroke="white" stroke-dasharray="5,5" fill="none"/>
    <circle cx="620" cy="300" r="30" fill="#74c0fc"/> <!-- Fused Nucleus -->
    <path d="M 660 300 L 720 300" stroke="#ffeb3b" stroke-width="4" fill="none"/>
    <text x="740" y="305" fill="#ffeb3b" font-size="18">ENERGY!</text>
  </g>
</svg>`,
        steps: [
            { highlight: "fission", speech: "In Nuclear Fission, a slow-moving neutron strikes a heavy, unstable nucleus like Uranium. The nucleus splits into two smaller nuclei, releasing a massive amount of energy." },
            { highlight: "fusion", speech: "In Nuclear Fusion, two light nuclei, like isotopes of hydrogen, are forced together under extreme heat and pressure to form a heavier nucleus. This is the process that powers our Sun!" }
        ]
    },
    {
        id: "solar_system",
        domain: "physics",
        title: "The Solar System",
        desc: "Our cosmic neighborhood.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#000000" rx="20"/>
  
  <g id="sun">
    <circle cx="0" cy="300" r="150" fill="#ff922b"/>
    <text x="160" y="305" fill="#ffd8a8" font-size="20">The Sun</text>
  </g>
  
  <g id="terrestrial">
    <circle cx="220" cy="300" r="5" fill="#868e96"/> <!-- Mercury -->
    <circle cx="260" cy="300" r="10" fill="#fcc419"/> <!-- Venus -->
    <circle cx="310" cy="300" r="12" fill="#4dabf7"/> <!-- Earth -->
    <circle cx="360" cy="300" r="8" fill="#fa5252"/> <!-- Mars -->
    <text x="250" y="250" fill="#fff" font-size="16">Terrestrial Planets</text>
  </g>
  
  <g id="gas_giants">
    <circle cx="480" cy="300" r="40" fill="#f4a261"/> <!-- Jupiter -->
    <circle cx="620" cy="300" r="30" fill="#e9c46a"/> <!-- Saturn -->
    <ellipse cx="620" cy="300" rx="45" ry="10" fill="none" stroke="#fff" stroke-width="2" transform="rotate(20, 620, 300)"/>
    <circle cx="710" cy="300" r="20" fill="#2a9d8f"/> <!-- Uranus -->
    <circle cx="770" cy="300" r="18" fill="#264653"/> <!-- Neptune -->
    <text x="560" y="200" fill="#fff" font-size="16">Gas & Ice Giants</text>
  </g>
</svg>`,
        steps: [
            { highlight: "sun", speech: "At the center of our solar system is the Sun, a massive main-sequence star that contains over 99 percent of the mass in the entire solar system." },
            { highlight: "terrestrial", speech: "Orbiting closest to the Sun are the terrestrial planets: Mercury, Venus, Earth, and Mars. They are relatively small and have solid, rocky surfaces." },
            { highlight: "gas_giants", speech: "Further out are the giants. Jupiter and Saturn are massive gas giants, while Uranus and Neptune are freezing cold ice giants." }
        ]
    },
    {
        id: "lunar_phases",
        domain: "physics",
        title: "Lunar Phases",
        desc: "The cycle of the moon's illumination.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#1e1e2f" rx="20"/>
  <circle cx="400" cy="300" r="50" fill="#4dabf7"/> <!-- Earth -->
  <text x="375" y="305" fill="white" font-size="16">Earth</text>
  
  <g id="new_moon">
    <circle cx="400" cy="120" r="30" fill="#343a40" stroke="#f1f3f5" stroke-width="1"/>
    <text x="360" y="70" fill="white" font-size="18">New Moon</text>
  </g>
  
  <g id="quarter_moon">
    <!-- Right side illuminated -->
    <circle cx="600" cy="300" r="30" fill="#343a40"/>
    <path d="M 600 270 A 30 30 0 0 1 600 330 Z" fill="#f1f3f5"/>
    <text x="640" y="305" fill="white" font-size="18">First Quarter</text>
  </g>
  
  <g id="full_moon">
    <circle cx="400" cy="480" r="30" fill="#f1f3f5"/>
    <text x="360" y="540" fill="white" font-size="18">Full Moon</text>
  </g>
  
  <!-- Sunlight arrows -->
  <path d="M 100 100 L 200 100 M 100 300 L 200 300 M 100 500 L 200 500" stroke="#fcc419" stroke-width="4" marker-end="url(#arrow)"/>
  <text x="50" y="305" fill="#fcc419" font-size="20">Sunlight</text>
</svg>`,
        steps: [
            { highlight: "new_moon", speech: "During a New Moon, the moon is between the Earth and the Sun. The side facing us is completely in shadow, making it invisible in the night sky." },
            { highlight: "quarter_moon", speech: "As the moon orbits Earth, we see a First Quarter moon. Half of the moon's visible surface is illuminated by sunlight." },
            { highlight: "full_moon", speech: "When the Earth is between the moon and the Sun, we see a Full Moon, where the entire Earth-facing side is brightly lit." }
        ]
    },
    {
        id: "stellar_evolution",
        domain: "physics",
        title: "Stellar Evolution",
        desc: "The life cycle of a massive star.",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0b0b1a" rx="20"/>
  
  <g id="nebula">
    <ellipse cx="150" cy="300" rx="60" ry="40" fill="#7048e8" opacity="0.6" filter="blur(5px)"/>
    <text x="110" y="380" fill="#d0bfff" font-size="18">Stellar Nebula</text>
  </g>
  
  <g id="main_sequence">
    <circle cx="350" cy="300" r="40" fill="#4dabf7"/>
    <text x="290" y="380" fill="#a5d8ff" font-size="18">Main Sequence Star</text>
  </g>
  
  <g id="supernova">
    <path d="M 550 300 l -20 -40 l 10 30 l 30 -10 l -20 20 l 40 20 l -30 0 l 20 30 l -30 -10 l -10 40 l -10 -30 l -40 20 l 20 -20 l -30 -20 l 30 0 Z" fill="#ff922b"/>
    <text x="500" y="380" fill="#ffd8a8" font-size="18">Supernova Explosion</text>
  </g>
  
  <!-- Arrows -->
  <path d="M 230 300 L 290 300" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>
  <path d="M 410 300 L 480 300" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>
</svg>`,
        steps: [
            { highlight: "nebula", speech: "Every star begins as a stellar nebula, a massive cloud of dust and hydrogen gas that slowly collapses under its own gravity." },
            { highlight: "main_sequence", speech: "As it collapses, it ignites nuclear fusion and becomes a main sequence star. A massive star will burn extremely hot and bright for millions of years." },
            { highlight: "supernova", speech: "When a massive star runs out of fuel, its core collapses instantly, triggering a colossal and spectacular explosion known as a Supernova." }
        ]
    }
];

const basePath = path.join(__dirname, 'public/assets/diagrams');

phase3Concepts.forEach(concept => {
    const dir = path.join(basePath, concept.domain, concept.id, 'v1');
    fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(path.join(dir, 'diagram.svg'), concept.svg);
    fs.writeFileSync(path.join(dir, 'lesson.json'), JSON.stringify({ steps: concept.steps }, null, 2));
    
    console.log("Created " + concept.id);
});
