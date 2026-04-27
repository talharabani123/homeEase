/**
 * Script to apply AnimatedBackground to all screens
 * Run with: node apply-animated-background.js
 */

const fs = require('fs');
const path = require('path');

const screenDirectories = [
  'src/screens/customer',
  'src/screens/provider',
  'src/screens/emergency',
  'src/screens/auth',
  'src/screens/onboarding',
];

function addAnimatedBackgroundToFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has ScreenWrapper or AnimatedBackground
  if (content.includes('ScreenWrapper') || content.includes('AnimatedBackground')) {
    console.log(`✓ Skipped (already has background): ${filePath}`);
    return;
  }

  // Skip if it's not a screen component
  if (!content.includes('navigation') || !content.includes('Screen')) {
    console.log(`✓ Skipped (not a screen): ${filePath}`);
    return;
  }

  // Add import at the top (after other imports)
  const importStatement = "import ScreenWrapper from '../../components/ScreenWrapper';";
  const importRegex = /(import.*from.*;\n)(?!import)/;
  
  if (!content.includes("import ScreenWrapper")) {
    content = content.replace(importRegex, `$1${importStatement}\n`);
  }

  // Find the return statement and wrap content with ScreenWrapper
  // Look for patterns like: return ( <SafeAreaView or <View
  const returnPattern = /return\s*\(\s*<(SafeAreaView|View)/;
  
  if (returnPattern.test(content)) {
    // Wrap the returned JSX with ScreenWrapper
    content = content.replace(
      /return\s*\(\s*<(SafeAreaView|View)/,
      'return (\n    <ScreenWrapper>\n      <$1'
    );
    
    // Find the closing tag and add ScreenWrapper closing
    // This is tricky, so we'll add it before the last closing parenthesis of return
    const lines = content.split('\n');
    let returnFound = false;
    let bracketCount = 0;
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('return (')) {
        returnFound = true;
        bracketCount = 1;
        continue;
      }
      
      if (returnFound) {
        // Count opening and closing tags
        const openTags = (lines[i].match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (lines[i].match(/<\/[^>]+>/g) || []).length;
        bracketCount += openTags - closeTags;
        
        // Check for closing parenthesis
        if (lines[i].includes(');') && bracketCount <= 1) {
          insertIndex = i;
          break;
        }
      }
    }
    
    if (insertIndex > 0) {
      lines[insertIndex] = lines[insertIndex].replace(/\);/, '</ScreenWrapper>\n  );');
      content = lines.join('\n');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') && file.includes('Screen')) {
      try {
        addAnimatedBackgroundToFile(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  });
}

console.log('🎨 Applying Animated Background to all screens...\n');

screenDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processing: ${dir}`);
    processDirectory(dir);
  }
});

console.log('\n✨ Done! Animated background applied to all screens.');
console.log('Note: Please review the changes and adjust manually if needed.');
