package com.fintrack.web.base;

import com.fintrack.web.utils.ScreenshotUtils;
import com.microsoft.playwright.Page;
import io.qameta.allure.Attachment;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Path;

public class ScreenshotOnFailureExtension implements AfterEachCallback {

    private static final Logger log = LoggerFactory.getLogger(ScreenshotOnFailureExtension.class);

    @Override
    public void afterEach(ExtensionContext context) {
        if (context.getExecutionException().isEmpty()) {
            return;
        }

        Object instance = context.getTestInstance().orElse(null);
        if (!(instance instanceof BaseTest baseTest)) {
            return;
        }

        Page page = baseTest.page;
        if (page == null) {
            return;
        }

        String testName = context.getDisplayName();
        Path shot = ScreenshotUtils.captureOnFailure(page, testName);
        attachScreenshot(shot);
    }

    @Attachment(value = "Failure screenshot", type = "image/png", fileExtension = "png")
    private byte[] attachScreenshot(Path path) {
        try {
            return java.nio.file.Files.readAllBytes(path);
        } catch (Exception e) {
            log.warn("Could not attach screenshot to Allure: {}", e.getMessage());
            return new byte[0];
        }
    }
}
