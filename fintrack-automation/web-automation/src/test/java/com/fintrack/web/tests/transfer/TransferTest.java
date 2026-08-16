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

import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("sanity")
@Tag("transfer")
@DisplayName("Suite Sanity - Flujo de Transferencias Web")
public class TransferTest extends BaseTest {

    private LoginPage loginPage;
    private TransferPage transferPage;

    @BeforeEach
    public void setUp() {
        loginPage = new LoginPage(page);
        transferPage = new TransferPage(page);

        loginPage.navigate(webUrl);
        loginPage.login(testUserEmail, testUserPassword);
        transferPage.openTransferSection();
    }

    @Test
    @DisplayName("CP-TRF-01: Validar visibilidad de elementos del formulario de transferencia")
    @Description("Verifica que los controles principales del módulo de transferencias se rendericen correctamente en pantalla.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Navegación y Formulario de Transferencias")
    public void transferFormElementsAreVisible() {
        assertTrue(transferPage.isSourceAccountSelectVisible(), "El selector de cuenta origen debe ser visible");
        assertTrue(transferPage.isDestinationInputVisible(), "El campo de cuenta destino debe ser visible");
        assertTrue(transferPage.isAmountInputVisible(), "El campo de monto debe ser visible");
        assertTrue(transferPage.isSubmitButtonVisible(), "El botón de envío debe ser visible");
    }

    @Test
    @DisplayName("CP-TRF-02: Realizar una transferencia entre cuentas exitosamente")
    @Description("Ejecuta una transferencia completa entre dos cuentas válidas ($10) y verifica la pantalla de confirmación de éxito.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Proceso de Transferencia")
    public void successfulTransferProcess() {
        transferPage.transfer("1000083", "1000082", "10");
        assertTrue(transferPage.isSuccessVisible(), "La transferencia debería procesarse exitosamente");
    }
}