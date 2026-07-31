package com.fintrack.api.utils;

import com.fintrack.api.config.ConfigLoader;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class TokenUtils {

    private TokenUtils() {
    }

    public static String getAccessToken() {
        String baseUrl = ConfigLoader.getBaseUrl();
        String anonKey = ConfigLoader.getAnonKey();
        String email = ConfigLoader.getTestUserEmail();
        String password = ConfigLoader.getTestUserPassword();

        String body = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\"}", email, password
        );

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/auth/v1/token?grant_type=password"))
                .header("Content-Type", "application/json")
                .header("apikey", anonKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new RuntimeException("Login fallo: " + response.statusCode() + " - " + response.body());
            }
            String responseBody = response.body();
            return extractJsonValue(responseBody, "access_token");
        } catch (Exception e) {
            throw new RuntimeException("Error obteniendo token de acceso", e);
        }
    }

    private static String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) {
            throw new RuntimeException("Campo no encontrado en respuesta: " + key);
        }
        start += search.length();
        int end = json.indexOf("\"", start);
        return json.substring(start, end);
    }
}
