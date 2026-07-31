package com.fintrack.mobile.utils;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class ScreenshotUtils {

    private static final Logger log = LoggerFactory.getLogger(ScreenshotUtils.class);
    private static final Path TARGET = Paths.get("target", "screenshots");

    private ScreenshotUtils() {
    }

    public static String capture(AppiumDriver driver, String name) {
        if (driver == null) {
            log.warn("Driver is null, cannot capture screenshot for {}", name);
            return null;
        }
        try {
            Files.createDirectories(TARGET);
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            Path file = TARGET.resolve(timestamp + "-" + safe(name) + ".png");
            Files.copy(((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE).toPath(),
                    file, StandardCopyOption.REPLACE_EXISTING);
            log.info("Screenshot saved: {}", file);
            return file.toString();
        } catch (IOException e) {
            log.error("Failed to capture screenshot for {}", name, e);
            return null;
        }
    }

    private static String safe(String name) {
        return name == null ? "screenshot" : name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
