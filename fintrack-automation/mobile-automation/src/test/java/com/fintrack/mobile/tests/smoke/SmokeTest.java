package com.fintrack.mobile.tests.smoke;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.fixtures.TestData;
import com.fintrack.mobile.screens.DashboardScreen;
import com.fintrack.mobile.screens.LoginScreen;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("smoke")
public class SmokeTest extends BaseTest {

    @Test
    void appLaunchesAndLoginScreenIsVisible() {
        LoginScreen login = new LoginScreen(driver);
        assertTrue(login.isLoaded(), "Login screen should be visible after app launch");
    }

    @Test
    void userCanLoginAndSeeDashboard() {
        LoginScreen login = new LoginScreen(driver);
        login.loginAs(TestData.userEmail(), TestData.userPassword());

        DashboardScreen dashboard = new DashboardScreen(driver);
        assertTrue(dashboard.isLoaded(), "Dashboard should be visible after successful login");
    }
}
