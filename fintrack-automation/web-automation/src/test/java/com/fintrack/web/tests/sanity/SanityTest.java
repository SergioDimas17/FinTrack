package com.fintrack.web.tests.sanity;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.fixtures.TestData;
import com.fintrack.web.pages.DashboardPage;
import com.fintrack.web.pages.LoginPage;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("sanity")
@DisplayName("Sanity Tests - FinTrack Web")
public class SanityTest extends BaseTest {

    @Test
    @DisplayName("Login and verify balance is displayed and non-empty")
    @Description("Quick sanity check: log in and confirm the balance display shows a value.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Accounts")
    void loginAndCheckBalance() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();

        assertTrue(dashboard.isBalanceVisible(), "Balance display should be visible");
        String balance = dashboard.getBalance();
        assertNotNull(balance, "Balance text should not be null");
        assertFalse(balance.isBlank(), "Balance text should not be empty");
    }

    @Test
    @DisplayName("Login and verify sidebar navigation links are present")
    @Description("Quick sanity check: after login the sidebar exposes the main navigation links.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Navigation")
    void loginAndCheckSidebar() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();

        assertTrue(dashboard.sidebar().isSidebarVisible(), "Sidebar should be visible after login");
        assertTrue(dashboard.sidebar().isLinkVisible("Transfers"), "Transfers link should be visible");
        assertTrue(dashboard.sidebar().isLinkVisible("History"), "History link should be visible");
    }

    @Test
    @DisplayName("Login and verify header logo is visible")
    @Description("Quick sanity check: the header logo renders after login.")
    @Severity(SeverityLevel.MINOR)
    @Story("Navigation")
    void loginAndCheckHeader() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();

        assertTrue(dashboard.header().isLogoVisible(), "Header logo should be visible after login");
    }
}
