function fn() {
  var env = karate.env || 'qa';

  var rawEnvEmail = java.lang.System.getenv('K6_TEST_EMAIL') || karate.properties['K6_TEST_EMAIL'];
  var rawEnvPassword = java.lang.System.getenv('K6_TEST_PASSWORD') || karate.properties['K6_TEST_PASSWORD'];
  var rawAnonKey = java.lang.System.getenv('SUPABASE_ANON_KEY') || karate.properties['SUPABASE_ANON_KEY'];
  var rawBaseUrl = java.lang.System.getenv('BASE_URL') || karate.properties['BASE_URL'];

  var config = {
    env: env,
    baseUrl: rawBaseUrl ? String(rawBaseUrl).replace(/['"]/g, '').trim() : '',
    supabaseAnonKey: rawAnonKey ? String(rawAnonKey).replace(/['"]/g, '').trim() : '',
    qaEmail: rawEnvEmail ? String(rawEnvEmail).replace(/['"]/g, '').trim() : '',
    qaPassword: rawEnvPassword ? String(rawEnvPassword).replace(/['"]/g, '').trim() : ''
  };

  if (config.supabaseAnonKey) {
    karate.configure('headers', { 'apikey': config.supabaseAnonKey });
  }

  return config;
}