package com.fintrack.mobile.tests.auth;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.screens.LoginScreen;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginNegativeTest extends BaseTest {

    @Test
    @DisplayName("CP-MOB-NEG-LOG-01: Rechazo de inicio de sesión con credenciales inválidas")
    public void testFailedLoginInvalidCredentials() {
        LoginScreen loginScreen = new LoginScreen(driver);
        loginScreen.login("usuario_falso@gmail.com", "claveIncorrecta123");

        assertTrue(loginScreen.isErrorVisible(), "Debería mostrarse un mensaje de alerta tras ingresar credenciales no válidas.");
    }
}