@ignore
Feature: Helper para creación de usuario dinámico y obtención de token

  Scenario: Crear usuario y retornar credenciales
    * def randomEmail = 'user_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'
    * url baseUrl
    
    # Configurar headers por defecto
    * header apikey = supabaseAnonKey
    * header Content-Type = application/json
    
    # Intentar crear usuario con reintentos
    * def intentoCrearUsuario =
    """
      function() {
        var maxReintentos = 5;
        var delayActual = 2000;
        
        for (var i = 0; i < maxReintentos; i++) {
          try {
            karate.log('Intento ' + (i + 1) + ' de ' + maxReintentos);
            
            var resultado = karate.call('classpath:common/helpers/signup-request.feature', 
              { email: randomEmail, password: randomPassword, baseUrl: baseUrl });
            
            if (resultado.status === 200 || resultado.statusCode === 200) {
              karate.log('✅ Usuario creado exitosamente');
              return resultado;
            } else if (resultado.status === 429 || resultado.statusCode === 429) {
              karate.log('⚠️ Límite de tasa. Esperando ' + delayActual + 'ms...');
              java.lang.Thread.sleep(delayActual);
              delayActual = Math.min(delayActual * 2, 30000);
            } else {
              karate.log('Error: ' + (resultado.status || resultado.statusCode));
              if (i < maxReintentos - 1) {
                java.lang.Thread.sleep(delayActual);
                delayActual = Math.min(delayActual * 2, 30000);
              }
            }
          } catch (e) {
            karate.log('Excepción: ' + e.message);
            if (i < maxReintentos - 1) {
              java.lang.Thread.sleep(delayActual);
              delayActual = Math.min(delayActual * 2, 30000);
            }
          }
        }
        throw new Error('Máximo de reintentos alcanzado');
      }
    """
    
    * def respuesta = call intentoCrearUsuario
    * match respuesta.statusCode == 200
    
    * def accessToken = respuesta.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = randomEmail
    * def userPassword = randomPassword