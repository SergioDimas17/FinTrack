package com.fintrack.api.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class ConfigLoader {

    private static final String DEFAULT_ENV = "qa";
    private static final Properties props = new Properties();

    static {
        String env = System.getProperty("karate.env", System.getenv().getOrDefault("KARATE_ENV", DEFAULT_ENV));
        String fileName = "environments/" + env + ".properties";
        try (InputStream is = ConfigLoader.class.getClassLoader().getResourceAsStream(fileName)) {
            if (is != null) {
                props.load(is);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo cargar el ambiente: " + fileName, e);
        }
    }

    private ConfigLoader() {
    }

    public static String get(String key) {
        String envValue = System.getenv(key);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }
        String sysValue = System.getProperty(key);
        if (sysValue != null && !sysValue.isBlank()) {
            return sysValue;
        }
        return props.getProperty(key);
    }

    public static String getBaseUrl() {
        return get("baseUrl");
    }

    public static String getAnonKey() {
        return get("supabaseAnonKey");
    }

    public static String getTestUserEmail() {
        return get("testUserEmail");
    }

    public static String getTestUserPassword() {
        return get("testUserPassword");
    }

    public static String getFunctionsUrl() {
        return get("functionsUrl");
    }
}
