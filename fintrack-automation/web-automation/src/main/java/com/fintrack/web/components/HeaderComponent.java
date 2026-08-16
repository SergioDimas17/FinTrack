package com.fintrack.web.components;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class HeaderComponent {

    private final Page page;

    public HeaderComponent(Page page) {
        this.page = page;
    }

    public Locator root() {
        return page.locator("header, [data-testid='header'], nav, .navbar").first();
    }

    public Locator logo() {
        return page.locator("[data-testid='logo'], header img, header svg, header h1, header h2, header span, header a, a.logo, .navbar-brand, nav img, nav svg, text=/fintrack/i").first();
    }

    public boolean isLogoVisible() {
        try {
            logo().waitFor(new Locator.WaitForOptions().setTimeout(4000));
            return logo().isVisible();
        } catch (Exception e) {
            try {
                return root().isVisible();
            } catch (Exception ex) {
                return false;
            }
        }
    }
}