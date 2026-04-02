const fs = require('fs');
const path = require('path');

const files = [
    path.join('d:', 'R3NDER', 'vercel.json'),
    path.join('d:', 'R3NDER', 'dashboard', 'client', 'vercel.json')
];

const vercelContent = `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

files.forEach(file => {
    if (fs.existsSync(file)) {
        fs.writeFileSync(file, vercelContent, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
