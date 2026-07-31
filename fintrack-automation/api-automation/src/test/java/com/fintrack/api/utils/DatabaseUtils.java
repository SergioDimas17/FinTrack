package com.fintrack.api.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public final class DatabaseUtils {

    private DatabaseUtils() {
    }

    public static Connection getConnection(String jdbcUrl, String user, String password) {
        try {
            return DriverManager.getConnection(jdbcUrl, user, password);
        } catch (SQLException e) {
            throw new RuntimeException("No se pudo conectar a la base de datos", e);
        }
    }

    public static String getAccountNumberByHolder(Connection conn, String holderName) {
        String sql = "SELECT account_number FROM accounts WHERE holder_name = ? ORDER BY created_at DESC LIMIT 1";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, holderName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("account_number");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error consultando account_number", e);
        }
        return null;
    }

    public static double getBalanceByAccountNumber(Connection conn, String accountNumber) {
        String sql = "SELECT balance FROM accounts WHERE account_number = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, accountNumber);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("balance");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error consultando balance", e);
        }
        return -1;
    }
}
