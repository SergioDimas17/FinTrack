package com.fintrack.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class DashboardScreen {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    public DashboardScreen(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public String balance() {
        return balanceLabel().getText();
    }

    public List<String> accountNames() {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(
                AppiumBy.accessibilityId("account-item"))).stream()
                .map(WebElement::getText)
                .toList();
    }

    public boolean isLoaded() {
        return balanceLabel().isDisplayed();
    }

    private WebElement balanceLabel() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("balance")));
    }
}
