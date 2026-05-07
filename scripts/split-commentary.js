const fs = require('fs');
const path = require('path');

const commentary = fs.readFileSync(path.join(__dirname, '../Commentary.txt'), 'utf8');
const outputDir = path.join(__dirname, '../PBKS_Innings');

// Split by "Over X" pattern
const overPattern = /Over (\d+)\n([\s\S]*?)(?=Over \d+|$)/g;
let match;
let count = 0;

while ((match = overPattern.exec(commentary)) !== null) {
    const overNum = match[1];
    const overContent = match[2].trim();
    
    const filePath = path.join(outputDir, `over${overNum}.txt`);
    fs.writeFileSync(filePath, `Over ${overNum}\n${overContent}\n`);
    count++;
    console.log(`✅ Created over${overNum}.txt`);
}

console.log(`\n🎉 Total overs created: ${count}`);
