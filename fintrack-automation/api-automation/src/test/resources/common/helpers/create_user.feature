@ignore
Feature: Helper para creación de usuario dinámico y obtención de token

  Scenario: Crear usuario y retornar credenciales
    * url baseUrl
    * def randomEmail = 'user_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'
    * def maxReintentos = 5
    * def delayInicial = 2000
    * def intento = 0
    * def respuesta = null

    * karate.log('Intentando crear usuario: ' + randomEmail)
    
    * def crearUsuario =
    """
      function() {
        var intento = 0;
        var maxReintentos = 5;
        var delayActual = 2000;
        
        while (intento < maxReintentos) {
          try {
            karate.log('Intento ' + (intento + 1) + ' de ' + maxReintentos);
            
            var resultado = karate.http('POST', baseUrl + '/auth/v1/signup', 
              { email: randomEmail, password: randomPassword },
              { apikey: supabaseAnonKey, 'Content-Type': 'application/json' }
            );
            
            if (resultado.status === 200) {
              karate.log('✅ Usuario creado exitosamente');
              return resultado;
            } else if (resultado.status === 429) {
              karate.log('⚠️ Límite de tasa alcanzado. Esperando ' + delayActual + 'ms antes de reintentar...');
              java.lang.Thread.sleep(delayActual);
              delayActual = Math.min(delayActual * 2, 30000); // Máximo 30 segundos
              intento++;
            } else {
              karate.log('❌ Error: ' + resultado.status);
              return resultado;
            }
          } catch (e) {
            karate.log('Excepción en intento ' + (intento + 1) + ': ' + e);
            intento++;
            java.lang.Thread.sleep(delayActual);
            delayActual = Math.min(delayActual * 2, 30000);
          }
        }
        throw new Error('Se alcanzó máximo de reintentos para crear usuario');
      }
    """
    
    * def respuesta = call crearUsuario
    * match respuesta.status == 200
    
    * def accessToken = respuesta.response.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = randomEmail
    * def userPassword = randomPassword