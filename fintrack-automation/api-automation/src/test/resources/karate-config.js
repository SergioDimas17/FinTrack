function fn() {
  var env = karate.env || 'qa';

  // 1. Obtener variables seguras inyectadas por GitHub Actions o tu SO local
  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];
  var rawAnonKey = java.lang.System.getenv('SUPABASE_ANON_KEY') || karate.properties['SUPABASE_ANON_KEY'];
  var rawBaseUrl = java.lang.System.getenv('BASE_URL') || karate.properties['BASE_URL'];

  // Limpiar la URL base de comillas accidentales
  var cleanBaseUrl = rawBaseUrl ? String(rawBaseUrl).replace(/['"]/g, '').trim() : '';

  var config = {
    env: env,
    baseUrl: cleanBaseUrl,
    // 👇 SOLUCIÓN: Restauramos functionsUrl dinámicamente usando la URL limpia
    functionsUrl: cleanBaseUrl ? cleanBaseUrl + '/functions/v1' : '',
    supabaseAnonKey: rawAnonKey ? String(rawAnonKey).replace(/['"]/g, '').trim() : '',
    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : '',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : ''
  };

  // 2. Configurar cabeceras de autenticación si la clave existe
  if (config.supabaseAnonKey) {
    karate.configure('headers', { 'apikey': config.supabaseAnonKey });
  }

  return config;
}