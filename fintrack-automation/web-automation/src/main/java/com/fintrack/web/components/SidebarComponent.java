package com.fintrack.web.components;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class SidebarComponent {

    private final Page page;

    public SidebarComponent(Page page) {
        this.page = page;
    }

    public Locator root() {
        return page.locator("[data-testid='sidebar'], aside, nav.sidebar").first();
    }

    public Locator link(String label) {
        return page.getByRole(com.microsoft.playwright.options.AriaRole.LINK,
                new Page.GetByRoleOptions().setName(label));
    }

    public void goToDashboard() {
        link("Dashboard").click();
    }

    public void goToTransfers() {
        link("Transfers").click();
    }

    public void goToHistory() {
        link("History").click();
    }

    public boolean isLinkVisible(String label) {
        return link(label).isVisible();
    }

    public boolean isSidebarVisible() {
        return root().isVisible();
    }
}
