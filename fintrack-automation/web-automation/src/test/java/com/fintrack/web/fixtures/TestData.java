package com.fintrack.web.fixtures;

import com.fintrack.web.utils.ConfigUtils;

public final class TestData {

    public static final String TEST_USER_EMAIL = ConfigUtils.envOr("TEST_USER_EMAIL", "pruebasQA@gmail.com");
    public static final String TEST_USER_PASSWORD = ConfigUtils.envOr("TEST_USER_PASSWORD", "");

    public static final String SOURCE_ACCOUNT = "ACC-1001";
    public static final String DESTINATION_ACCOUNT = "ACC-2002";
    public static final String SAMPLE_AMOUNT = "25.50";
    public static final String LARGE_AMOUNT = "1000.00";

    public static final String FILTER_ALL = "all";
    public static final String FILTER_CREDIT = "credit";
    public static final String FILTER_DEBIT = "debit";

    private TestData() {
    }
}
