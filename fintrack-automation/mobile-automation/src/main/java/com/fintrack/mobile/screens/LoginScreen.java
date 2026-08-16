package com.fintrack.mobile.screens;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class en {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    private final By emailInput = By.cssSelector("input[type='email'], input#email");
    private final By passwordInput = By.cssSelector("input[type='password'], input#password");
    private final By loginButton = By.cssSelector("button[type='submit']");
    private final By errorMessage = By.xpath("//*[contains(@class,'text-red') or contains(@role,'alert') or contains(text(),'invalid') or contains(text(),'incorrect') or contains(text(),'Error') or contains(text(),'error')]");
    private final By dashboardHeader = By.tagName("header");

    public en(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public boolean isLoginButtonVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(loginButton)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void login(String email, String password) {
        WebElement emailEl = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        emailEl.click();
        emailEl.clear();
        emailEl.sendKeys(email);

        WebElement passEl = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        passEl.click();
        passEl.clear();
        passEl.sendKeys(password);

        try {
            driver.executeScript("document.activeElement.blur();");
            Thread.sleep(500);
        } catch (Exception ignored) {}

        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(loginButton));
        btn.click();
    }

    public boolean isDashboardLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(dashboardHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isErrorVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}