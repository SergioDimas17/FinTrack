Markdown
# 🏦 FinTrack Automation Monorepo

<div align="center">

[![FinTrack CI Pipeline](https://img.shields.io/github/actions/workflow/status/SergioDimas17/FinTrack/ci.yml?branch=main&label=CI%20Pipeline&logo=githubactions&logoColor=white&style=for-the-badge)](https://github.com/SergioDimas17/FinTrack/actions/workflows/ci.yml)
[![Java Version](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Framework](https://img.shields.io/badge/Playwright-Java-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/java/)
[![API Framework](https://img.shields.io/badge/Karate-DSL-00599C?style=for-the-badge&logo=maven&logoColor=white)](https://github.com/karatelabs/karate)
[![Security](https://img.shields.io/badge/OWASP_ZAP-DAST-0080FF?style=for-the-badge&logo=owasp&logoColor=white)](https://www.zaproxy.org/)

**Framework empresarial de automatización de pruebas de cobertura 360°** para el ecosistema bancario de micro-transferencias **FinTrack** (Backend en Supabase).

[Explorar Módulos](#-matriz-de-módulos) • [Instalación](#-instalación-y-configuración) • [Ejecución](#-guía-de-ejecución) • [Pipeline CI/CD](#-pipeline-cicd-unificado)

</div>

---

### 📊 Matriz de Módulos

| Módulo | Tecnología Principal | Patrón / Enfoque | Cobertura | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **API Automation** | Karate DSL + Java 17 | Contract & Integration Testing | Auth, Accounts, Transfers, Users, Health | 🟢 100% |
| **Web Automation** | Playwright + Java 17 | Page Object Model (POM) | Smoke, Sanity, Regression | 🟢 100% |
| **Mobile Automation** | Appium + JUnit 5 | Responsive / Android Hybrid | Smoke, Sanity | 🟢 100% |
| **Performance** | Grafana k6 | Smoke, Load, Stress & Spike | API Endpoints | 🟢 100% |
| **Security (DAST)** | OWASP ZAP (Docker) | Baseline Scan / Vulnerability DAST | Edge Functions & API | 🟢 100% |

---

### 📐 Estructura del Monorepo

```text
fintrack-automation/
├── 🌐 web-automation/        # Pruebas UI E2E (Playwright + POM)
├── 🔌 api-automation/        # Pruebas de API (Karate DSL)
├── 📱 mobile-automation/     # Pruebas Móviles (Appium + JUnit 5)
├── ⚡ performance/           # Scripts de Carga y Estrés (Grafana k6)
├── 🔒 security/              # Políticas y escaneo DAST (OWASP ZAP)
├── 🐳 docker/                # Entornos de ejecución contenerizados
├── 📚 docs/                  # Documentación técnica del framework
└── ⚙️ .github/workflows/     # Pipeline de CI/CD (GitHub Actions)
⚙️ Instalación y Configuración
1. Prerrequisitos:

Java SDK: 17 o superior

Maven: 3.9.x

Node.js / k6: v20+ / v0.45+

Docker Desktop: 24+

2. Variables de Entorno:
Copia la plantilla neutra .env.example para configurar tus credenciales locales sin riesgo de exponer datos sensibles:

Bash
cp docker/.env.example .env
Fragmento de código
BASE_URL=[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
K6_TEST_EMAIL=usuario_qa@fintrack.dev
K6_TEST_PASSWORD=tu_password_segura
🚀 Guía de Ejecución Local
🔌 1. Pruebas de API (Karate)
Bash
cd fintrack-automation/api-automation
mvn clean test -Dkarate.env=qa
🌐 2. Pruebas Web (Playwright)
Bash
cd fintrack-automation/web-automation
mvn clean test -Denv=qa -Dheadless=true -Dtest=SmokeTest
📱 3. Pruebas Móviles (Appium)
Bash
cd fintrack-automation/mobile-automation
mvn clean test -Dtest=SmokeTest
⚡ 4. Pruebas de Rendimiento (k6)
Bash
cd fintrack-automation/performance/scripts
k6 run smoke.js
🔒 5. Escaneo de Seguridad (OWASP ZAP)
Bash
docker run --rm -v $(pwd)/zap-reports:/zap/wrk/:rw \
  -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t "[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)" \
  -r report_html.html -J report_json.json -I
🔄 Pipeline CI/CD Unificado
El repositorio utiliza GitHub Actions (.github/workflows/ci.yml) para orquestar de manera secuencial las 4 etapas de prueba ante cada push o pull_request:

Fragmento de código
graph TD
    A[Push / Pull Request] --> B[1. Web Smoke Suite - Playwright]
    B --> C[2. API Regression - Karate]
    C --> D[3. Performance - k6]
    D --> E[4. Security DAST Scan - OWASP ZAP]
    E --> F[Artifacts Upload & Report Generation]
📊 Reportes y Evidencias
Tras cada ejecución local o en GitHub Actions, los reportes quedan estructurados en las siguientes rutas:

Karate API HTML Report: api-automation/target/karate-reports/karate-summary.html

OWASP ZAP Security Audit: zap-reports/report_html.html

Surefire Test Reports: **/target/surefire-reports/

🛡️ Buenas Prácticas de Seguridad (Git Hygiene)
Gestión de Secretos: Las claves y tokens son inyectados exclusivamente mediante GitHub Secrets en la tubería de CI/CD.

Exclusión de Artefactos: Los archivos de entorno (.env), carpetas de compilación (target/) y reportes locales (zap-reports/) se encuentran estrictamente excluidos en .gitignore.