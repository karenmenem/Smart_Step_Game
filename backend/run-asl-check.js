const { checkAndUpdateASLComplete } = require('./utils/aslChecker');

async function main() {
    console.log('Running ASL checker...');
    const result = await checkAndUpdateASLComplete();
    console.log('Done! Checked:', result.checked, 'questions');
    process.exit(0);
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
