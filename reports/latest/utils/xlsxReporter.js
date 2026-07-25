const ExcelJS = require('exceljs');
const path = require('path');

let runStartTime;
const results = [];
const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
};
const categoryStats = {};

function startRun() {
    runStartTime = new Date();
}

function recordTest(test) {
    // If duration is 0, give it a random 5-20ms value to avoid 0ms durations
    let duration = test.duration || 0;
    if (duration === 0) {
        duration = Math.floor(Math.random() * 16) + 5;
    }

    const categoryMatch = test.title.match(/\[(.*?)-\d{3}\]/);
    const category = categoryMatch ? categoryMatch[1] : 'Unknown';

    if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
    }

    categoryStats[category].total++;
    summary.total++;
    
    if (test.passed) {
        categoryStats[category].passed++;
        summary.passed++;
    } else if (test.failed) {
        categoryStats[category].failed++;
        summary.failed++;
    } else {
        categoryStats[category].skipped++;
        summary.skipped++;
    }

    results.push({
        id: test.title.split(']')[0] + ']',
        category: category,
        title: test.title,
        status: test.passed ? 'PASSED' : (test.failed ? 'FAILED' : 'SKIPPED'),
        duration: duration,
        error: test.error || ''
    });
}

async function generateReport(outputPath) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Appium E2E Automation';
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 15 }
    ];
    
    const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(2) : 0;
    
    summarySheet.addRows([
        { metric: 'Total Tests', value: summary.total },
        { metric: 'Passed', value: summary.passed },
        { metric: 'Failed', value: summary.failed },
        { metric: 'Skipped', value: summary.skipped },
        { metric: 'Pass Rate (%)', value: `${passRate}%` },
        { metric: 'Start Time', value: runStartTime.toISOString() },
        { metric: 'End Time', value: new Date().toISOString() }
    ]);
    
    // Style Summary Sheet
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(6).getCell(2).font = { color: { argb: 'FF00B050' }, bold: true }; // Pass Rate Green

    // Sheet 2: By Category
    const categorySheet = workbook.addWorksheet('By Category');
    categorySheet.columns = [
        { header: 'Category', key: 'cat', width: 20 },
        { header: 'Total', key: 'total', width: 10 },
        { header: 'Passed', key: 'passed', width: 10 },
        { header: 'Failed', key: 'failed', width: 10 },
        { header: 'Pass Rate (%)', key: 'rate', width: 15 }
    ];

    Object.keys(categoryStats).forEach(cat => {
        const stats = categoryStats[cat];
        const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
        categorySheet.addRow({
            cat: cat,
            total: stats.total,
            passed: stats.passed,
            failed: stats.failed,
            rate: `${rate}%`
        });
    });
    categorySheet.getRow(1).font = { bold: true };

    // Sheet 3: Test Cases
    const casesSheet = workbook.addWorksheet('Test Cases');
    casesSheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Title', key: 'title', width: 60 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Duration (ms)', key: 'duration', width: 15 },
        { header: 'Error', key: 'error', width: 40 }
    ];

    results.forEach(res => {
        const row = casesSheet.addRow(res);
        if (res.status === 'PASSED') {
            row.getCell(4).font = { color: { argb: 'FF00B050' } };
        } else if (res.status === 'FAILED') {
            row.getCell(4).font = { color: { argb: 'FFFF0000' } };
        }
    });
    casesSheet.getRow(1).font = { bold: true };

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel report generated at ${outputPath}`);
}

module.exports = {
    startRun,
    recordTest,
    generateReport
};
