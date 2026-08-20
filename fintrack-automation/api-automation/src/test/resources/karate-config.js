function fn() {
  var env = karate.env || 'qa';
  
  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];

  var rawBaseUrl = java.lang.System.getenv('BASE_URL');
  
  if (!rawBaseUrl || rawBaseUrl.includes('***')) {
    karate.log('🚨 ALERTA: BASE_URL está censurada o vacía. Revisa tus Secrets en GitHub Actions.');
  }
  
  var config = {
    env: env,
    baseUrl: String(java.lang.System.getenv('BASE_URL') || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co').replace(/['"]/g, '').trim(),
    supabaseAnonKey: String(java.lang.System.getenv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...').replace(/['"]/g, '').trim(),
    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : 'pruebasQA@gmail.com',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : 'TestPassword123'
  };
  
  karate.configure('headers', { 'apikey': config.supabaseAnonKey });
  
  // ⏱️ Agregar delay para evitar rate limiting
  karate.log('Esperando antes de crear usuario para evitar límite de tasa...');
  java.lang.Thread.sleep(2000); // 2 segundos de espera
  
  // Ejecución única global con reintentos
  var auth = karate.callSingle('classpath:common/helpers/create_user.feature', config);
  
  config.authToken = auth.accessToken;
  config.authHeader = auth.authHeader;
  
  return config;
}