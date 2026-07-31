package com.fintrack.mobile.utils;

import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.Map;

public final class ConfigUtils {

    private static final String DEFAULT_ENV = "qa";

    private ConfigUtils() {
    }

    public static String env() {
        return System.getenv().getOrDefault("TEST_ENV", DEFAULT_ENV);
    }

    public static String envVar(String key, String defaultValue) {
        return System.getenv().getOrDefault(key, defaultValue);
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> loadEnvironment() {
        String env = env();
        String path = "environments/" + env + ".yml";
        try (InputStream in = ConfigUtils.class.getClassLoader().getResourceAsStream(path)) {
            if (in == null) {
                throw new IllegalStateException("Environment config not found: " + path);
            }
            return new Yaml().loadAs(in, Map.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load environment config: " + path, e);
        }
    }

    public static String get(Map<String, Object> config, String key) {
        Object value = config.get(key);
        return value == null ? null : value.toString();
    }
}
