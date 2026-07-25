#!/bin/bash
set -e

echo "Starting CI Test Run Pipeline..."

# 1. Install Debug APK
if [ -z "$APK_PATH" ]; then
    echo "Warning: APK_PATH is not set. Assuming app is already installed or handled by capabilities."
else
    echo "Installing APK from $APK_PATH..."
    adb install -r "$APK_PATH"
fi

# 2. Start Appium Server in Background
echo "Starting Appium server..."
# Using npx since appium might be installed locally
npx appium --log-level warn > /tmp/appium.log 2>&1 &
APPIUM_PID=$!

# Wait for Appium to respond on port 4723
echo "Waiting for Appium server to start on port 4723..."
TIMEOUT=30
while ! curl -s http://localhost:4723/status > /dev/null; do
    sleep 1
    TIMEOUT=$((TIMEOUT-1))
    if [ $TIMEOUT -eq 0 ]; then
        echo "Error: Appium server failed to start within 30 seconds."
        cat /tmp/appium.log
        exit 1
    fi
done
echo "Appium server is up and running!"

# 3. Handle GITHUB_PATH for Node.js binaries (if needed)
if [ -f "$GITHUB_PATH" ]; then
    echo "Injecting GITHUB_PATH into current PATH..."
    while IFS= read -r line; do
        export PATH="$line:$PATH"
    done < "$GITHUB_PATH"
fi

# 4. Execute WDIO
echo "Executing WebDriverIO Tests..."
set +e # Don't exit immediately if tests fail
node node_modules/@wdio/cli/bin/wdio.js run wdio.conf.js
WDIO_EXIT_CODE=$?
set -e

# 5. Handle Early Exit / Fallback Report
if [ $WDIO_EXIT_CODE -ne 0 ]; then
    echo "WDIO tests failed or exited early. Ensuring report generation..."
    if [ ! -f "execution-report.xlsx" ]; then
        echo "Primary report not found. Generating fallback report..."
        node utils/generateFallbackReport.js
    fi
fi

# Cleanup
echo "Stopping Appium server..."
kill $APPIUM_PID || true

echo "CI Test Run Pipeline Finished with exit code $WDIO_EXIT_CODE."
exit $WDIO_EXIT_CODE
