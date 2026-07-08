const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/assets/index.json');
const indexJson = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

Object.assign(indexJson, {
    "carbon cycle": { "asset": "diagrams/geography/carbon_cycle", "renderer": "concept_diagram" },
    "plate tectonics": { "asset": "diagrams/geography/plate_tectonics", "renderer": "concept_diagram" },
    "volcanic eruption": { "asset": "diagrams/geography/volcanic_eruption", "renderer": "concept_diagram" },
    "layers of earth": { "asset": "diagrams/geography/layers_of_earth", "renderer": "concept_diagram" },
    "water cycle": { "asset": "diagrams/geography/water_cycle", "renderer": "concept_diagram" },
    "em spectrum": { "asset": "diagrams/physics/em_spectrum", "renderer": "concept_diagram" },
    "atomic structure": { "asset": "diagrams/physics/atomic_structure", "renderer": "concept_diagram" },
    "states of matter": { "asset": "diagrams/physics/states_of_matter", "renderer": "concept_diagram" },
    "nuclear fission": { "asset": "diagrams/physics/nuclear_fission_fusion", "renderer": "concept_diagram" },
    "nuclear fusion": { "asset": "diagrams/physics/nuclear_fission_fusion", "renderer": "concept_diagram" },
    "solar system": { "asset": "diagrams/physics/solar_system", "renderer": "concept_diagram" },
    "lunar phases": { "asset": "diagrams/physics/lunar_phases", "renderer": "concept_diagram" },
    "stellar evolution": { "asset": "diagrams/physics/stellar_evolution", "renderer": "concept_diagram" }
});

fs.writeFileSync(indexPath, JSON.stringify(indexJson, null, 4));
console.log("Updated index.json");
