# FinTrack Automation Monorepo

Framework de automatización de pruebas para el proyecto **FinTrack** — un sistema bancario de micro-transferencias construido sobre Supabase.

## Descripción

Este monorepo centraliza la automatización de FinTrack en cinco áreas:

| Módulo | Tecnología | Cobertura |
|--------|-----------|-----------|
| API | Karate + JUnit5 + Maven | Auth, Accounts, Transfers, Users, Health |
| Web | Playwright Java + JUnit5 | Smoke, Sanity, Regression |
| Mobile | Appium Java + JUnit5 | Smoke, Sanity |
| Performance | k6 | Smoke, Load, Stress, Spike |
| Security | OWASP ZAP | Scan activo, reporte HTML |

## Tecnologías

- **Java 17** (API, Web, Mobile)
- **Karate DSL** (API testing)
- **Playwright Java** (Web testing)
- **Appium Java** (Mobile testing)
- **k6** (Performance testing)
- **OWASP ZAP** (Security scanning)
- **JUnit 5** (Test runners)
- **Maven** (Build management)
- **Allure** (Reporting)
- **Docker / Docker Compose** (Containerization)
- **GitHub Actions** (CI/CD)

## Arquitectura

```
fintrack-automation/
├── api-automation/      # Karate + JUnit5 + Maven
├── web-automation/       # Playwright Java + JUnit5
├── mobile-automation/    # Appium Java + JUnit5
├── performance/          # k6 scripts
├── security/             # OWASP ZAP
├── docs/                  # Documentación del framework
├── .github/workflows/     # CI/CD pipelines
├── docker/                # Dockerfile y docker-compose
└── README.md
```

Cada módulo es independiente y se ejecuta por separado. La configuración está centralizada por ambiente (`dev`, `qa`, `uat`, `prod`) y las credenciales nunca se escriben en el código.

## Cómo instalar

### Prerrequisitos

- Java 17 (JDK)
- Maven 3.9+
- Node.js 20+ (para k6 y Playwright)
- Docker 24+ y Docker Compose v2
- Appium Server 2.x (para mobile)
- Android SDK (para mobile)

### Clonar

```bash
git clone https://github.com/tu-usuario/fintrack-automation.git
cd fintrack-automation
```

### Configurar ambiente

Cada módulo incluye un archivo `environments/qa.yml` con las URLs y variables del ambiente QA. Para usar otro ambiente, copia el archivo y ajusta los valores:

```bash
cp api-automation/src/test/resources/environments/qa.yml api-automation/src/test/resources/environments/dev.yml
```

Las credenciales se inyectan vía variables de entorno o archivos `.env` que **no se commitean**:

```bash
export TEST_USER_EMAIL=pruebasQA@gmail.com
export TEST_USER_PASSWORD=tu-password
export SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Cómo ejecutar

### API (Karate)

```bash
cd api-automation
mvn clean test -Dtest=SmokeRunner
mvn clean test -Dtest=RegressionRunner
mvn clean test -Dtest=SanityRunner
mvn clean test -Dtest=FullRunner
```

### Web (Playwright)

```bash
cd web-automation
mvn clean test -Dtest=SmokeTest
mvn clean test -Dtest=RegressionTest
```

### Mobile (Appium)

```bash
cd mobile-automation
mvn clean test -Dtest=SmokeTest
```

### Performance (k6)

```bash
cd performance
k6 run scripts/smoke.js
k6 run scripts/load.js
k6 run scripts/stress.js
k6 run scripts/spike.js
```

### Security (OWASP ZAP)

```bash
cd security/zap
./run-zap-scan.sh
```

## Cómo generar reportes

### Karate Report

Se genera automáticamente en `api-automation/target/karate-reports/` tras cada ejecución.

### Playwright Report

```bash
cd web-automation
mvn clean test
# Reporte HTML en target/playwright-report/
```

### Allure

```bash
# Generar resultados Allure (API)
cd api-automation
mvn clean test
allure serve target/allure-results

# Generar resultados Allure (Web)
cd web-automation
mvn clean test
allure serve target/allure-results
```

### JUnit XML

Los resultados XML se generan en `target/surefire-reports/` de cada módulo.

## Cómo correr CI

Los workflows de GitHub Actions se ejecutan automáticamente en cada push:

- **API Smoke** — `api-smoke.yml`
- **Web Smoke** — `web-smoke.yml`
- **Mobile Smoke** — `mobile-smoke.yml`
- **Performance** — `performance.yml`
- **Security** — `security.yml`

Para ejecutar manualmente: ve a la pestaña **Actions** en GitHub, selecciona el workflow y haz clic en **Run workflow**.

## Cómo usar Docker

### Ejecutar todo el proyecto

```bash
cd docker
docker-compose up --build
```

### Ejecutar solo API

```bash
cd docker
docker-compose up api-automation
```

### Ejecutar solo Performance

```bash
cd docker
docker-compose up performance
```

### Ejecutar solo Security

```bash
cd docker
docker-compose up security
```

## Buenas prácticas

- **Configuración centralizada**: URLs, tokens y credenciales viven en archivos de ambiente, no en el código.
- **Payloads separados**: los cuerpos de petición viven en `payloads/`, nunca dentro de los Features.
- **Fixtures separados**: los datos de prueba viven en `fixtures/`, no quemados en escenarios.
- **Schemas separados**: las validaciones JSON Schema viven en `schemas/`.
- **Tags en todos los escenarios**: `@api @smoke @positive` etc.
- **Runners separados**: Smoke, Sanity, Regression, Full.
- **Nombres camelCase** en variables, **snake_case** en Features, **PascalCase** en clases Java.
- **Logs claros** sin información sensible.
- **Evidencias**: screenshots (Web/Mobile), logs de request/response (API).
- **Sin código muerto** ni duplicidad.

## Configuración

### Ambientes

| Ambiente | Archivo | Uso |
|----------|---------|-----|
| dev | `environments/dev.yml` | Desarrollo local |
| qa | `environments/qa.yml` | Pruebas QA |
| uat | `environments/uat.yml` | Pre-producción |
| prod | `environments/prod.yml` | Producción |

### Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `TEST_USER_EMAIL` | Email del usuario de pruebas |
| `TEST_USER_PASSWORD` | Password del usuario de pruebas |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `BASE_URL` | URL base de Supabase (opcional, default: QA) |

## Licencia

Proyecto de portafolio — uso educativo.
