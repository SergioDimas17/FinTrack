package com.fintrack.mobile.screens;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class TransferScreen {

    private final AndroidDriver driver;
    private final WebDriverWait wait;

    private final By sourceAccountSelect = By.cssSelector("select.appearance-none, select");
    private final By destinationAccountInput = By.cssSelector("input[inputmode='numeric']");
    private final By searchAccountButton = By.xpath("//button[contains(.,'Buscar')]");
    private final By amountInput = By.cssSelector("input[type='number']");
    private final By submitTransferButton = By.xpath("//button[@type='submit'] | //button[contains(.,'Ejecutar transferencia')]");
    private final By successMessage = By.xpath("//*[contains(text(),'exitosa') or contains(text(),'completada') or contains(text(),'exitoso') or contains(text(),'Exitosa') or contains(text(),'Completada')]");
    private final By errorMessage = By.xpath("//*[contains(@class,'text-red') or contains(@role,'alert') or contains(text(),'Error') or contains(text(),'no encontrada') or contains(text(),'insuficiente')]");

    public TransferScreen(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public void openTransferSection() {
        try {
            Thread.sleep(3000);
            
            driver.executeScript(
                "var btns = document.querySelectorAll('button');" +
                "for(var i=0; i<btns.length; i++) {" +
                "  if(btns[i].innerHTML.includes('lucide-menu') || btns[i].getAttribute('aria-label') == 'menu') {" +
                "    btns[i].click(); break;" +
                "  }" +
                "}"
            );
            Thread.sleep(1000);
            driver.executeScript(
                "var links = document.querySelectorAll('button, a, li');" +
                "for(var j=0; j<links.length; j++) {" +
                "  if(links[j].textContent.includes('Transferir')) {" +
                "    links[j].click(); break;" +
                "  }" +
                "}"
            );
        } catch (Exception ignored) {}

        wait.until(ExpectedConditions.presenceOfElementLocated(sourceAccountSelect));
    }

    public void selectSourceAccount() {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//select/option[2]")));
        
        WebElement selectEl = driver.findElement(sourceAccountSelect);
        
        driver.executeScript(
            "var select = arguments[0];" +
            "select.selectedIndex = 1;" +
            "var event = new Event('change', { bubbles: true });" +
            "select.dispatchEvent(event);", selectEl
        );
    }

    public void fillDestinationAccount(String destinationAccount) {
        WebElement destInput = wait.until(ExpectedConditions.visibilityOfElementLocated(destinationAccountInput));
        destInput.click();
        destInput.clear();
        destInput.sendKeys(destinationAccount);

        try { driver.executeScript("document.activeElement.blur();"); Thread.sleep(500); } catch (Exception ignored) {}

        WebElement searchBtn = wait.until(ExpectedConditions.presenceOfElementLocated(searchAccountButton));
        try {
            wait.until(ExpectedConditions.elementToBeClickable(searchBtn)).click();
        } catch (Exception e) {
            driver.executeScript("arguments[0].click();", searchBtn);
        }
    }

    public void fillAmount(String amount) {
        WebElement amtInput = wait.until(ExpectedConditions.visibilityOfElementLocated(amountInput));
        amtInput.click();
        amtInput.clear();
        amtInput.sendKeys(amount);

        try { driver.executeScript("document.activeElement.blur();"); Thread.sleep(500); } catch (Exception ignored) {}
    }

    public void submitTransfer() {
        WebElement submitBtn = wait.until(ExpectedConditions.presenceOfElementLocated(submitTransferButton));
        try {
            wait.until(ExpectedConditions.elementToBeClickable(submitBtn)).click();
        } catch (Exception e) {
            driver.executeScript("arguments[0].click();", submitBtn);
        }
    }

    public void executeTransfer(String destinationAccount, String amount) {
        openTransferSection();
        selectSourceAccount();
        fillDestinationAccount(destinationAccount);
        fillAmount(amount);
        submitTransfer();
    }

    public boolean isSuccessVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(successMessage)).isDisplayed();
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