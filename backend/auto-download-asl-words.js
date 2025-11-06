/**
 * Auto-download common ASL words
 * Downloads the 100 most common English words from free ASL sources
 * Run once, then all future paragraphs work instantly!
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Top 100 most common English words
const COMMON_WORDS = [
  'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
  'can', 'may', 'might', 'must', 'shall',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'this', 'that', 'these', 'those',
  'what', 'who', 'where', 'when', 'why', 'how', 'which',
  'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under',
  'go', 'come', 'see', 'look', 'get', 'make', 'take', 'give', 'say', 'tell',
  'ask', 'think', 'know', 'want', 'need', 'like', 'love', 'hate', 'feel', 'hear'
];

// Free ASL video sources
const ASL_SOURCES = [
  {
    name: 'Signing Savvy',
    urlPattern: (word) => `https://www.signingsavvy.com/media/mp4-ld/${word}.mp4`,
    method: 'direct'
  },
  {
    name: 'HandSpeak',
    urlPattern: (word) => `https://www.handspeak.com/word/search/signs/${word}.mp4`,
    method: 'direct'
  }
];

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/asl/words');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Download a single file
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(outputPath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', (err) => {
      resolve(false);
    });
  });
}

/**
 * Try to download ASL video for a word from multiple sources
 */
async function downloadASLForWord(word) {
  const outputPath = path.join(OUTPUT_DIR, `${word}.mp4`);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`   ✅ ${word}.mp4 (already exists)`);
    return true;
  }
  
  // Try each source
  for (const source of ASL_SOURCES) {
    const url = source.urlPattern(word);
    console.log(`   🔍 Trying ${source.name} for "${word}"...`);
    
    const success = await downloadFile(url, outputPath);
    
    if (success && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      console.log(`   ✅ ${word}.mp4 downloaded from ${source.name}`);
      return true;
    } else {
      // Delete failed download
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  }
  
  console.log(`   ⏭️  ${word} - no video found (will use text fallback)`);
  return false;
}

/**
 * Download all common words
 */
async function downloadCommonWords() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   Auto-Download Common ASL Words                    ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  console.log(`📥 Downloading ${COMMON_WORDS.length} common words...\n`);
  console.log(`💾 Output directory: ${OUTPUT_DIR}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < COMMON_WORDS.length; i++) {
    const word = COMMON_WORDS[i];
    console.log(`\n[${i + 1}/${COMMON_WORDS.length}] Processing: ${word}`);
    
    const success = await downloadASLForWord(word);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 Download Summary:');
  console.log(`   ✅ Successfully downloaded: ${successCount} words`);
  console.log(`   ⏭️  Not found (will use text): ${failCount} words`);
  console.log(`   📁 Total files in ${OUTPUT_DIR}: ${fs.readdirSync(OUTPUT_DIR).length}`);
  
  console.log('\n🎉 Done! Your app now has ASL support for common words!');
  console.log('\n💡 Tip: You can add more words to the COMMON_WORDS array and run again.');
}

/**
 * Alternative: Generate text file with download URLs
 * (If automatic download doesn't work, you can manually download)
 */
function generateDownloadList() {
  const listPath = path.join(__dirname, 'asl-download-list.txt');
  let content = '# ASL Video Download List\n';
  content += '# Download these videos and place them in frontend/public/asl/words/\n\n';
  
  COMMON_WORDS.forEach(word => {
    ASL_SOURCES.forEach(source => {
      content += `${word}.mp4 <- ${source.urlPattern(word)}\n`;
    });
    content += '\n';
  });
  
  fs.writeFileSync(listPath, content);
  console.log(`\n📝 Download list saved to: ${listPath}`);
}

// Run the script
if (require.main === module) {
  downloadCommonWords().catch(err => {
    console.error('❌ Error:', err);
    console.log('\n💡 Generating download list instead...');
    generateDownloadList();
  });
}

module.exports = { downloadCommonWords, COMMON_WORDS };
