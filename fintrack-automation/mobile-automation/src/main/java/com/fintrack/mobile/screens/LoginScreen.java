package com.fintrack.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginScreen {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    public LoginScreen(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public LoginScreen enterEmail(String email) {
        emailField().sendKeys(email);
        return this;
    }

    public LoginScreen enterPassword(String password) {
        passwordField().sendKeys(password);
        return this;
    }

    public void tapLogin() {
        loginButton().click();
    }

    public void loginAs(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        tapLogin();
    }

    public boolean isLoaded() {
        return emailField().isDisplayed();
    }

    private WebElement emailField() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("email")));
    }

    private WebElement passwordField() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                AppiumBy.accessibilityId("password")));
    }

    private WebElement loginButton() {
        return wait.until(ExpectedConditions.elementToBeClickable(
                AppiumBy.accessibilityId("login-button")));
    }
}
