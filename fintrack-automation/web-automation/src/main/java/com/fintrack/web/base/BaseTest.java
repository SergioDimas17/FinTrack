package com.fintrack.web.base;

import com.fintrack.web.utils.ConfigUtils;
import com.fintrack.web.utils.PlaywrightFactory;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseTest {

    protected static final Logger log = LoggerFactory.getLogger(BaseTest.class);

    @RegisterExtension
    protected final ScreenshotOnFailureExtension screenshotOnFailure = new ScreenshotOnFailureExtension();

    protected Playwright playwright;
    protected Browser browser;
    protected Page page;

    protected Map<String, Object> environment;
    protected String webUrl;
    protected String supabaseUrl;
    protected String supabaseAnonKey;
    protected String testUserEmail;
    protected String testUserPassword;

    @BeforeAll
    void setUpSuite() {
        environment = ConfigUtils.loadActiveEnvironment();
        webUrl = ConfigUtils.get(environment, "webUrl");
        supabaseUrl = ConfigUtils.get(environment, "supabaseUrl");
        supabaseAnonKey = ConfigUtils.resolvePlaceholder(ConfigUtils.get(environment, "supabaseAnonKey"));

        testUserEmail = ConfigUtils.envOr("TEST_USER_EMAIL", "pruebasQA@gmail.com");
        testUserPassword = ConfigUtils.envOr("TEST_USER_PASSWORD", "");

        log.info("Environment={} | webUrl={} | supabaseUrl={}", ConfigUtils.activeEnvironment(), webUrl, supabaseUrl);

        playwright = PlaywrightFactory.createPlaywright();
        browser = PlaywrightFactory.createBrowser(playwright);
    }

    @BeforeEach
    void setUpTest() {
        page = PlaywrightFactory.createPage(browser);
        page.setDefaultTimeout(15000);
    }

    @AfterEach
    void tearDownTest() {
        if (page != null) {
            page.close();
        }
    }

    @AfterAll
    void tearDownSuite() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    protected void navigateToApp() {
        page.navigate(webUrl);
    }
}
