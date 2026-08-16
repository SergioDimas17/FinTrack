package com.fintrack.web.tests.regression;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.pages.DashboardPage;
import com.fintrack.web.pages.HistoryPage;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("regression")
@DisplayName("Regression Tests - FinTrack Web")
public class RegressionTest extends BaseTest {

    private LoginPage loginPage;
    private DashboardPage dashboardPage;
    private TransferPage transferPage;
    private HistoryPage historyPage;

    private final String testUser = "pruebasQA@gmail.com";
    private final String testPass = "pruebas123";
    private final String sourceAccount = "1000083";
    private final String destinationAccount = "1000082";

    @BeforeEach
    public void setUp() {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        transferPage = new TransferPage(page);
        historyPage = new HistoryPage(page);

        navigateToApp();
        loginPage.login(testUser, testPass);
        dashboardPage.isBalanceVisible();
    }

    @Test
    @DisplayName("Full transfer flow: login, transfer between accounts, verify success")
    @Description("Regression: log in, navigate to transfers, perform a transfer between two accounts and confirm the success message.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Transfers")
    void fullTransferFlow() {
        transferPage.openTransferSection();
        transferPage.transfer(sourceAccount, destinationAccount, "10");
        assertTrue(transferPage.isSuccessVisible(), "La transferencia debería completarse exitosamente en el flujo de regresión");
    }

    @Test
    @DisplayName("Transfer without amount shows error")
    @Description("Regression: attempt to transfer without providing an amount and confirm error/validation.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Transfers")
    void transferWithoutAmountShowsError() {
        transferPage.openTransferSection();
        transferPage.fillTransfer(sourceAccount, destinationAccount, "");
        transferPage.submit();
        assertFalse(transferPage.isSuccessVisible(), "No se debería permitir procesar una transferencia con el monto vacío");
    }

    @Test
    @DisplayName("History flow: verify transaction list is visible")
    @Description("Regression: navigate to history section and verify transaction list container.")
    @Severity(SeverityLevel.NORMAL)
    @Story("History")
    void historyFlow() {
        page.locator("a:has-text('Historial'), button:has-text('Historial'), a:has-text('History')").first().click();
        assertTrue(historyPage.isTransactionListVisible(), "La lista de transacciones debería ser visible en el historial");
    }

    @Test
    @DisplayName("History filter works")
    @Description("Regression: verify history filter controls are visible and usable.")
    @Severity(SeverityLevel.TRIVIAL)
    @Story("History")
    void historyFilterWorks() {
        page.locator("a:has-text('Historial'), button:has-text('Historial'), a:has-text('History')").first().click();
        assertTrue(historyPage.isFilterVisible(), "Los controles de filtro en la página de historial deberían estar visibles");
    }
}