function fn() {
  const env = karate.env || 'qa';
  const props = read('classpath:environments/' + env + '.properties');
  const config = {};
  for (const line of props.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    let value = trimmed.substring(idx + 1).trim();
    if (value.startsWith('${') && value.endsWith('}')) {
      const envKey = value.substring(2, value.length - 1);
      value = java.lang.System.getenv(envKey) || value;
    }
    config[key] = value;
  }

  config.baseUrl = config.baseUrl || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co';
  config.functionsUrl = config.functionsUrl || (config.baseUrl + '/functions/v1');
  config.authUrl = config.baseUrl + '/auth/v1/token?grant_type=password';
  config.signupUrl = config.baseUrl + '/auth/v1/signup';

  karate.configure('headers', { 'apikey': config.supabaseAnonKey });

  karate.log('Ambiente activo:', env);
  karate.log('Base URL:', config.baseUrl);
  karate.log('Functions URL:', config.functionsUrl);

  return config;
}
