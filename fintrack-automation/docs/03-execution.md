# Ejecución

## API (Karate)

### Ejecutar por tipo de suite

```bash
cd api-automation

# Smoke (escenarios críticos)
mvn clean test -Dtest=SmokeRunner

# Sanity (validaciones rápidas)
mvn clean test -Dtest=SanityRunner

# Regression (todos los escenarios automatizados)
mvn clean test -Dtest=RegressionRunner

# Full (todas las pruebas)
mvn clean test -Dtest=FullRunner
```

### Ejecutar con ambiente específico

```bash
mvn clean test -Dtest=SmokeRunner -Dkarate.env=dev
mvn clean test -Dtest=SmokeRunner -Dkarate.env=qa
mvn clean test -Dtest=SmokeRunner -Dkarate.env=uat
```

### Ejecutar un Feature específico

```bash
mvn clean test -Dtest=SmokeRunner -Dkarate.options="--tags @accounts"
```

## Web (Playwright)

```bash
cd web-automation
mvn clean test -Dtest=SmokeTest
mvn clean test -Dtest=SanityTest
mvn clean test -Dtest=RegressionTest
```

## Mobile (Appium)

```bash
# Iniciar Appium Server
appium

# En otra terminal
cd mobile-automation
mvn clean test -Dtest=SmokeTest
mvn clean test -Dtest=SanityTest
```

## Performance (k6)

```bash
cd performance

# Smoke
k6 run scripts/smoke.js

# Load
k6 run scripts/load.js

# Stress
k6 run scripts/stress.js

# Spike
k6 run scripts/spike.js
```

### Con variables de entorno

```bash
K6_ANON_KEY=tu-anon-key K6_TEST_EMAIL=tu-email@example.com K6_TEST_PASSWORD=tu-password k6 run scripts/smoke.js
```

## Security (OWASP ZAP)

```bash
cd security/zap
chmod +x scripts/run-zap-scan.sh
./scripts/run-zap-scan.sh https://wlsxfjlaxxwgnbhmtgmw.supabase.co
```

## Docker

```bash
cd docker

# Ejecutar todo
docker compose --profile all up --build

# Solo API
docker compose --profile api up --build

# Solo Performance
docker compose --profile performance up --build

# Solo Security
docker compose --profile security up --build
```

## Reportes

### Karate

```bash
# Se generan en:
api-automation/target/karate-reports/karate-summary.html
```

### Allure

```bash
# Generar resultados
cd api-automation
mvn clean test

# Servir reporte
allure serve target/allure-results
```

### Playwright

```bash
cd web-automation
mvn clean test
# Reporte en: target/playwright-report/index.html
```
