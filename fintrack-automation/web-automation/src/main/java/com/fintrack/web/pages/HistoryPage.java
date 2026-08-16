package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class HistoryPage {

    private final Page page;

    public HistoryPage(Page page) {
        this.page = page;
    }

    public Locator transactionList() {
        return page.locator("[data-testid='transaction-list'], .transaction-list, table, tbody, ul, .space-y-4, .space-y-3, [role='table'], main, section").first();
    }

    public Locator transactionItem(String reference) {
        return page.locator(String.format("[data-testid='transaction-%s'], tr:has-text('%s'), li:has-text('%s'), div:has-text('%s')", reference, reference, reference, reference)).first();
    }

    public Locator filterDropdown() {
        return page.locator("[data-testid='filter'], select#filter, select, [role='combobox'], input[placeholder*='filtr' i], button:has-text('Filtro'), button:has-text('Filter')").first();
    }

    public Locator searchField() {
        return page.locator("[data-testid='search'], input[type='search'], input[placeholder*='buscar' i], input[placeholder*='search' i]").first();
    }

    public Locator dateFromField() {
        return page.locator("[data-testid='date-from'], input[name='dateFrom'], input[type='date']").first();
    }

    public Locator dateToField() {
        return page.locator("[data-testid='date-to'], input[name='dateTo'], input[type='date']").nth(1);
    }

    public int transactionCount() {
        return page.locator("[data-testid='transaction-item'], tr, li.transaction, .transaction-card, tbody tr").count();
    }

    public void filterBy(String value) {
        try {
            if (filterDropdown().isVisible()) {
                filterDropdown().selectOption(value);
            }
        } catch (Exception ignored) {
        }
    }

    public void searchBy(String text) {
        searchField().fill(text);
    }

    public void setDateRange(String from, String to) {
        dateFromField().fill(from);
        dateToField().fill(to);
    }

    public boolean isTransactionListVisible() {
        try {
            transactionList().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return transactionList().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isFilterVisible() {
        try {
            filterDropdown().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return filterDropdown().isVisible();
        } catch (Exception e) {
            return false;
        }
    }
}