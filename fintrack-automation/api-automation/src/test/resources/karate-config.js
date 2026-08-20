function fn() {
  var env = karate.env || 'qa';
  
  // 1. Obtener variables crudas
  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];

  // Dentro de tu function fn() en karate-config.js
var rawBaseUrl = java.lang.System.getenv('BASE_URL');

if (!rawBaseUrl || rawBaseUrl.includes('***')) {
    karate.log('🚨 ALERTA: BASE_URL está censurada o vacía. Revisa tus Secrets en GitHub Actions.');
}

  // 2. Limpiar comillas accidentales y espacios en blanco de TODAS las variables
  var config = {
    env: env,
    baseUrl: String(java.lang.System.getenv('BASE_URL') || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co').replace(/['"]/g, '').trim(),
    supabaseAnonKey: String(java.lang.System.getenv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3hmamxheHh3Z25iaG10Z213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTk3NTEsImV4cCI6MjA5ODI3NTc1MX0.O6fe3bylzRtNmPYL1zXYo1mIhMBrG9vxvQgYP_Hw9DI').replace(/['"]/g, '').trim(),
    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : 'pruebasQA@gmail.com',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : 'TestPassword123'
  };

  karate.configure('headers', { 'apikey': config.supabaseAnonKey });

  // 3. EJECUCIÓN ÚNICA GLOBAL
  var auth = karate.callSingle('classpath:common/helpers/create_user.feature', config);
  
  // 4. Variables globales disponibles automáticamente en todos los .feature
  config.authToken = auth.accessToken;
  config.authHeader = auth.authHeader;

  return config;
}