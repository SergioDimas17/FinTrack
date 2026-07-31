package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class LoginPage {

    private final Page page;

    public LoginPage(Page page) {
        this.page = page;
    }

    public Locator emailField() {
        return page.locator("[data-testid='email'], input[type='email'], input#email").first();
    }

    public Locator passwordField() {
        return page.locator("[data-testid='password'], input[type='password'], input#password").first();
    }

    public Locator loginButton() {
        return page.locator("[data-testid='login-button'], button[type='submit'], button:has-text('Login'), button:has-text('Sign in')").first();
    }

    public Locator errorMessage() {
        return page.locator("[data-testid='error-message'], .error, [role='alert']").first();
    }

    public void navigate(String url) {
        page.navigate(url);
    }

    public void login(String email, String password) {
        emailField().fill(email);
        passwordField().fill(password);
        loginButton().click();
    }

    public String getErrorMessage() {
        return errorMessage().textContent();
    }

    public boolean isErrorVisible() {
        return errorMessage().isVisible();
    }

    public boolean isLoginButtonVisible() {
        return loginButton().isVisible();
    }
}
