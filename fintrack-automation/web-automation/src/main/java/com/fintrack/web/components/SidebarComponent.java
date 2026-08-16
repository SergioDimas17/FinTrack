package com.fintrack.web.components;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import java.util.regex.Pattern;

public class SidebarComponent {

    private final Page page;

    public SidebarComponent(Page page) {
        this.page = page;
    }

    public Locator root() {
        return page.locator("[data-testid='sidebar'], aside, nav, .sidebar").first();
    }

    public Locator link(String label) {
        String labelLower = label.toLowerCase();

        // Estrategia de búsqueda por atributo URL (href) o texto (Inglés/Español)
        if (labelLower.contains("transfer")) {
            return page.locator("a[href*='transfer'], button[data-testid*='transfer'], aside a, nav a")
                       .filter(new Locator.FilterOptions().setHasText(Pattern.compile("Transfer", Pattern.CASE_INSENSITIVE)))
                       .or(page.locator("a[href*='transfer']"))
                       .or(page.getByText(Pattern.compile("Transfer", Pattern.CASE_INSENSITIVE)))
                       .first();
        } else if (labelLower.contains("history") || labelLower.contains("histor")) {
            return page.locator("a[href*='histor'], button[data-testid*='histor'], aside a, nav a")
                       .filter(new Locator.FilterOptions().setHasText(Pattern.compile("Histor", Pattern.CASE_INSENSITIVE)))
                       .or(page.locator("a[href*='histor']"))
                       .or(page.getByText(Pattern.compile("Histor", Pattern.CASE_INSENSITIVE)))
                       .first();
        } else if (labelLower.contains("dash") || labelLower.contains("inicio") || labelLower.contains("tablero")) {
            return page.locator("a[href*='dash'], a[href='/'], aside a, nav a")
                       .filter(new Locator.FilterOptions().setHasText(Pattern.compile("Dash|Inicio|Tablero", Pattern.CASE_INSENSITIVE)))
                       .or(page.getByText(Pattern.compile("Dash|Inicio|Tablero", Pattern.CASE_INSENSITIVE)))
                       .first();
        }

        // Búsqueda genérica por texto
        return page.locator("a, button, nav a, aside a, [role='link']")
                   .filter(new Locator.FilterOptions().setHasText(Pattern.compile(label, Pattern.CASE_INSENSITIVE)))
                   .first();
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
        try {
            link(label).waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return link(label).isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSidebarVisible() {
        try {
            root().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return root().isVisible();
        } catch (Exception e) {
            return false;
        }
    }
}