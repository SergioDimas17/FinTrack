package com.fintrack.mobile.base;

import com.fintrack.mobile.drivers.DriverFactory;
import com.fintrack.mobile.utils.ConfigUtils;
import com.fintrack.mobile.utils.ScreenshotUtils;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.junit.jupiter.api.extension.TestWatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Optional;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseTest {

    protected static final Logger log = LoggerFactory.getLogger(BaseTest.class);
    protected static AndroidDriver driver;
    protected static Map<String, Object> envConfig;

    @RegisterExtension
    protected final TestWatcher failureWatcher = new TestWatcher() {
        @Override
        protected void testFailed(ExtensionContext context, Throwable cause) {
            String name = context.getTestClass().map(Class::getSimpleName).orElse("Test")
                    + "-" + context.getTestMethod().map(m -> m.getName()).orElse("test");
            ScreenshotUtils.capture((AppiumDriver) driver, name);
        }

        @Override
        protected void testSuccessful(ExtensionContext context) {
            log.info("Test passed: {}", context.getDisplayName());
        }
    };

    @BeforeAll
    void setUpDriver() {
        envConfig = ConfigUtils.loadEnvironment();
        log.info("Starting Appium driver for environment: {}", ConfigUtils.env());
        driver = DriverFactory.createDriver();
        String webUrl = ConfigUtils.get(envConfig, "webUrl");
        if (webUrl != null && !webUrl.isBlank()) {
            log.info("Navigating to web app: {}", webUrl);
            driver.get(webUrl);
        }
    }

    @AfterAll
    void tearDownDriver() {
        if (driver != null) {
            log.info("Quitting Appium driver");
            driver.quit();
            driver = null;
        }
    }

    @AfterEach
    void resetState() {
        Optional.ofNullable(driver).ifPresent(d -> {
            try {
                d.executeScript("mobile: clearCookies", Map.of());
            } catch (Exception ignored) {
            }
        });
    }
}
