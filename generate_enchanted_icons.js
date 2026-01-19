const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const SOURCE_FILE = 'all_programming_languages.md';
const VARIANTS = ['mystic', 'aurora', 'twilight', 'ember']; // New variant names
const OUTPUT_DIR = path.join(__dirname, 'icons');
const THEMES_DIR = path.join(__dirname, 'themes');

// Enchanted Color Palettes
const PALETTES = {
  // Deep, vibrant, magical neon colors
  mystic: ['#B5179E', '#7209B7', '#560BAD', '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE', '#4895EF', '#4CC9F0', '#F72585', '#00F5D4', '#00BBF9'],
  
  // Soft, ethereal, aurora borealis pastels
  aurora: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F0E6EF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#9BF6FF', '#CAFFBF'],
  
  // Muted, dreamy, night sky tones
  twilight: ['#475D5B', '#6D7275', '#A2AAB0', '#C4CED4', '#E0E7EA', '#4A4E69', '#9A8C98', '#C9ADA7', '#22223B', '#F2E9E4', '#858E96', '#606C88'],
  
  // Warm, fiery, cozy ember tones
  ember: ['#FF4F00', '#FF7700', '#FF9F00', '#FFC700', '#FFEF00', '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#E9967A', '#FF6347', '#FF7F50']
};

function getConfig(variant) {
    if (variant === 'aurora') return { bg: '#ffffff', text: '#333333' };
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
    let clean = name.replace(/[^a-zA-Z0-9]/g, '');
    
    if (name.includes('++')) return 'C++';
    if (name.includes('#')) return 'C#';
    
    if (clean.length <= 3) return clean.toUpperCase();
    
    const match = name.match(/[A-Z]/g);
    if (match && match.length >= 2 && match.length <= 3) return match.join('');
    
    return clean.substring(0, 2).toUpperCase();
}

function generateSvg(name, variant) {
    const color = getColor(name, variant);
    const abbr = getAbbr(name);
    
    // Magical/Enchanted Icon Shape (Circle with magical glow effect simulated via strokes)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.15" />
  <circle cx="16" cy="16" r="12" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.8" />
  <text x="16" y="21" font-family="Consolas, 'Courier New', monospace" font-size="12" font-weight="bold" fill="${color}" text-anchor="middle">${abbr}</text>
</svg>`;
}

async function main() {
    console.log('Starting Enchanted Icons generation...');
    
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');
    const lines = content.split('\n');
    let languages = [];
    
    for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('>') || line.startsWith('-')) continue;
        const parts = line.split(',');
        for (let part of parts) {
            part = part.trim();
            if (part && part.length > 0 && !part.match(/^Note:/)) {
                languages.push(part);
            }
        }
    }
    
    languages = [...new Set(languages)].sort();
    console.log(`Found ${languages.length} unique languages.`);
    
    const newIconDefinitions = {};
    const newFileNames = {};
    const newExtensions = {}; // Best-effort default extensions
    
    // Add default folder icons manually first
    // Note: We'll generate simple folder icons too
    
    for (const lang of languages) {
        const safeName = lang.toLowerCase().replace(/[^a-z0-9\+\-\.]/g, '-').replace(/^-+|-+$/g, '');
        if (!safeName) continue;
        
        const iconName = `lang_${safeName}`;
        
        for (const variant of VARIANTS) {
            const svg = generateSvg(lang, variant);
            const dir = path.join(OUTPUT_DIR, variant);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            fs.writeFileSync(path.join(dir, `${iconName}.svg`), svg);
        }
        
        newIconDefinitions[iconName] = { iconPath: `./icons/${iconName}.svg` };
        newFileNames[safeName] = iconName;
        newExtensions[safeName] = iconName;
    }
    
    // Generate base file/folder icons
    for (const variant of VARIANTS) {
        const dir = path.join(OUTPUT_DIR, variant);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        // _file
        fs.writeFileSync(path.join(dir, '_file.svg'), 
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="${PALETTES[variant][0]}" d="M6 2v28h20V8l-6-6H6z" opacity="0.5"/><path fill="none" stroke="${PALETTES[variant][0]}" stroke-width="2" d="M6 2v28h20V8l-6-6H6z"/></svg>`);
            
        // _folder
        fs.writeFileSync(path.join(dir, '_folder.svg'), 
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="${PALETTES[variant][1]}" d="M2 6l2 2h24l2-2H2zm0 4v16h28V10H2z" opacity="0.5"/><path fill="none" stroke="${PALETTES[variant][1]}" stroke-width="2" d="M2 6l2 2h24l2-2H2zm0 4v16h28V10H2z"/></svg>`);

        // _folder_open
        fs.writeFileSync(path.join(dir, '_folder_open.svg'), 
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="${PALETTES[variant][1]}" d="M2 6l2 2h24l2-2H2zm0 6l4 16h24l-4-16H2z" opacity="0.5"/><path fill="none" stroke="${PALETTES[variant][1]}" stroke-width="2" d="M2 6l2 2h24l2-2H2zm0 6l4 16h24l-4-16H2z"/></svg>`);
    }

    // 3. Update Theme Files
    if (!fs.existsSync(THEMES_DIR)) fs.mkdirSync(THEMES_DIR, { recursive: true });
    
    for (const variant of VARIANTS) {
        // Create new theme file structure
        const theme = {
            hidesExplorerArrows: false,
            file: "_file",
            folder: "_folder",
            folderExpanded: "_folder_open",
            rootFolder: "_folder",
            rootFolderExpanded: "_folder_open",
            languageIds: newFileNames, // Mapping language IDs to icons
            fileExtensions: newExtensions,
            fileNames: newFileNames,
            iconDefinitions: {}
        };

        // Populate iconDefinitions
        for (const [key, _] of Object.entries(newIconDefinitions)) {
             theme.iconDefinitions[key] = { iconPath: `../icons/${variant}/${key}.svg` };
        }
        // Add base definitions
        theme.iconDefinitions["_file"] = { iconPath: `../icons/${variant}/_file.svg` };
        theme.iconDefinitions["_folder"] = { iconPath: `../icons/${variant}/_folder.svg` };
        theme.iconDefinitions["_folder_open"] = { iconPath: `../icons/${variant}/_folder_open.svg` };
        
        const themeFileName = `enchanted-${variant}.json`;
        fs.writeFileSync(path.join(THEMES_DIR, themeFileName), JSON.stringify(theme));
        console.log(`Created ${variant} theme.`);
    }
    
    console.log('Done!');
}

main().catch(console.error);
