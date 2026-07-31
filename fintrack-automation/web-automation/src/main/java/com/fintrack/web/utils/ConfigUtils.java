package com.fintrack.web.utils;

import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.Map;

public final class ConfigUtils {

    private static final String DEFAULT_ENV = "qa";
    private static final String ENV_DIR = "/environments/";

    private ConfigUtils() {
    }

    public static String envOr(String key, String fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = System.getProperty(key);
        }
        return (value == null || value.isBlank()) ? fallback : value;
    }

    public static String activeEnvironment() {
        return envOr("TEST_ENV", DEFAULT_ENV);
    }

    public static Map<String, Object> loadEnvironment(String envName) {
        String file = ENV_DIR + envName + ".yml";
        try (InputStream stream = ConfigUtils.class.getResourceAsStream(file)) {
            if (stream == null) {
                throw new IllegalStateException("Environment file not found on classpath: " + file);
            }
            return new Yaml().load(stream);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load environment config: " + file, e);
        }
    }

    public static Map<String, Object> loadActiveEnvironment() {
        return loadEnvironment(activeEnvironment());
    }

    public static String get(Map<String, Object> config, String key) {
        Object value = config.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    public static String resolvePlaceholder(String raw) {
        if (raw == null) {
            return "";
        }
        if (raw.startsWith("${") && raw.endsWith("}")) {
            String envKey = raw.substring(2, raw.length() - 1);
            return envOr(envKey, "");
        }
        return raw;
    }
}
