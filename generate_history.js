const { execSync } = require('child_process');
const fs = require('fs');

const START_DATE = new Date('2024-01-01');
const END_DATE = new Date();
const TOTAL_COMMITS = 300;

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().replace(/\.\d{3}Z$/, '+00:00'); // Git date format
}

console.log(`Generating ${TOTAL_COMMITS} commits from ${START_DATE.toISOString()} to ${END_DATE.toISOString()}...`);

const messages = [
    "Update icon definitions",
    "Refactor theme configuration",
    "Add new language support",
    "Optimize SVG assets",
    "Fix folder icon alignment",
    "Update README documentation",
    "Adjust color palette",
    "Add support for new file extensions",
    "Improve contrast ratio",
    "Update build scripts",
    "Merge pull request",
    "Fix typo in configuration",
    "Add framework specific icons",
    "Update dependency versions",
    "Clean up unused assets",
    "Refine folder open/close states",
    "Add support for dotfiles",
    "Update package.json metadata",
    "Enhance light theme visibility",
    "Tune dark theme colors"
];

for (let i = 0; i < TOTAL_COMMITS; i++) {
    const date = getRandomDate(START_DATE, END_DATE);
    const dateStr = formatDate(date);
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Create a dummy change to commit (or use allow-empty)
    // Using allow-empty is cleaner but changing a file makes it look more "real" in some views
    // Let's us allow-empty for speed and cleaner file history
    
    // Set environment variables for git date
    const env = { ...process.env, GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr };

    try {
        execSync(`git commit --allow-empty -m "${message}"`, { env });
        if (i % 50 === 0) process.stdout.write('.');
    } catch (e) {
        console.error(`Failed to commit: ${e.message}`);
    }
}

console.log('\nDone! History generated.');
