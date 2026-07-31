package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class HistoryPage {

    private final Page page;

    public HistoryPage(Page page) {
        this.page = page;
    }

    public Locator transactionList() {
        return page.locator("[data-testid='transaction-list'], .transaction-list, [aria-label*='transaction' i]").first();
    }

    public Locator transactionItem(String reference) {
        return page.locator(String.format("[data-testid='transaction-%s'], .transaction-item:has-text('%s')", reference, reference)).first();
    }

    public Locator filterDropdown() {
        return page.locator("[data-testid='filter'], select#filter, [aria-label*='filter' i]").first();
    }

    public Locator searchField() {
        return page.locator("[data-testid='search'], input[type='search'], input[placeholder*='search' i]").first();
    }

    public Locator dateFromField() {
        return page.locator("[data-testid='date-from'], input[name='dateFrom']").first();
    }

    public Locator dateToField() {
        return page.locator("[data-testid='date-to'], input[name='dateTo']").first();
    }

    public int transactionCount() {
        return page.locator("[data-testid='transaction-item'], .transaction-item").count();
    }

    public void filterBy(String value) {
        filterDropdown().selectOption(value);
    }

    public void searchBy(String text) {
        searchField().fill(text);
    }

    public void setDateRange(String from, String to) {
        dateFromField().fill(from);
        dateToField().fill(to);
    }

    public boolean isTransactionListVisible() {
        return transactionList().isVisible();
    }

    public boolean isFilterVisible() {
        return filterDropdown().isVisible();
    }
}
