package com.fintrack.mobile.screens;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class HistoryScreen {

    private final WebDriverWait wait;

    // Localizadores para la lista de transacciones e historial
    private final By historyNavButton = By.xpath("//button[contains(.,'Historial') or contains(.,'History')]");
    private final By transactionList = By.cssSelector("[data-testid='transaction-list'], table, .transaction-list, ul.space-y-2");
    private final By filterDropdown = By.cssSelector("[data-testid='filter'], select, button:has-text('Filtrar')");

    public HistoryScreen(AndroidDriver driver) {
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public void openHistorySection() {
        WebElement navBtn = wait.until(ExpectedConditions.elementToBeClickable(historyNavButton));
        navBtn.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(transactionList));
    }

    public boolean isTransactionListVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(transactionList)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isFilterVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(filterDropdown)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}