const { until, By } = require('selenium-webdriver');
const config = require('../config/env.config');
const logger = require('./LoggerUtils');

class ElementUtils {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForElementVisible(locator, timeout = config.timeouts.explicit) {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      logger.error(`Element not visible: ${locator} - ${error.message}`);
      throw error;
    }
  }

  async click(locator) {
    try {
      const element = await this.waitForElementVisible(locator);
      await this.driver.wait(until.elementIsVisible(element), config.timeouts.explicit);
      await this.driver.wait(until.elementIsEnabled(element), config.timeouts.explicit);
      await element.click();
      logger.info(`Clicked element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to click element: ${locator} - ${error.message}`);
      throw error;
    }
  }

  async typeText(locator, text) {
    try {
      const element = await this.waitForElementVisible(locator);
      await element.clear();
      await element.sendKeys(text);
      logger.info(`Typed text into element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to type text into element: ${locator} - ${error.message}`);
      throw error;
    }
  }

  async getText(locator) {
    try {
      const element = await this.waitForElementVisible(locator);
      const text = await element.getText();
      return text;
    } catch (error) {
      logger.error(`Failed to get text from element: ${locator} - ${error.message}`);
      throw error;
    }
  }

  async isElementDisplayed(locator) {
    try {
      const elements = await this.driver.findElements(locator);
      if (elements.length > 0) {
        return await elements[0].isDisplayed();
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ElementUtils;
