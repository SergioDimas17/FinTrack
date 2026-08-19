package com.fintrack.web.tests.sanity;

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

@Tag("sanity")
@DisplayName("Suite de Sanidad Web")
public class SanityTest extends BaseTest {

    private LoginPage loginPage;
    private DashboardPage dashboard;

    @BeforeEach
    public void setUp() {
        loginPage = new LoginPage(page);
        dashboard = new DashboardPage(page);

        loginPage.navigate(webUrl);
        loginPage.login(testUserEmail, testUserPassword);
    }

    @Test
    @DisplayName("ST-WEB-01: Verificación de Dashboard y Balance")
    @Description("Valida la carga básica del Dashboard y la visualización de saldo.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Navegación General")
    public void verifyDashboardAndBalance() {
        assertTrue(dashboard.isAccountListVisible(), "La lista de cuentas debe ser visible");
    }

    @Test
    @DisplayName("ST-WEB-02: Verificación de Navegación Lateral (Sidebar)")
    @Description("Valida que el menú lateral y sus opciones estén visibles.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Navegación General")
    public void verifySidebarNavigation() {
        assertTrue(dashboard.isSidebarVisible(), "El menú lateral debe estar visible");
        assertTrue(dashboard.isSidebarLinkVisible("Inicio"), "El enlace a Inicio debe estar visible");
        assertTrue(dashboard.isSidebarLinkVisible("Transferencias"), "El enlace a Transferencias debe estar visible");
    }

    @Test
    @DisplayName("ST-WEB-03: Verificación de Encabezado (Header)")
    @Description("Valida la visibilidad del logo en el encabezado.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Navegación General")
    public void verifyHeaderElements() {
        assertTrue(dashboard.isLogoVisible(), "El logo debe ser visible");
    }
}