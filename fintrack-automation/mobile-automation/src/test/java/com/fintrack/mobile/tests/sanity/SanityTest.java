package com.fintrack.mobile.tests.sanity;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.fixtures.TestData;
import com.fintrack.mobile.screens.DashboardScreen;
import com.fintrack.mobile.screens.LoginScreen;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("sanity")
@DisplayName("Suite Mobile - Pruebas Sanity")
public class SanityTest extends BaseTest {

    @Test
    @DisplayName("CP-MOB-SNT-01: Verificación de Login y Dashboard")
    public void testLoginAndDashboardSanity() {
        LoginScreen loginScreen = new LoginScreen(driver);
        loginScreen.login(TestData.VALID_EMAIL, TestData.VALID_PASSWORD);

        DashboardScreen dashboardScreen = new DashboardScreen(driver);
        assertTrue(dashboardScreen.isDashboardVisible(), "El Dashboard debe ser visible tras iniciar sesión.");
        assertTrue(dashboardScreen.isAccountListVisible(), "La lista de cuentas debe ser visible en el Dashboard.");
    }
}