const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client/src');

const replacements = {
    '#b388ff': '#4db6ac',
    '#ff8b94': '#ff9800',
    '#d4a5ff': '#81d4fa',
    '#6b5b95': '#00897b',
    '#8c5ce6': '#00897b',
    '#ffaaa5': '#ffcc80',
    'rgba(179, 136, 255': 'rgba(77, 182, 172',
    'rgba(179,136,255': 'rgba(77,182,172',
    'rgba(212, 165, 255': 'rgba(77, 182, 172',
    'rgba(212,165,255': 'rgba(77,182,172',
    'rgba(255, 170, 165': 'rgba(255, 152, 0',
    'rgba(255,170,165': 'rgba(255,152,0'
};

function walkDir(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(walkDir(fullPath));
        } else if (entry.isFile() && fullPath.endsWith('.vue')) {
            files.push(fullPath);
        }
    }
    return files;
}

const vueFiles = walkDir(srcDir);

for (const file of vueFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (content.includes(oldVal)) {
            content = content.split(oldVal).join(newVal);
            hasChanges = true;
        }
    }

    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
}
