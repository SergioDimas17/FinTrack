package com.fintrack.mobile.drivers;

import com.fintrack.mobile.utils.ConfigUtils;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;

import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.Map;

public final class DriverFactory {

    private DriverFactory() {
    }

    public static AndroidDriver createDriver() {
        return new AndroidDriver(appiumServerUrl(), options());
    }

    public static URL appiumServerUrl() {
        Map<String, Object> envConfig = ConfigUtils.loadEnvironment();
        String url = ConfigUtils.get(envConfig, "appiumUrl");
        if (url == null || url.isBlank()) {
            url = System.getenv().getOrDefault("APPIUM_URL", "http://127.0.0.1:4723");
        }
        try {
            return URI.create(url).toURL();
        } catch (Exception e) {
            throw new IllegalStateException("URL invalida para el servidor Appium: " + url, e);
        }
    }

    public static UiAutomator2Options options() {
        Map<String, Object> envConfig = ConfigUtils.loadEnvironment();
        var env = System.getenv();
        
        UiAutomator2Options options = new UiAutomator2Options();
        
        String platform = env.getOrDefault("PLATFORM_NAME",
                ConfigUtils.get(envConfig, "platformName") != null ? ConfigUtils.get(envConfig, "platformName") : "Android");
        String automation = env.getOrDefault("AUTOMATION_NAME", "UiAutomator2");
        String browser = env.getOrDefault("BROWSER_NAME", "Chrome");
        boolean noReset = Boolean.parseBoolean(env.getOrDefault("NO_RESET", "true"));
        long timeoutSec = Long.parseLong(env.getOrDefault("NEW_COMMAND_TIMEOUT", "120"));

        options.setPlatformName(platform);
        options.setAutomationName(automation);
        options.withBrowserName(browser);
        options.setNoReset(noReset);
        options.setNewCommandTimeout(Duration.ofSeconds(timeoutSec));
        
        return options;
    }
}