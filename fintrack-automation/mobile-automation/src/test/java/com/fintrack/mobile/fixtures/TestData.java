package com.fintrack.mobile.fixtures;

import com.fintrack.mobile.utils.ConfigUtils;

public final class TestData {

    private TestData() {
    }

    public static String userEmail() {
        return ConfigUtils.envVar("TEST_USER_EMAIL", "pruebasQA@gmail.com");
    }

    public static String userPassword() {
        return ConfigUtils.envVar("TEST_USER_PASSWORD", "PruebasQA123!");
    }

    public static String transferAmount() {
        return ConfigUtils.envVar("TEST_TRANSFER_AMOUNT", "10.00");
    }

    public static String sourceAccount() {
        return ConfigUtils.envVar("TEST_SOURCE_ACCOUNT", "Checking");
    }

    public static String destinationAccount() {
        return ConfigUtils.envVar("TEST_DESTINATION_ACCOUNT", "Savings");
    }
}
