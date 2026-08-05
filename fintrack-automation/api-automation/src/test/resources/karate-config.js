function fn() {
  var env = karate.env || 'qa';
  
  var config = {
    baseUrl: 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3hmamxheHh3Z25iaG10Z213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTk3NTEsImV4cCI6MjA5ODI3NTc1MX0.O6fe3bylzRtNmPYL1zXYo1mIhMBrG9vxvQgYP_Hw9DI'
  };

  try {
    var yamlConfig = karate.read('classpath:environments/' + env + '.yml');
    if (yamlConfig && yamlConfig.baseUrl) {
      config.baseUrl = yamlConfig.baseUrl;
    }
    if (yamlConfig && yamlConfig.supabaseAnonKey && !yamlConfig.supabaseAnonKey.includes('${')) {
      config.supabaseAnonKey = yamlConfig.supabaseAnonKey;
    }
  } catch (e) {
    karate.log('Usando configuración por defecto.');
  }

  config.functionsUrl = config.baseUrl + '/functions/v1';

  // Cabeceras globales (Únicamente apikey y Content-Type)
  karate.configure('headers', {
    'apikey': config.supabaseAnonKey,
    'Content-Type': 'application/json'
  });

  karate.log('Ambiente activo:', env);
  karate.log('Base URL final:', config.baseUrl);

  return config;
}