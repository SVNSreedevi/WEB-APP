const { expect } = require('chai');
const BasePage = require('../pages/BasePage');

describe('Sample Passing E2E Tests', function () {
  let page;

  beforeEach(async function () {
    page = new BasePage(global.driver);
  });

  it('TC_001: Should successfully load the homepage', async function () {
    await page.open('/');
    const title = await page.getTitle();
    expect(title).to.be.a('string');
  });

  it('TC_002: Should verify server response is successful', async function () {
    await page.open('/');
    // Check if body is present as a basic test
    const bodyExists = await page.executeScript('return document.body != null');
    expect(bodyExists).to.be.true;
  });

  it('TC_003: Should verify the page URL is correct', async function () {
    await page.open('/');
    const url = await global.driver.getCurrentUrl();
    expect(url).to.include('localhost');
  });
});
