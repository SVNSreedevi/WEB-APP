const fs = require('fs');

function generateSummary(resultsFilePath) {
    if (!fs.existsSync(resultsFilePath)) {
        console.error(`Results file not found: ${resultsFilePath}`);
        return;
    }

    const lines = fs.readFileSync(resultsFilePath, 'utf-8').split('\n').filter(Boolean);
    const results = lines.map(line => JSON.parse(line));

    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => r.failed).length;
    const skipped = results.filter(r => !r.passed && !r.failed).length;
    
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

    let summaryMarkdown = `## Appium E2E Test Execution Summary 📱\n\n`;
    summaryMarkdown += `| Metric | Value |\n`;
    summaryMarkdown += `|---|---|\n`;
    summaryMarkdown += `| Total Tests | ${total} |\n`;
    summaryMarkdown += `| Passed ✅ | ${passed} |\n`;
    summaryMarkdown += `| Failed ❌ | ${failed} |\n`;
    summaryMarkdown += `| Skipped ⏭️ | ${skipped} |\n`;
    summaryMarkdown += `| Pass Rate | **${passRate}%** |\n\n`;

    if (failed > 0) {
        summaryMarkdown += `### Failed Tests\n`;
        const failedTests = results.filter(r => r.failed).slice(0, 10);
        failedTests.forEach(test => {
            summaryMarkdown += `- \`${test.title}\`: ${test.error || 'Unknown error'}\n`;
        });
        if (failed > 10) {
            summaryMarkdown += `- *...and ${failed - 10} more.*\n`;
        }
    }

    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
        fs.appendFileSync(summaryFile, summaryMarkdown);
        console.log('Appended summary to GITHUB_STEP_SUMMARY');
    } else {
        console.log('GITHUB_STEP_SUMMARY not set, printing to console instead:');
        console.log(summaryMarkdown);
    }
}

// If executed directly
if (require.main === module) {
    const resultsFile = process.argv[2] || '.wdio-results.jsonl';
    generateSummary(resultsFile);
}
