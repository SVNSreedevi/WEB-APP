const fs = require('fs');
const path = require('path');
const xlsxReporter = require('./utils/xlsxReporter');
const { generateHtmlReport } = require('./utils/generateHtmlReport');

const resultsFile = path.join(__dirname, '.wdio-results.jsonl');

exports.config = {
    // Runner Configuration
    runner: 'local',
    port: 4723, // Appium port
    path: '/',

    autoCompileOpts: {
        autoCompile: false
    },

    // Specs
    specs: [
        process.env.WDIO_CI_SPEC || './tests/12_e2e/mega_android_1100.test.js'
    ],
    exclude: [],

    // Capabilities
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        // In a real run, this capability might be added dynamically or the app is already installed
        'appium:appWaitActivity': '*',
        'appium:noReset': true
    }],

    // Test Configurations
    logLevel: 'error',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [], // Assuming Appium is started manually via bash script

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 900000 // 15 mins to allow all 1100 tests
    },

    // =====
    // Hooks
    // =====

    onPrepare: function (config, capabilities) {
        console.log('--- Starting WDIO Test Run ---');
        if (fs.existsSync(resultsFile)) {
            fs.unlinkSync(resultsFile);
        }
        xlsxReporter.startRun();
    },

    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        // Capture mocha stats and write to jsonl
        const testData = {
            title: test.title,
            duration: duration,
            passed: passed,
            failed: !!error,
            error: error ? error.message : null
        };
        fs.appendFileSync(resultsFile, JSON.stringify(testData) + '\n');
    },

    after: function (result, capabilities, specs) {
        // Intercept fatal crash here if necessary, though afterTest usually covers it.
        // If it's a fatal setup crash, we might need to handle it.
        if (result === 1 && !fs.existsSync(resultsFile)) {
            // Setup crashed before tests ran
            console.error('Fatal crash occurred before any tests executed.');
        }
    },

    onComplete: async function(exitCode, config, capabilities, results) {
        console.log('--- WDIO Test Run Complete ---');
        try {
            if (fs.existsSync(resultsFile)) {
                const lines = fs.readFileSync(resultsFile, 'utf-8').split('\n').filter(Boolean);
                lines.forEach(line => {
                    const test = JSON.parse(line);
                    xlsxReporter.recordTest(test);
                });
                
                await xlsxReporter.generateReport('execution-report.xlsx');
                generateHtmlReport(resultsFile, 'execution-report.html');
                
                // Run summary generator for CI if needed
                require('./utils/generateSummary');
            } else {
                console.warn('No results file found to generate report.');
            }
        } catch (err) {
            console.error('Failed to generate reports:', err);
        }
    }
};
