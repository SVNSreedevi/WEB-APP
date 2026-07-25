const BrowserUtils = require('../utilities/BrowserUtils');
const ReportUtils = require('../utilities/ReportUtils');
const ScreenshotUtils = require('../utilities/ScreenshotUtils');
const logger = require('../utilities/LoggerUtils');
const config = require('../config/env.config');

let driver;

before(async function () {
  logger.info('--- Starting E2E Test Execution ---');
});

beforeEach(async function () {
  global.driver = await BrowserUtils.getDriver();
});

afterEach(async function () {
  const testData = {
    scenario: this.currentTest.title,
    status: this.currentTest.state,
    startTime: new Date(Date.now() - this.currentTest.duration).toISOString(),
    endTime: new Date().toISOString(),
    duration: `${this.currentTest.duration}ms`
  };

  ReportUtils.addTestCaseResult(testData);

  if (this.currentTest.state === 'failed') {
    const screenshotPath = await ScreenshotUtils.captureScreenshot(global.driver, this.currentTest.title);
    const url = await global.driver.getCurrentUrl();
    
    ReportUtils.addFailedTest({
      testName: this.currentTest.title,
      reason: this.currentTest.err.message,
      screenshotPath,
      url
    });
  }

  await BrowserUtils.quitDriver(global.driver);
});

after(async function () {
  await ReportUtils.generateReport();
  logger.info('--- E2E Test Execution Completed ---');
});
