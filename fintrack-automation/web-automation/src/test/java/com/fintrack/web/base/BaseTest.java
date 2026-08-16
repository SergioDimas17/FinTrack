package com.fintrack.web.base;

import com.fintrack.web.utils.ConfigUtils;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.RegisterExtension;

import java.util.Map;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class BaseTest {

    // Variables protegidas para que las pruebas hijas las hereden
    protected String testUserEmail = System.getProperty("TEST_USER_EMAIL", "pruebasQA@gmail.com");
    protected String testUserPassword = System.getProperty("TEST_USER_PASSWORD", "pruebas123");

    protected String env = System.getProperty("env", "qa");
    protected Map<String, Object> config = ConfigUtils.loadActiveEnvironment();
    protected String webUrl = ConfigUtils.get(config, "webUrl");

    protected Playwright playwright;
    protected Browser browser;
    protected BrowserContext context;
    protected Page page;

    @RegisterExtension
    ScreenshotOnFailureExtension screenshotExtension = new ScreenshotOnFailureExtension();

    @BeforeAll
    public void setUpAll() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(new com.microsoft.playwright.BrowserType.LaunchOptions()
                .setHeadless(Boolean.parseBoolean(System.getProperty("headless", "true")))
                .setSlowMo(50));
    }

    @BeforeEach
    public void setUpEach() {
        context = browser.newContext(new Browser.NewContextOptions()
                .setViewportSize(1920, 1080)); 
        context.setDefaultTimeout(30000); 
        page = context.newPage();
    }

    // --- MÉTODOS RESTAURADOS ---

    // Permite que las pruebas naveguen a la URL base
    protected void navigateToApp() {
        page.navigate(webUrl);
    }

    // Permite que extensiones externas (como ScreenshotOnFailureExtension) accedan a la página
    public Page getPage() {
        return this.page;
    }

    // ---------------------------

    @AfterEach
    public void tearDownEach() {
        if (context != null) {
            context.close();
        }
    }

    @AfterAll
    public void tearDownAll() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }
}