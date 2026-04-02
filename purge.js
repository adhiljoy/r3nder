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
            if (content.includes('YOUR_RENDER_BACKEND_URL')) {
                let newContent = content.replace(/YOUR_RENDER_BACKEND_URL/g, 'ACTUAL_RENDER_URL');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Purged: ${fullPath}`);
            }
        }
    });
}

walk(searchPath);
