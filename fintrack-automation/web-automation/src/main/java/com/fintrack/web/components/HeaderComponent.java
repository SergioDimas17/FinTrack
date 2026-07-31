package com.fintrack.web.components;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class HeaderComponent {

    private final Page page;

    public HeaderComponent(Page page) {
        this.page = page;
    }

    public Locator logo() {
        return page.locator("[data-testid='header-logo'], .app-logo, header img").first();
    }

    public Locator userMenu() {
        return page.locator("[data-testid='user-menu'], .user-menu, [aria-label*='user' i]").first();
    }

    public void openUserMenu() {
        userMenu().click();
    }

    public void logout() {
        openUserMenu();
        page.getByText("Logout", new Page.GetByTextOptions().setExactMatch(false)).click();
    }

    public boolean isLogoVisible() {
        return logo().isVisible();
    }

    public String currentUser() {
        return userMenu().textContent();
    }
}
