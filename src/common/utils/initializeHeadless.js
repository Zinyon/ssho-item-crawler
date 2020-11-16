const chromium = require('chrome-aws-lambda');

/**
 * headless browser 초기화
 * @param targetUrl
 * @returns {Promise<{browser: *, page: *}>}
 */
module.exports.initializeHeadless = async(targetUrl) => {

    const BROWSER_OPTION = {
        headless: chromium.headless,
        args: chromium.args,
        executablePath: await chromium.executablePath,
        defaultViewport: chromium.defaultViewport,
        slowMo: 100,
        ignoreHTTPSErrors: true
    }

    const browser = await chromium.puppeteer.launch(BROWSER_OPTION);

    const page = await browser.newPage();

    await page.goto(targetUrl);

    return { browser: browser, page: page }
}
