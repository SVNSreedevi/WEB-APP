const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/env.config');
const logger = require('./LoggerUtils');

class BrowserUtils {
  static async getDriver() {
    let driver;
    try {
      const browserName = config.browser.toLowerCase();
      const headless = config.headless;

      logger.info(`Initializing browser: ${browserName} | Headless: ${headless}`);

      switch (browserName) {
        case 'chrome':
          let chromeOptions = new chrome.Options();
          if (headless) {
            chromeOptions.addArguments('--headless');
            chromeOptions.addArguments('--disable-gpu');
            chromeOptions.addArguments('--window-size=1920,1080');
          }
          driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
          break;

        case 'firefox':
          let firefoxOptions = new firefox.Options();
          if (headless) {
            firefoxOptions.addArguments('-headless');
          }
          driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build();
          break;

        case 'edge':
          let edgeOptions = new edge.Options();
          if (headless) {
            edgeOptions.addArguments('--headless');
            edgeOptions.addArguments('--disable-gpu');
          }
          driver = await new Builder().forBrowser('MicrosoftEdge').setEdgeOptions(edgeOptions).build();
          break;

        default:
          throw new Error(`Unsupported browser: ${browserName}`);
      }

      await driver.manage().setTimeouts({
        implicit: config.timeouts.implicit,
        pageLoad: config.timeouts.pageLoad,
        script: config.timeouts.explicit
      });

      if (!headless) {
        await driver.manage().window().maximize();
      }

      return driver;
    } catch (error) {
      logger.error(`Error initializing browser driver: ${error.message}`);
      throw error;
    }
  }

  static async quitDriver(driver) {
    if (driver) {
      try {
        await driver.quit();
        logger.info('Browser driver quit successfully.');
      } catch (error) {
        logger.error(`Error quitting driver: ${error.message}`);
      }
    }
  }
}

module.exports = BrowserUtils;
