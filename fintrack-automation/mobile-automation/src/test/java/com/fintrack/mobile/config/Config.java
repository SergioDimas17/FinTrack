package com.fintrack.mobile.config;

public class Config {

    public static String getWebUrl() {
        return System.getProperty("webUrl", "https://fintech-micro-transf-6q7b.bolt.host");
    }

    public static String getTestUserEmail() {
        return System.getProperty("TEST_USER_EMAIL", "pruebasQA@gmail.com");
    }

    public static String getTestUserPassword() {
        return System.getProperty("TEST_USER_PASSWORD", "pruebas123");
    }
}