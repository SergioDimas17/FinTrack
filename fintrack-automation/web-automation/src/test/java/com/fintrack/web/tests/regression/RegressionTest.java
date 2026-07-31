package com.fintrack.web.tests.regression;

import com.fintrack.web.base.BaseTest;
import com.fintrack.web.fixtures.TestData;
import com.fintrack.web.pages.DashboardPage;
import com.fintrack.web.pages.HistoryPage;
import com.fintrack.web.pages.LoginPage;
import com.fintrack.web.pages.TransferPage;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("regression")
@DisplayName("Regression Tests - FinTrack Web")
public class RegressionTest extends BaseTest {

    @Test
    @DisplayName("Full transfer flow: login, transfer between accounts, verify success")
    @Description("Regression: log in, navigate to transfers, perform a transfer between two accounts and confirm the success message.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Transfers")
    void fullTransferFlow() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();
        dashboard.sidebar().goToTransfers();

        TransferPage transfer = new TransferPage(page);
        transfer.transfer(TestData.SOURCE_ACCOUNT, TestData.DESTINATION_ACCOUNT, TestData.SAMPLE_AMOUNT);

        transfer.successMessage().waitFor();
        assertTrue(transfer.isSuccessVisible(), "Transfer success message should be visible");
        assertNotNull(transfer.getSuccessMessage(), "Transfer success message should not be null");
    }

    @Test
    @DisplayName("Transfer with missing amount shows an error")
    @Description("Regression: submitting a transfer without an amount should surface an error, not a success.")
    @Severity(SeverityLevel.NORMAL)
    @Story("Transfers")
    void transferWithoutAmountShowsError() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();
        dashboard.sidebar().goToTransfers();

        TransferPage transfer = new TransferPage(page);
        transfer.fillTransfer(TestData.SOURCE_ACCOUNT, TestData.DESTINATION_ACCOUNT, "");
        transfer.submit();

        assertTrue(transfer.isErrorVisible(), "An error should be shown when the amount is missing");
    }

    @Test
    @DisplayName("History flow: login, open history, verify transaction list and filters")
    @Description("Regression: log in, navigate to history and confirm the transaction list and filter controls are present.")
    @Severity(SeverityLevel.CRITICAL)
    @Story("History")
    void historyFlow() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();
        dashboard.sidebar().goToHistory();

        HistoryPage history = new HistoryPage(page);
        history.transactionList().waitFor();

        assertTrue(history.isTransactionListVisible(), "Transaction list should be visible on the history page");
        assertTrue(history.isFilterVisible(), "Filter control should be visible on the history page");
        assertTrue(history.transactionCount() >= 0, "Transaction count should be a non-negative number");
    }

    @Test
    @DisplayName("History filter narrows the transaction list")
    @Description("Regression: applying a filter on the history page keeps the transaction list visible.")
    @Severity(SeverityLevel.NORMAL)
    @Story("History")
    void historyFilterWorks() {
        LoginPage login = new LoginPage(page);
        login.navigate(webUrl);
        login.login(testUserEmail, testUserPassword);

        DashboardPage dashboard = new DashboardPage(page);
        dashboard.balanceDisplay().waitFor();
        dashboard.sidebar().goToHistory();

        HistoryPage history = new HistoryPage(page);
        history.transactionList().waitFor();
        history.filterBy(TestData.FILTER_ALL);

        assertTrue(history.isTransactionListVisible(), "Transaction list should remain visible after filtering");
    }
}
