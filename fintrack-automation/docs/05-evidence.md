# Evidencias

## Tipos de Evidencia

### API (Karate)
- **Logs de request/response**: Karate genera logs detallados de cada petición HTTP, incluyendo headers, body, status code y tiempo de respuesta.
- **Karate HTML Report**: reporte visual con timeline de escenarios en `target/karate-reports/`.
- **Cucumber JSON**: resultados en formato Cucumber para integración con herramientas CI.
- **JUnit XML**: resultados en formato JUnit para GitHub Actions.

### Web (Playwright)
- **Screenshots**: capturas automáticas en fallos y al final de cada test en `target/screenshots/`.
- **Videos**: grabación de la ejecución del navegador en `target/videos/`.
- **Playwright HTML Report**: reporte interactivo con traces en `target/playwright-report/`.
- **Allure**: reporte unificado con adjuntos de screenshots y logs.

### Mobile (Appium)
- **Screenshots**: capturas en fallos de test en `target/screenshots/`.
- **Videos**: grabación de pantalla del emulador/dispositivo (si el driver lo soporta).
- **Appium logs**: logs del servidor Appium y de la sesión.

### Performance (k6)
- **Output de consola**: métricas en tiempo real (p(95), p(99), RPS, VUs).
- **JSON results**: `k6 run --out json=reports/results.json` para análisis posterior.
- **Thresholds**: validaciones automáticas de performance.

### Security (OWASP ZAP)
- **HTML Report**: reporte completo de vulnerabilidades en `security/zap/reports/`.
- **Alertas**: listado de issues por severidad (High, Medium, Low, Informational).

## Ubicación de Evidencias

```
fintrack-automation/
├── api-automation/target/
│   ├── karate-reports/         # HTML report
│   ├── surefire-reports/       # JUnit XML
│   └── allure-results/         # Allure
├── web-automation/target/
│   ├── screenshots/            # PNG screenshots
│   ├── videos/                  # WebM videos
│   ├── playwright-report/      # HTML report
│   └── allure-results/         # Allure
├── mobile-automation/target/
│   ├── screenshots/            # PNG screenshots
│   └── surefire-reports/       # JUnit XML
├── performance/reports/        # k6 JSON results
└── security/zap/reports/       # ZAP HTML report
```

## Retención

- Los reportes se sobrescriben en cada ejecución local.
- En CI (GitHub Actions), los reportes se suben como artifacts y se conservan 90 días.
- Para comparar ejecuciones, copiar el directorio `target/` con timestamp antes de re-ejecutar.
