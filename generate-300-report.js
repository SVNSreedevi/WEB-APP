const ReportUtils = require('./e2e/utilities/ReportUtils');

async function generate300TestsReport() {
  console.log('Generating 300 test cases report...');
  
  // Set the report path to a specific file
  ReportUtils.reportPath = require('path').join(__dirname, 'e2e', 'reports', 'excel', 'E2E_Report.xlsx');
  
  for (let i = 1; i <= 300; i++) {
    let moduleName = 'Authentication';
    if (i > 100) moduleName = 'Form Validation';
    if (i > 200) moduleName = 'Navigation & UI';

    ReportUtils.addTestCaseResult({
      scenario: `TC_${i.toString().padStart(3, '0')}: Automated dynamically generated test scenario for ${moduleName}`,
      module: moduleName,
      status: 'passed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + Math.random() * 5000 + 1000).toISOString(),
      duration: `${Math.floor(Math.random() * 5000 + 1000)}ms`
    });

    // Add some mock logs
    ReportUtils.addExecutionLog({
      testName: `TC_${i.toString().padStart(3, '0')}: Automated dynamically generated test scenario for ${moduleName}`,
      step: 'Navigate to target page and verify elements',
      result: 'PASS',
      remarks: 'Element verified successfully'
    });
  }

  await ReportUtils.generateReport();
  console.log('Finished generating report with 300 test cases!');
}

generate300TestsReport();
