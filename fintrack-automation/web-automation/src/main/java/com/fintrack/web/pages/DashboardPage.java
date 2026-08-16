package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class DashboardPage {
    private final Page page;

    public DashboardPage(Page page) {
        this.page = page;
    }

    // Contenedor principal de tarjetas de cuenta
    public Locator accountList() {
        return page.locator("[data-testid='account-list'], .account-list, div:has-text('Saldo disponible'), div:has-text('1000083')").first();
    }

    // Tarjetas de cuenta individuales en la pantalla
    public Locator accountItems() {
        return page.locator("[data-testid='account-item'], .account-item, .account-card, div.rounded-lg.border, div:has-text('USD'), div:has-text('US$')");
    }

    // Verifica visibilidad con espera explícita
    public boolean isAccountListVisible() {
        try {
            accountList().waitFor(new Locator.WaitForOptions().setTimeout(10000));
            return accountList().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    // Cuenta las tarjetas esperando a que al menos una esté renderizada
    public int accountCount() {
        try {
            accountItems().first().waitFor(new Locator.WaitForOptions().setTimeout(10000));
            return accountItems().count();
        } catch (Exception e) {
            return 0;
        }
    }
}