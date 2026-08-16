package com.fintrack.mobile.tests.transfer;

import com.fintrack.mobile.base.BaseTest;
import com.fintrack.mobile.screens.LoginScreen;
import com.fintrack.mobile.screens.TransferScreen;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class TransferNegativeTest extends BaseTest {

    @Test
    @DisplayName("CP-MOB-NEG-TRF-01: Búsqueda con cuenta de destino inexistente")
    public void testInvalidDestinationAccount() {
        LoginScreen loginScreen = new LoginScreen(driver);
        loginScreen.login("pruebasQA@gmail.com", "pruebas123");

        TransferScreen transferScreen = new TransferScreen(driver);
        transferScreen.openTransferSection();
        transferScreen.selectSourceAccount();
        transferScreen.fillDestinationAccount("0000000"); // Cuenta inexistente

        assertTrue(transferScreen.isErrorVisible(), "Debería mostrarse un mensaje de error al validar una cuenta de destino inexistente.");
    }
}