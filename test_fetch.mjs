import fs from 'fs';
import path from 'path';

const file1 = 'C:\\Users\\91844\\Downloads\\AI Teacher\\public\\assets\\diagrams\\geography\\volcanic_eruption\\v1\\lesson.json';
const file2 = 'C:\\Users\\91844\\Downloads\\AI Teacher\\public\\assets\\diagrams\\geography\\plate_tectonics\\v1\\lesson.json';

console.log("File 1 exists:", fs.existsSync(file1));
console.log("File 2 exists:", fs.existsSync(file2));

if (fs.existsSync(file1)) {
    console.log("File 1 contents:", fs.readFileSync(file1, 'utf8').substring(0, 100) + "...");
}
