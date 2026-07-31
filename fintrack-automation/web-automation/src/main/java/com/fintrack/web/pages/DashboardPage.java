package com.fintrack.web.pages;

import com.fintrack.web.components.HeaderComponent;
import com.fintrack.web.components.SidebarComponent;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class DashboardPage {

    private final Page page;

    public DashboardPage(Page page) {
        this.page = page;
    }

    public Locator accountList() {
        return page.locator("[data-testid='account-list'], .account-list, [aria-label*='account' i]").first();
    }

    public Locator balanceDisplay() {
        return page.locator("[data-testid='balance'], .balance, [aria-label*='balance' i]").first();
    }

    public Locator accountItem(String accountNumber) {
        return page.locator(String.format("[data-testid='account-%s'], .account:has-text('%s')", accountNumber, accountNumber)).first();
    }

    public HeaderComponent header() {
        return new HeaderComponent(page);
    }

    public SidebarComponent sidebar() {
        return new SidebarComponent(page);
    }

    public String getBalance() {
        return balanceDisplay().textContent();
    }

    public int accountCount() {
        return page.locator("[data-testid='account-item'], .account-item").count();
    }

    public boolean isBalanceVisible() {
        return balanceDisplay().isVisible();
    }

    public boolean isAccountListVisible() {
        return accountList().isVisible();
    }

    public void selectAccount(String accountNumber) {
        accountItem(accountNumber).click();
    }
}
