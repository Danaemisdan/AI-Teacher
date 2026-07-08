import fs from 'fs';
import path from 'path';

function renameAssetToDiagram(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            renameAssetToDiagram(fullPath);
        } else if (file === 'asset.svg') {
            const newPath = path.join(dir, 'diagram.svg');
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
        }
    }
}

const targetDir = 'c:\\Users\\91844\\Downloads\\AI Teacher\\public\\assets\\diagrams';
renameAssetToDiagram(targetDir);
console.log("All SVG files fixed!");
