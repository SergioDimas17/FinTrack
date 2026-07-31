package com.fintrack.mobile.drivers;

import com.fintrack.mobile.utils.ConfigUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public final class DriverFactory {

    private DriverFactory() {
    }

    public static AndroidDriver createDriver() {
        return new AndroidDriver(appiumServerUrl(), capabilities());
    }

    public static URL appiumServerUrl() {
        Map<String, Object> envConfig = ConfigUtils.loadEnvironment();
        String url = ConfigUtils.get(envConfig, "appiumUrl");
        if (url == null || url.isBlank()) {
            url = System.getenv().getOrDefault("APPIUM_URL", "http://localhost:4723");
        }
        try {
            return new URL(url);
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Invalid Appium server URL: " + url, e);
        }
    }

    public static DesiredCapabilities capabilities() {
        Map<String, Object> envConfig = ConfigUtils.loadEnvironment();
        var env = System.getenv();
        DesiredCapabilities caps = new DesiredCapabilities();
        caps.setCapability("platformName", env.getOrDefault("PLATFORM_NAME",
                ConfigUtils.get(envConfig, "platformName") != null ? ConfigUtils.get(envConfig, "platformName") : "Android"));
        caps.setCapability("automationName", env.getOrDefault("AUTOMATION_NAME", "UiAutomator2"));
        caps.setCapability("browserName", env.getOrDefault("BROWSER_NAME", "Chrome"));
        caps.setCapability("noReset", Boolean.parseBoolean(env.getOrDefault("NO_RESET", "true")));
        caps.setCapability("newCommandTimeout", env.getOrDefault("NEW_COMMAND_TIMEOUT", "120"));
        return caps;
    }
}
