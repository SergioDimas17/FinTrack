package com.fintrack.web.tests.smoke;

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

import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("smoke")
@DisplayName("Smoke Tests - FinTrack Web")
public class SmokeTest extends BaseTest {

    @Test
    @DisplayName("Login page loads with email, password and login button")
    @Description("Verify the login page renders the email field, password field and login button.")
    @Severity(SeverityLevel.BLOCKER)
    @Story("Authentication")
    void loginPageLoads() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);

        assertTrue(login.isLoginButtonVisible(), "Login button should be visible on the login page");
        assertTrue(login.emailField().isVisible(), "Email field should be visible");
        assertTrue(login.passwordField().isVisible(), "Password field should be visible");
    }

    @Test
    @DisplayName("Login with test user and dashboard loads")
    @Description("Verify a valid test user can log in and the dashboard with account list and balance is displayed.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Authentication")
    void loginAndDashboardLoads() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();

        assertTrue(dashboard.isAccountListVisible(), "Account list should be visible on the dashboard");
        assertTrue(dashboard.isBalanceVisible(), "Balance display should be visible on the dashboard");
    }

    @Test
    @DisplayName("Dashboard shows at least one account")
    @Description("After login the dashboard should list at least one account.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Accounts")
    void dashboardShowsAccounts() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();

        assertTrue(dashboard.accountCount() >= 1, "Dashboard should show at least one account");
    }
}
