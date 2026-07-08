const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'public', 'assets', 'index.json');
let registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const anatomyTopics = [
    { id: 'skeleton', title: 'The Human Skeleton' },
    { id: 'muscular_system', title: 'The Muscular System' },
    { id: 'nervous_system', title: 'The Nervous System' },
    { id: 'digestive_system', title: 'The Digestive System' },
    { id: 'respiratory_system', title: 'The Respiratory System' },
    { id: 'cardiovascular_system', title: 'The Cardiovascular System' },
    { id: 'brain', title: 'The Human Brain' },
    { id: 'heart', title: 'The Human Heart' },
    { id: 'kidney', title: 'The Kidney' },
    { id: 'liver', title: 'The Liver' },
    { id: 'eyes', title: 'The Human Eye' },
    { id: 'ears', title: 'The Human Ear' },
    { id: 'bones', title: 'Bone Structure' },
    { id: 'joints', title: 'Joint Types' }
];

// Clean up old ones that might conflict
delete registry['human_heart']; // Replaced by 'heart'
delete registry['digestive system']; // Replaced by 'digestive_system'
delete registry['blood circulation']; // Replaced by 'cardiovascular_system'

for (const topic of anatomyTopics) {
    registry[topic.id] = {
        asset: `anatomy/${topic.id}`,
        renderer: "anatomy",
        title: topic.title
    };

    const dirPath = path.join(__dirname, 'public', 'assets', 'anatomy', topic.id, 'v1');
    fs.mkdirSync(dirPath, { recursive: true });

    // Generate metadata.json
    fs.writeFileSync(path.join(dirPath, 'metadata.json'), JSON.stringify({
        id: topic.id,
        title: topic.title,
        version: "v1"
    }, null, 2));

    // Generate placeholder lesson.json
    // We create some mock steps just so the engine plays an intro
    fs.writeFileSync(path.join(dirPath, 'lesson.json'), JSON.stringify({
        steps: [
            {
                highlight: "core",
                speech: `Welcome to the 3D Anatomy module for ${topic.title}. We are now loading the primary structures.`
            },
            {
                highlight: "vessels",
                speech: `Notice the complex vascular network surrounding the organ, providing crucial blood flow and nutrients.`
            }
        ]
    }, null, 2));
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log("Anatomy assets generated and registry updated!");
