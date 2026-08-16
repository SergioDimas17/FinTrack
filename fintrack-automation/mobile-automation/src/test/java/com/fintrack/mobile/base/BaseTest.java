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
        public void testFailed(ExtensionContext context, Throwable cause) { // Cambiado a public
            String name = context.getTestClass().map(Class::getSimpleName).orElse("Test")
                    + "-" + context.getTestMethod().map(m -> m.getName()).orElse("test");
            log.error("Prueba fallida: {}. Capturando evidencia...", name);
            ScreenshotUtils.capture((AppiumDriver) driver, name);
        }

        @Override
        public void testSuccessful(ExtensionContext context) { // Cambiado a public
            log.info("Test exitoso: {}", context.getDisplayName());
        }
    };

    @BeforeAll
    void setUpDriver() {
        envConfig = ConfigUtils.loadEnvironment();
        log.info("Iniciando driver de Appium...");
        driver = DriverFactory.createDriver();
        String webUrl = ConfigUtils.get(envConfig, "webUrl");
        if (webUrl != null && !webUrl.isBlank()) {
            driver.get(webUrl);
        }
    }

    @AfterAll
    void tearDownDriver() {
        if (driver != null) {
            log.info("Cerrando sesión de Appium...");
            driver.quit();
            driver = null;
        }
    }

    @AfterEach
    void resetState() {
        Optional.ofNullable(driver).ifPresent(d -> {
            try {
                d.manage().deleteAllCookies();
            } catch (Exception ignored) {
            }
        });
    }
}