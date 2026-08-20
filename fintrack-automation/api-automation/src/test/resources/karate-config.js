function fn() {
  var env = karate.env || 'qa';

  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];
  var rawBaseUrl = java.lang.System.getenv('BASE_URL');

  if (!rawBaseUrl || rawBaseUrl.includes('***')) {
    karate.log('🚨 ALERTA: BASE_URL está censurada o vacía. Revisa tus Secrets en GitHub Actions.');
  }

  var application = {
    name: 'FinTrack',
    version: '1.0'
  };

 var config = {
    env: env,
    baseUrl: String(rawBaseUrl || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co').replace(/['"]/g, '').trim(),
    // 🟢 AGREGAR ESTA LÍNEA PARA LAS EDGE FUNCTIONS:
    functionsUrl: String(rawBaseUrl || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co').replace(/['"]/g, '').trim() + '/functions/v1',
supabaseAnonKey: String(java.lang.System.getenv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3hmamxheHh3Z25iaG10Z213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTk3NTEsImV4cCI6MjA5ODI3NTc1MX0.O6fe3bylzRtNmPYL1zXYo1mIhMBrG9vxvQgYP_Hw9DI').replace(/['"]/g, '').trim(),    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : 'pruebasQA@gmail.com',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : 'TestPassword123',
    application: application
  };

  karate.configure('headers', { 'apikey': config.supabaseAnonKey });

  // Pausa de cortesía para evitar ráfagas iniciales
  java.lang.Thread.sleep(2000);

  var auth = karate.callSingle('classpath:common/helpers/create_user.feature', config);

  config.authToken = auth.accessToken;
  config.authHeader = auth.authHeader;

  return config;
}