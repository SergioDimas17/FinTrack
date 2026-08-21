# FinTrack Automation Monorepo

[![FinTrack CI Pipeline](https://github.com/tu-usuario/fintrack-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/tu-usuario/fintrack-automation/actions/workflows/ci.yml)

Framework de automatización de pruebas para el proyecto **FinTrack** — un sistema bancario de micro-transferencias construido sobre Supabase.

## Descripción

Este monorepo centraliza la automatización de FinTrack en cinco áreas:

| Módulo | Tecnología | Cobertura |
|--------|-----------|-----------|
| API | Karate + JUnit5 + Maven | Auth, Accounts, Transfers, Users, Health |
| Web | Playwright Java + JUnit5 | Smoke, Sanity, Regression |
| Mobile | Appium Java + JUnit5 | Smoke, Sanity |
| Performance | k6 | Smoke, Load, Stress, Spike |
| Security | OWASP ZAP | Scan activo DAST, reportes HTML/MD |

## Tecnologías

- **Java 17** (API, Web, Mobile)
- **Karate DSL** (API testing)
- **Playwright Java** (Web testing)
- **Appium Java** (Mobile testing)
- **k6** (Performance testing)
- **OWASP ZAP** (Security scanning)
- **JUnit 5** (Test runners)
- **Maven** (Build management)
- **Docker / Docker Compose** (Containerization)
- **GitHub Actions** (CI/CD)

## Arquitectura

```text
fintrack-automation/
├── api-automation/       # Karate + JUnit5 + Maven
├── web-automation/       # Playwright Java + JUnit5
├── mobile-automation/    # Appium Java + JUnit5
├── performance/          # k6 scripts (performance/scripts/)
├── security/             # OWASP ZAP
├── docs/                 # Documentación del framework
├── .github/workflows/    # CI/CD pipeline (ci.yml)
├── docker/               # Dockerfile y docker-compose
└── README.md
Cada módulo es independiente y se ejecuta por separado. La configuración se maneja mediante variables de entorno o archivos .env que nunca se commitean.

Cómo instalar
Prerrequisitos
Java 17 (JDK)

Maven 3.9+

Node.js 20+ (para k6 y Playwright)

Docker 24+ y Docker Compose v2

Appium Server 2.x (para mobile)

Android SDK (para mobile)

Clonar
Bash
git clone [https://github.com/tu-usuario/fintrack-automation.git](https://github.com/tu-usuario/fintrack-automation.git)
cd fintrack-automation
Configurar ambiente
Copia el archivo de plantilla .env.example y configura tus variables locales:

Bash
cp docker/.env.example .env
Define tus variables de entorno locales:

Bash
export TEST_USER_EMAIL=your_email@example.com
export TEST_USER_PASSWORD=your_password_here
export SUPABASE_ANON_KEY=your_supabase_anon_key_here
export BASE_URL=[https://your-supabase-project.supabase.co](https://your-supabase-project.supabase.co)
Cómo ejecutar
API (Karate)
Bash
cd api-automation
mvn clean test -Dkarate.env=qa
Web (Playwright)
Bash
cd web-automation
mvn clean test -Denv=qa -Dheadless=true
Mobile (Appium)
Bash
cd mobile-automation
mvn clean test
Performance (k6)
Bash
cd performance/scripts
k6 run smoke.js
k6 run load.js
k6 run stress.js
k6 run spike.js
Security (OWASP ZAP)
Bash
docker run --rm -v $(pwd)/zap-reports:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t "[https://your-supabase-project.supabase.co](https://your-supabase-project.supabase.co)" -r report_html.html -J report_json.json -w report_md.md -I
Cómo generar reportes
Karate Report
Se genera automáticamente en api-automation/target/karate-reports/karate-summary.html tras cada ejecución.

OWASP ZAP Report
Se genera en la carpeta zap-reports/ con formatos HTML, Markdown y JSON.

JUnit XML
Los resultados XML se generan en target/surefire-reports/ de cada módulo Java.

CI/CD Pipeline
El flujo de trabajo principal se encuentra configurado en .github/workflows/ci.yml y ejecuta secuencialmente 4 etapas en cada push o pull_request a main, master o develop:

Web Tests: Ejecución de suites con Playwright Java.

API Tests: Validación de contratos y endpoints con Karate.

Performance Tests: Pruebas de carga ligera con k6.

Security Scan: Análisis dinámico de vulnerabilidades DAST con OWASP ZAP.

Licencia
Proyecto de portafolio — uso educativo.