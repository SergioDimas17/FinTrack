package com.fintrack.web.tests.transfer;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.pages.LoginPage;
import com.fintrack.web.pages.TransferPage;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

@Tag("regression")
@Tag("transfer-negative")
@DisplayName("Suite Transferencias - Casos Negativos")
public class TransferNegativeTest extends BaseTest {

    private LoginPage loginPage;
    private TransferPage transferPage;

    @BeforeEach
    public void setUp() {
        loginPage = new LoginPage(page);
        transferPage = new TransferPage(page);

        // 1. Navegar e iniciar sesión
        loginPage.navigate(webUrl);
        loginPage.login(testUserEmail, testUserPassword);
        
        // 2. Se elimina la dependencia de DashboardPage y se delega la sincronización
        transferPage.openTransferSection();
    }

    @Test
    @DisplayName("CP-TRF-NEG-01: Intentar transferir con monto cero")
    @Description("Verifica que la aplicación no permita ejecutar transferencias con un monto de 0.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Validaciones de Transferencia")
    public void transferWithZeroAmount() {
        transferPage.fillTransfer("1000083", "1000082", "0");
        transferPage.submit();
        
        // Al enviar un monto inválido, el formulario no debe avanzar ni mostrar mensaje de éxito
        assertFalse(transferPage.isSuccessVisible(), "La aplicación no debería procesar una transferencia con monto 0");
    }

    @Test
    @DisplayName("CP-TRF-NEG-02: Intentar enviar transferencia con campo de monto vacío")
    @Description("Verifica que la aplicación valide el campo vacío y no procese la transferencia.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Validaciones de Transferencia")
    public void transferWithEmptyAmount() {
        transferPage.fillTransfer("1000083", "1000082", "");
        transferPage.submit();
        
        // Al enviar un monto vacío, el formulario no debe avanzar ni mostrar mensaje de éxito
        assertFalse(transferPage.isSuccessVisible(), "La aplicación no debería procesar la transferencia con el campo de monto vacío");
    }
}