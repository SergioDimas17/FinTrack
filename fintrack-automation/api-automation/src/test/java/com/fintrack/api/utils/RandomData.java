package com.fintrack.api.utils;

import java.util.Random;

public final class RandomData {

    private static final Random random = new Random();
    private static final String ALPHA = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";

    private RandomData() {
    }

    public static String holderName() {
        return "Usuario " + randomString(ALPHA, 6);
    }

    public static double amount() {
        return Math.round((10 + random.nextDouble() * 990) * 100.0) / 100.0;
    }

    public static String idempotencyKey() {
        return "key-" + System.currentTimeMillis() + "-" + random.nextInt(10000);
    }

    public static String email() {
        return "test" + random.nextInt(100000) + "@fintrack.dev";
    }

    private static String randomString(String chars, int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
