package com.fintrack.mobile.tests.sanity;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.fixtures.TestData;
import com.fintrack.mobile.screens.DashboardScreen;
import com.fintrack.mobile.screens.LoginScreen;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("sanity")
public class SanityTest extends BaseTest {

    @Test
    void loginShowsBalanceOnDashboard() {
        LoginScreen login = new LoginScreen(driver);
        login.loginAs(TestData.userEmail(), TestData.userPassword());

        DashboardScreen dashboard = new DashboardScreen(driver);
        assertTrue(dashboard.isLoaded(), "Dashboard should be visible after login");
        assertFalse(dashboard.balance().isBlank(), "Balance should not be empty");
    }
}
