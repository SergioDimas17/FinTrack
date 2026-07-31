package com.fintrack.web.utils;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

import java.util.Map;

public final class PlaywrightFactory {

    private PlaywrightFactory() {
    }

    public static Playwright createPlaywright() {
        return Playwright.create();
    }

    public static Browser createBrowser(Playwright playwright) {
        String browserName = ConfigUtils.envOr("BROWSER", "chromium");
        boolean headless = Boolean.parseBoolean(ConfigUtils.envOr("HEADLESS", "true"));

        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
                .setHeadless(headless)
                .setArgs(java.util.List.of("--start-maximized"));

        return browserTypeFor(playwright, browserName).launch(options);
    }

    public static Page createPage(Browser browser) {
        Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
                .setViewportSize(null);
        return browser.newContext(contextOptions).newPage();
    }

    public static Map<String, String> defaultHttpHeaders(String anonKey) {
        return Map.of(
                "apikey", anonKey == null ? "" : anonKey,
                "Content-Type", "application/json"
        );
    }

    private static BrowserType browserTypeFor(Playwright playwright, String name) {
        return switch (name.toLowerCase()) {
            case "firefox" -> playwright.firefox();
            case "webkit" -> playwright.webkit();
            default -> playwright.chromium();
        };
    }
}
