const fs = require('fs');
const path = require('path');

const searchPath = path.join('d:', 'R3NDER', 'dashboard', 'client', 'src');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('https://https://')) {
                let newContent = content.replace(/https:\/\/https:\/\//g, 'https://');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Sanitized Protocol: ${fullPath}`);
            }
        }
    });
}

walk(searchPath);
