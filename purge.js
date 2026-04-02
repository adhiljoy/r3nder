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
            if (content.includes('ACTUAL_RENDER_URL') || content.includes('YOUR_RENDER_BACKEND_URL')) {
                let newContent = content.replace(/ACTUAL_RENDER_URL/g, 'https://r3nder-api.onrender.com')
                                        .replace(/YOUR_RENDER_BACKEND_URL/g, 'https://r3nder-api.onrender.com');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Purged: ${fullPath}`);
            }
        }
    });
}

walk(searchPath);
