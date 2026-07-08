const fs = require('fs');
const path = require('path');

const indexJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/assets/index.json'), 'utf8'));

function getAsset(query) {
    const idLower = query.toLowerCase();
    
    if (indexJson[idLower]) {
        return indexJson[idLower];
    }

    for (const key in indexJson) {
        if (idLower.includes(key) || key.includes(idLower)) {
            return indexJson[key];
        }
    }
    return null;
}

const queries = ['human cell', 'digestive system', 'blood circulation', 'plant cell'];
queries.forEach(q => {
    const asset = getAsset(q);
    console.log(`Query: ${q} ->`, asset);
    
    if (asset) {
        const lessonPath = path.join(__dirname, 'public/assets', asset.asset, 'v1', 'lesson.json');
        const lessonExists = fs.existsSync(lessonPath);
        const diagramPath = path.join(__dirname, 'public/assets', asset.asset, 'v1', 'diagram.svg');
        const diagramExists = fs.existsSync(diagramPath);
        console.log(`  lesson.json exists: ${lessonExists}`);
        console.log(`  diagram.svg exists: ${diagramExists}`);
        if (lessonExists) {
            const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
            console.log(`  lessonData has steps: ${!!(lessonData.steps && lessonData.steps.length > 0)}`);
        }
    }
});
