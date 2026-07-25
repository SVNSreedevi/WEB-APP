const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./LoggerUtils');
const config = require('../config/env.config');

class ReportUtils {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.reportPath = path.join(__dirname, '..', config.reportConfig.excelReportPath);
    this.summarySheet = this.workbook.addWorksheet('Summary');
    this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
    this.failedTestsSheet = this.workbook.addWorksheet('Failed Tests');
    this.executionLogsSheet = this.workbook.addWorksheet('Execution Logs');

    this.initSheets();
    
    // Data structures for tracking
    this.stats = { passed: 0, failed: 0, skipped: 0, total: 0 };
    this.startTime = new Date();
  }

  initSheets() {
    // Sheet 1: Summary
    this.summarySheet.columns = [
      { header: 'Execution Date', key: 'date', width: 20 },
      { header: 'Environment', key: 'env', width: 15 },
      { header: 'Total Tests', key: 'total', width: 15 },
      { header: 'Passed', key: 'passed', width: 15 },
      { header: 'Failed', key: 'failed', width: 15 },
      { header: 'Skipped', key: 'skipped', width: 15 },
      { header: 'Pass Percentage', key: 'passPercentage', width: 15 },
      { header: 'Execution Duration', key: 'duration', width: 20 }
    ];

    // Sheet 2: Test Cases
    this.testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 10 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'scenario', width: 40 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Duration', key: 'duration', width: 15 }
    ];

    // Sheet 3: Failed Tests
    this.failedTestsSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 40 },
      { header: 'Failure Reason', key: 'reason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshot', width: 50 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'URL', key: 'url', width: 40 }
    ];

    // Sheet 4: Execution Logs
    this.executionLogsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 40 },
      { header: 'Step Description', key: 'step', width: 50 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
  }

  addTestCaseResult(testData) {
    this.stats.total++;
    if (testData.status === 'passed') this.stats.passed++;
    else if (testData.status === 'failed') this.stats.failed++;
    else this.stats.skipped++;

    this.testCasesSheet.addRow({
      id: `TC_${this.stats.total}`,
      module: testData.module || 'E2E',
      scenario: testData.scenario,
      browser: config.browser,
      status: testData.status,
      startTime: testData.startTime,
      endTime: testData.endTime,
      duration: testData.duration
    });
  }

  addFailedTest(failData) {
    this.failedTestsSheet.addRow({
      testName: failData.testName,
      reason: failData.reason,
      screenshot: failData.screenshotPath,
      browser: config.browser,
      url: failData.url
    });
  }

  addExecutionLog(logData) {
    this.executionLogsSheet.addRow({
      timestamp: new Date().toISOString(),
      testName: logData.testName,
      step: logData.step,
      result: logData.result,
      remarks: logData.remarks || ''
    });
  }

  async generateReport() {
    try {
      const endTime = new Date();
      const durationMs = endTime - this.startTime;
      const duration = `${(durationMs / 1000 / 60).toFixed(2)} mins`;
      const passPercentage = this.stats.total > 0 
        ? ((this.stats.passed / this.stats.total) * 100).toFixed(2) + '%' 
        : '0%';

      this.summarySheet.addRow({
        date: new Date().toLocaleDateString(),
        env: config.environment,
        total: this.stats.total,
        passed: this.stats.passed,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        passPercentage: passPercentage,
        duration: duration
      });

      const dir = path.dirname(this.reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await this.workbook.xlsx.writeFile(this.reportPath);
      logger.info(`Excel report generated successfully at: ${this.reportPath}`);
    } catch (error) {
      logger.error(`Error generating Excel report: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new ReportUtils();
