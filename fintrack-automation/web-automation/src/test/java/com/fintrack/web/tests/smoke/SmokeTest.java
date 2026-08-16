package com.fintrack.web.tests.smoke;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.pages.DashboardPage;
import com.fintrack.web.pages.LoginPage;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("smoke")
@DisplayName("Suite Smoke - Verificación Básica de Dashboard")
public class SmokeTest extends BaseTest {

    private LoginPage loginPage;
    private DashboardPage dashboardPage;

    @BeforeEach
    public void setUp() {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);

        loginPage.navigate(webUrl);
        loginPage.login(testUserEmail, testUserPassword);
    }

    @Test
    @DisplayName("CP-SMK-01: Validar carga del login y dashboard")
    @Description("Verifica que tras autenticarse correctamente, el contenedor del dashboard sea visible.")
    @Severity(SeverityLevel.BLOCKER)
    @Story("Carga Inicial de Dashboard")
    public void loginAndDashboardLoads() {
        assertTrue(dashboardPage.isAccountListVisible(), "La lista de cuentas debe ser visible en el dashboard");
    }

    @Test
    @DisplayName("CP-SMK-02: Validar que el dashboard muestre al menos una cuenta")
    @Description("Verifica que las tarjetas de cuenta del usuario se rendericen en el dashboard.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Visualización de Cuentas")
    public void dashboardShowsAccounts() {
        assertTrue(dashboardPage.accountCount() > 0, "El dashboard debe mostrar al menos una cuenta cargada");
    }
}