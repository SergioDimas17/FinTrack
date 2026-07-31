package com.fintrack.web.utils;

import com.microsoft.playwright.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class ScreenshotUtils {

    private static final Logger log = LoggerFactory.getLogger(ScreenshotUtils.class);
    private static final Path SCREENSHOTS_DIR = Paths.get("target", "screenshots");
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private ScreenshotUtils() {
    }

    public static Path captureOnFailure(Page page, String testName) {
        try {
            Files.createDirectories(SCREENSHOTS_DIR);
        } catch (IOException e) {
            log.warn("Could not create screenshots directory: {}", e.getMessage());
        }

        String fileName = "FAIL-" + sanitize(testName) + "-" + LocalDateTime.now().format(TIMESTAMP) + ".png";
        Path destination = SCREENSHOTS_DIR.resolve(fileName);

        try {
            page.screenshot(new Page.ScreenshotOptions().setPath(destination).setFullPage(true));
            log.info("Failure screenshot saved to {}", destination);
        } catch (Exception e) {
            log.error("Failed to capture screenshot for {}: {}", testName, e.getMessage());
        }
        return destination;
    }

    private static String sanitize(String name) {
        return name == null ? "unknown" : name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
