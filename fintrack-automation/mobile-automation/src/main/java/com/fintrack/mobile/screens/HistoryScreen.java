package com.fintrack.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class HistoryScreen {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    public HistoryScreen(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public List<String> transactions() {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(
                AppiumBy.accessibilityId("transaction-item"))).stream()
                .map(WebElement::getText)
                .toList();
    }

    public int transactionCount() {
        return transactions().size();
    }

    public boolean isLoaded() {
        return !transactions().isEmpty();
    }
}
