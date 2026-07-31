package com.fintrack.api.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    private JsonUtils() {
    }

    public static String extractField(String json, String field) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode node = root.path(field);
            if (node.isMissingNode()) {
                throw new RuntimeException("Campo no encontrado: " + field);
            }
            return node.asText();
        } catch (Exception e) {
            throw new RuntimeException("Error parseando JSON", e);
        }
    }

    public static boolean isValidJson(String json) {
        try {
            mapper.readTree(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
