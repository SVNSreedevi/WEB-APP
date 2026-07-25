const ExcelJS = require('exceljs');
const fs = require('fs');

async function generateFallbackReport(outputPath = 'execution-report.xlsx') {
    if (fs.existsSync(outputPath)) {
        console.log('Report already exists, skipping fallback generation.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Appium E2E Automation Fallback';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 15 }
    ];
    
    summarySheet.addRows([
        { metric: 'Total Tests', value: 0 },
        { metric: 'Passed', value: 0 },
        { metric: 'Failed', value: 1 },
        { metric: 'Skipped', value: 0 },
        { metric: 'Pass Rate (%)', value: '0.00%' },
        { metric: 'Status', value: 'FATAL CRASH' }
    ]);

    const errorSheet = workbook.addWorksheet('Error Log');
    errorSheet.columns = [
        { header: 'Error', key: 'error', width: 100 }
    ];
    errorSheet.addRow({ error: 'WebDriverIO execution failed to complete. See CI logs for details.' });

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Fallback Excel report generated at ${outputPath}`);
}

// If executed directly
if (require.main === module) {
    const outputFile = process.argv[2] || 'execution-report.xlsx';
    generateFallbackReport(outputFile).catch(console.error);
}
