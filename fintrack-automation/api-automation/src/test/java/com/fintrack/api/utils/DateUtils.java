package com.fintrack.api.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private DateUtils() {
    }

    public static String today() {
        return LocalDate.now().format(ISO);
    }

    public static String daysAgo(int days) {
        return LocalDate.now().minusDays(days).format(ISO);
    }

    public static String daysFromNow(int days) {
        return LocalDate.now().plusDays(days).format(ISO);
    }
}
