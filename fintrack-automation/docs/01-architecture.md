# Arquitectura del Framework

## Visión General

FinTrack Automation es un monorepo que centraliza la automatización de pruebas en cinco áreas: API, Web, Mobile, Performance y Security. Cada módulo es independiente y se ejecuta por separado.

## Estructura

```
fintrack-automation/
├── api-automation/          # Karate + JUnit5 + Maven
│   └── src/test/
│       ├── java/com/fintrack/api/
│       │   ├── config/      # ConfigLoader, ApiConfig
│       │   ├── runners/      # Smoke, Sanity, Regression, Full
│       │   └── utils/        # TokenUtils, RandomData, DateUtils, JsonUtils, DatabaseUtils
│       └── resources/
│           ├── features/    # .feature files por módulo
│           ├── common/      # payloads, schemas, fixtures
│           └── environments/# dev, qa, uat, prod
├── web-automation/          # Playwright Java + JUnit5
│   └── src/
│       ├── main/java/       # Page Object Model
│       └── test/java/       # Tests (smoke, sanity, regression)
├── mobile-automation/       # Appium Java + JUnit5
│   └── src/
│       ├── main/java/       # Screen Object Model
│       └── test/java/       # Tests (smoke, sanity)
├── performance/             # k6
│   └── scripts/             # smoke, load, stress, spike
├── security/                # OWASP ZAP
│   └── zap/                 # scripts, config, reports
├── docs/                    # Documentación
├── .github/workflows/       # CI/CD
└── docker/                  # Dockerfiles y docker-compose
```

## Principios de Diseño

1. **Simplicidad**: cada módulo usa el patrón más simple posible (Page Object para UI, Features para API). No se usan patrones Enterprise innecesarios.
2. **Configuración centralizada**: URLs, tokens y credenciales viven en archivos de ambiente, nunca en el código.
3. **Separación de datos**: payloads, fixtures y schemas están separados de la lógica de prueba.
4. **Independencia**: cada módulo tiene su propio pom.xml y se ejecuta de forma aislada.
5. **Tags consistentes**: todos los escenarios usan tags (`@smoke`, `@regression`, `@sanity`, `@positive`, `@negative`).

## Flujo de Datos (API)

```
Karate Feature → karate-config.js → environments/operties
                                     ↓
                              baseUrl + anonKey
                                     ↓
                         POST /auth/v1/token (login)
                                     ↓
                           access_token (JWT)
                                     ↓
                    GET/POST /functions/v1/banking-api/*
                    POST /functions/v1/transfer
```

## Reportes

| Framework | Reporte | Ubicación |
|-----------|---------|-----------|
| Karate | HTML + Cucumber JSON | `api-automation/target/karate-reports/` |
| Playwright | HTML | `web-automation/target/playwright-report/` |
| Allure | HTML interactivo | `target/allure-results/` |
| JUnit5 | XML | `target/surefire-reports/` |
| k6 | Consola + JSON | `performance/reports/` |
| ZAP | HTML | `security/zap/reports/` |
