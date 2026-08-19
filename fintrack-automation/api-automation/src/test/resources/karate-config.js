function fn() {
  var env = karate.env || 'qa';
  
  var envEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var envPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];

  var config = {
    env: env,
    baseUrl: java.lang.System.getenv('BASE_URL') || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co',
    supabaseAnonKey: java.lang.System.getenv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3hmamxheHh3Z25iaG10Z213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTk3NTEsImV4cCI6MjA5ODI3NTc1MX0.O6fe3bylzRtNmPYL1zXYo1mIhMBrG9vxvQgYP_Hw9DI',
    qaEmail: (envEmail && envEmail !== '') ? envEmail : 'pruebasQA@gmail.com',
    qaPassword: (envPassword && envPassword !== '') ? envPassword : 'TestPassword123'
  };

  karate.configure('headers', { 'apikey': config.supabaseAnonKey });

  // EJECUCIÓN ÚNICA GLOBAL: Llama al helper 1 sola vez para todas las pruebas
  var auth = karate.callSingle('classpath:common/helpers/create_user.feature', config);
  
  // Variables globales disponibles automáticamente en todos los .feature
  config.authToken = auth.accessToken;
  config.authHeader = auth.authHeader;

  return config;
}