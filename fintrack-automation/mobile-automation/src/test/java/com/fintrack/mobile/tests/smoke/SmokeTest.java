package com.fintrack.mobile.tests.smoke;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.screens.LoginScreen;
import com.fintrack.mobile.screens.TransferScreen;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SmokeTest extends BaseTest {

    @Test
    @Order(1)
    @DisplayName("CP-MOB-SMK-01: Carga de la pantalla de inicio de sesión")
    public void testLoginScreenLoads() {
        LoginScreen loginScreen = new LoginScreen(driver);
        assertTrue(loginScreen.isLoginButtonVisible(), "El botón de inicio de sesión debería ser visible.");
    }

    @Test
    @Order(2)
    @DisplayName("CP-MOB-SMK-02: Inicio de sesión exitoso")
    public void testSuccessfulLogin() {
        LoginScreen loginScreen = new LoginScreen(driver);
        loginScreen.login("pruebasQA@gmail.com", "pruebas123");
        assertTrue(loginScreen.isDashboardLoaded(), "Fallo Crítico: Se hizo clic en Login, pero la aplicación nunca ingresó al Dashboard.");
    }

    @Test
    @Order(3)
    @DisplayName("CP-MOB-SMK-03: Navegación, llenado y confirmación de transferencia")
    public void testNavigateToTransfer() {
        TransferScreen transferScreen = new TransferScreen(driver);
        transferScreen.executeTransfer("1000004", "50.00");
        
        // Aserción de confirmación E2E
        assertTrue(transferScreen.isSuccessVisible(), "Error E2E: La transferencia no mostró la notificación de confirmación exitosa.");
    }
}