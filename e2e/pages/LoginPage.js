const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      usernameInput: By.css('input[name="username"], input[type="email"]'),
      passwordInput: By.css('input[name="password"], input[type="password"]'),
      loginButton: By.css('button[type="submit"]'),
      errorMessage: By.css('.error-message, .alert-danger')
    };
  }

  async login(username, password) {
    await this.elements.typeText(this.locators.usernameInput, username);
    await this.elements.typeText(this.locators.passwordInput, password);
    await this.elements.click(this.locators.loginButton);
  }

  async getErrorMessage() {
    return await this.elements.getText(this.locators.errorMessage);
  }
}

module.exports = LoginPage;
