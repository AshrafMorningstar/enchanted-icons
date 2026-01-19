const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const SOURCE_FILE = 'all_programming_languages.md';
const VARIANTS = ['base', 'light', 'soft', 'warm'];
const OUTPUT_DIR = path.join(__dirname, 'icons');
const THEMES_DIR = path.join(__dirname, 'themes');

// Color Palettes (for random generation)
const PALETTES = {
  base: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFCC5C', '#FF9671', '#FF6F91', '#D4A5A5', '#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4'],
  light: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F0E6EF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFFFD1', '#9BF6FF', '#CAFFBF', '#FDFFB6'],
  soft: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6', '#FF00FF', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3', '#9932CC', '#8B008B', '#800080', '#4B0082'],
  warm: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#B8860B', '#DAA520', '#CD853F', '#D2691E', '#8B4513', '#A0522D', '#A52A2A', '#800000', '#FF6347', '#FF7F50']
};

function getConfig(variant) {
    if (variant === 'light') return { bg: '#ffffff', text: '#333333' };
    return { bg: '#1e1e2e', text: '#ffffff' };
}

// Helper to get consistent color from string
function getColor(name, variant) {
    const hash = crypto.createHash('md5').update(name).digest('hex');
    const index = parseInt(hash.substring(0, 8), 16) % PALETTES[variant].length;
    return PALETTES[variant][index];
}

// Helper to get 1-3 letter abbreviation
function getAbbr(name) {
    // Standard cleanup
    let clean = name.replace(/[^a-zA-Z0-9]/g, '');
    
    // Handle special cases manually if needed, or rely on logic
    if (name.includes('++')) return 'C++';
    if (name.includes('#')) return 'C#';
    
    if (clean.length <= 3) return clean.toUpperCase();
    
    // CamelCase -> CC
    const match = name.match(/[A-Z]/g);
    if (match && match.length >= 2 && match.length <= 3) return match.join('');
    
    return clean.substring(0, 2).toUpperCase();
}

function generateSvg(name, variant) {
    const color = getColor(name, variant);
    const abbr = getAbbr(name);
    const config = getConfig(variant);
    
    // Simple file icon shape
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path fill="${color}" d="M20 2H8C6.9 2 6 2.9 6 4V28C6 29.1 6.9 30 8 30H24C25.1 30 26 29.1 26 28V8L20 2Z" opacity="0.2"/>
  <path fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" d="M20 2H8C6.9 2 6 2.9 6 4V28C6 29.1 6.9 30 8 30H24C25.1 30 26 29.1 26 28V8L20 2Z M20 2V8H26"/>
  <text x="16" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="middle">${abbr}</text>
</svg>`;
}

async function main() {
    console.log('Starting massive icon generation...');
    
    // 1. Read and Parse Languages
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');
    const lines = content.split('\n');
    let languages = [];
    
    for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('>') || line.startsWith('-')) continue;
        
        // Split by comma, but handle special cases if any
        const parts = line.split(',');
        for (let part of parts) {
            part = part.trim();
            if (part && part.length > 0 && !part.match(/^Note:/)) {
                languages.push(part);
            }
        }
    }
    
    // Remove duplicates and sort
    languages = [...new Set(languages)].sort();
    console.log(`Found ${languages.length} unique languages.`);
    
    // 2. Generate Icons
    const newIconDefinitions = {};
    const newFileNames = {};
    const newExtensions = {}; // Best-effort default extensions
    
    for (const lang of languages) {
        const safeName = lang.toLowerCase().replace(/[^a-z0-9\+\-\.]/g, '-').replace(/^-+|-+$/g, '');
        if (!safeName) continue;
        
        const iconName = `lang_${safeName}`;
        
        // Generate for all variants
        for (const variant of VARIANTS) {
            const svg = generateSvg(lang, variant);
            const dir = path.join(OUTPUT_DIR, variant);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            fs.writeFileSync(path.join(dir, `${iconName}.svg`), svg);
        }
        
        // Store definition for theme.json
        // We'll use a relative path pattern that works for the way we structured the theme files
        // The theme files are in themes/ and assume ../icons/variant/
        newIconDefinitions[iconName] = { iconPath: `./icons/${iconName}.svg` }; // Placeholder, will be replaced by script with absolute or relative correct path logic
        
        // Add Mapping: We map the exact LANGUAGE NAME (lowercase) to the icon
        // We assume files named exactly "LanguageName" (which is rare) OR extensions
        // Since we don't have the extensions database, we will map:
        // 1. filename: "language.ext" (if we can guess)
        // 2. filename: "language"
        // 3. We will blindly add the normalized name as a file mapping, hoping the user names files that way or uses specific extensions we might guess?
        // Actually, without an extension DB, the best we can do is map the NAME.
        // But VS Code needs extensions. 
        // Let's create a "best guess" extension: .safeName
        newFileNames[safeName] = iconName;
        newExtensions[safeName] = iconName;
    }
    
    // 3. Update Theme Files
    for (const variant of VARIANTS) {
        const themeFile = path.join(THEMES_DIR, `codecharm-${variant}.json`);
        if (fs.existsSync(themeFile)) {
            const theme = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
            
            // Merge definitions
            // Note: we need to fix the path for each specific theme file
            const variantDefinitions = {};
            for (const [key, _] of Object.entries(newIconDefinitions)) {
                 variantDefinitions[key] = { iconPath: `../icons/${variant}/${key}.svg` };
            }
            
            theme.iconDefinitions = { ...theme.iconDefinitions, ...variantDefinitions };
            theme.fileNames = { ...theme.fileNames, ...newFileNames };
            theme.fileExtensions = { ...theme.fileExtensions, ...newExtensions };
            
            fs.writeFileSync(themeFile, JSON.stringify(theme)); // Minified
            console.log(`Updated ${variant} theme.`);
        }
    }
    
    console.log('Done!');
}

main().catch(console.error);
