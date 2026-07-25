const fs = require('fs');
const path = require('path');
const logger = require('./LoggerUtils');
const config = require('../config/env.config');

class ScreenshotUtils {
  static async captureScreenshot(driver, testName) {
    try {
      const screenshotsDir = path.join(__dirname, '..', config.reportConfig.screenshotsDir);
      
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${sanitizedTestName}_${timestamp}.png`;
      const filePath = path.join(screenshotsDir, fileName);

      const image = await driver.takeScreenshot();
      fs.writeFileSync(filePath, image, 'base64');
      
      logger.info(`Screenshot saved for failed test: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture screenshot: ${error.message}`);
      return null;
    }
  }
}

module.exports = ScreenshotUtils;
