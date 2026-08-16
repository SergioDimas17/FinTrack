package com.fintrack.mobile.screens;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DashboardScreen {

    private final WebDriverWait wait;

    // Localizadores basados en los data-testids y atributos ARIA heredados de la web
    private final By balanceDisplay = By.cssSelector("[data-testid='balance'], .balance, [aria-label*='balance' i]");
    private final By accountList = By.cssSelector("[data-testid='account-list'], .account-list, [aria-label*='account' i]");

    public DashboardScreen(AndroidDriver driver) {
        // Se utiliza 'driver' solo para instanciar la espera explícita
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public boolean isDashboardVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(balanceDisplay)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getBalance() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(balanceDisplay)).getText();
    }

    public boolean isAccountListVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(accountList)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}