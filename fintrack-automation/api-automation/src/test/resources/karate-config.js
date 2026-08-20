function fn() {
  var env = karate.env || 'qa';

  // 1. Obtener variables de entorno
  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];
  var rawBaseUrl = java.lang.System.getenv('BASE_URL');

  // Validar que la URL sea válida y no esté censurada (***)
  if (!rawBaseUrl || rawBaseUrl.includes('***')) {
    karate.log('🚨 ALERTA: BASE_URL está censurada o vacía. Revisa tus Secrets en GitHub Actions.');
  }

  // 2. Definición explícita de objetos de contexto
  var application = {
    name: 'FinTrack',
    version: '1.0'
  };

  // 3. Objeto de configuración principal
  var config = {
    env: env,
    baseUrl: String(rawBaseUrl || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co').replace(/['"]/g, '').trim(),
    supabaseAnonKey: String(java.lang.System.getenv('SUPABASE_ANON_KEY') || '***').replace(/['"]/g, '').trim(),
    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : 'pruebasQA@gmail.com',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : 'TestPassword123',
    application: application
  };

  // 4. Configuración de headers globales
  karate.configure('headers', { 'apikey': config.supabaseAnonKey });

  // 5. Delay preventivo para evitar Rate Limiting (429) en Supabase
  karate.log('Esperando antes de crear usuario para evitar límite de tasa...');
  java.lang.Thread.sleep(2000);

  // 6. Ejecución única del helper de autenticación
  var auth = karate.callSingle('classpath:common/helpers/create_user.feature', config);

  config.authToken = auth.accessToken;
  config.authHeader = auth.authHeader;

  return config;
}