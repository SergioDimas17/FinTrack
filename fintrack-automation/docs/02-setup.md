# Setup

## Prerrequisitos

### Generales
- Java 17 (JDK)
- Maven 3.9+
- Git
- Docker 24+ y Docker Compose v2

### API (Karate)
- Java 17 y Maven (incluidos en prerrequisitos generales)

### Web (Playwright)
- Java 17 y Maven
- Playwright se instala automáticamente con `mvn exec:java@playwright-install`

### Mobile (Appium)
- Node.js 20+
- Appium Server 2.x: `npm install -g appium`
- Appium UiAutomator2 driver: `appium driver install uiautomator2`
- Android SDK con API 33+
- Emulador Android o dispositivo físico conectado

### Performance (k6)
- k6 instalado: https://k6.io/docs/getting-started/installation/

### Security (OWASP ZAP)
- Docker (para usar imagen owasp/zap2docker-stable)
- O ZAP instalado localmente

## Instalación

```bash
git clone https://github.com/tu-usuario/fintrack-automation.git
cd fintrack-automation
```

## Configuración de Ambiente

### Variables de entorno

Crea un archivo `.env` en la raíz (no se commitea):

```bash
TEST_USER_EMAIL=your_email@example.com
TEST_USER_PASSWORD=your_password_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### GitHub Secrets (para CI/CD)

En GitHub → Settings → Secrets and variables → Actions, agrega:

| Secret | Valor |
|--------|-------|
| `TEST_USER_EMAIL` | Email del usuario de pruebas |
| `TEST_USER_PASSWORD` | Password del usuario de pruebas |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |

## Verificación

```bash
# Verificar Java
java -version

# Verificar Maven
mvn -version

# Verificar Docker
docker --version
docker compose version
```
