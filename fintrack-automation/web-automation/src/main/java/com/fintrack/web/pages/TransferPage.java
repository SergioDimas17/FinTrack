package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class TransferPage {

    private final Page page;

    public TransferPage(Page page) {
        this.page = page;
    }

    public Locator sourceAccountSelect() {
        return page.locator("[data-testid='source-account'], select#source-account, [aria-label*='source' i]").first();
    }

    public Locator destinationAccountSelect() {
        return page.locator("[data-testid='destination-account'], select#destination-account, [aria-label*='destination' i]").first();
    }

    public Locator amountField() {
        return page.locator("[data-testid='amount'], input[type='number'], input#amount").first();
    }

    public Locator submitButton() {
        return page.locator("[data-testid='submit-transfer'], button[type='submit'], button:has-text('Transfer')").first();
    }

    public Locator successMessage() {
        return page.locator("[data-testid='success-message'], .success, [role='status']").first();
    }

    public Locator errorMessage() {
        return page.locator("[data-testid='error-message'], .error, [role='alert']").first();
    }

    public void fillTransfer(String source, String destination, String amount) {
        sourceAccountSelect().selectOption(source);
        destinationAccountSelect().selectOption(destination);
        amountField().fill(amount);
    }

    public void submit() {
        submitButton().click();
    }

    public void transfer(String source, String destination, String amount) {
        fillTransfer(source, destination, amount);
        submit();
    }

    public String getSuccessMessage() {
        return successMessage().textContent();
    }

    public boolean isSuccessVisible() {
        return successMessage().isVisible();
    }

    public boolean isErrorVisible() {
        return errorMessage().isVisible();
    }
}
