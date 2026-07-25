const ElementUtils = require('../utilities/ElementUtils');
const config = require('../config/env.config');
const logger = require('../utilities/LoggerUtils');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.elements = new ElementUtils(driver);
  }

  async open(path = '') {
    const url = `${config.baseUrl}${path}`;
    await this.driver.get(url);
    logger.info(`Opened URL: ${url}`);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }
}

module.exports = BasePage;
