package com.fintrack.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class TransferScreen {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    public TransferScreen(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public TransferScreen selectSource(String source) {
        sourceField().sendKeys(source);
        return this;
    }

    public TransferScreen selectDestination(String destination) {
        destinationField().sendKeys(destination);
        return this;
    }

    public TransferScreen enterAmount(String amount) {
        amountField().sendKeys(amount);
        return this;
    }

    public void send() {
        sendButton().click();
    }

    public void transfer(String source, String destination, String amount) {
        selectSource(source);
        selectDestination(destination);
        enterAmount(amount);
        send();
    }

    public boolean isLoaded() {
        return amountField().isDisplayed();
    }

    private WebElement sourceField() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("transfer-source")));
    }

    private WebElement destinationField() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("transfer-destination")));
    }

    private WebElement amountField() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("transfer-amount")));
    }

    private WebElement sendButton() {
        return wait.until(ExpectedConditions.elementToBeClickable(
                AppiumBy.accessibilityId("transfer-send")));
    }
}
