require('dotenv').config();

module.exports = {
  environment: process.env.NODE_ENV || 'qa',
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || false,
  timeouts: {
    implicit: 10000,
    explicit: 15000,
    pageLoad: 30000
  },
  reportConfig: {
    excelReportPath: './reports/excel/E2E_Report_Passed.xlsx',
    screenshotsDir: './reports/failures/'
  }
};
