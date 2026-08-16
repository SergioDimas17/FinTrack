package com.fintrack.web.tests.auth;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.pages.LoginPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Suite Negativa: Autenticación de Usuarios")
public class LoginNegativeTest extends BaseTest {

    private LoginPage loginPage;

    @BeforeEach
    void setUp() {
        loginPage = new LoginPage(page);
        navigateToApp();
    }

    @Test
    @DisplayName("CP-NEG-01: Intentar iniciar sesión con credenciales incorrectas")
    void loginWithInvalidCredentials() {
        loginPage.login("usuario_inexistente@fintrack.com", "clave_erronea_123");
        
        assertTrue(loginPage.isErrorVisible(), "El mensaje de error debería ser visible tras ingresar credenciales inválidas");
    }

    @Test
    @DisplayName("CP-NEG-02: Intentar iniciar sesión con campos vacíos")
    void loginWithEmptyFields() {
        loginPage.login("", "");
        
        // Verifica que la app permanezca en la pantalla de login o muestre validación de campos
        assertTrue(loginPage.isLoginButtonVisible(), "El usuario debería permanecer en la pantalla de inicio de sesión");
    }

    @Test
    @DisplayName("CP-NEG-03: Intentar iniciar sesión con formato de correo inválido")
    void loginWithInvalidEmailFormat() {
        loginPage.login("correo_sin_formato.com", "password123");
        
        assertTrue(loginPage.isLoginButtonVisible(), "El formulario no debería procesar la autenticación con un correo con formato inválido");
    }
}