@ignore
Feature: Helper para creacion de usuario dinamico con mecanismo de reintentos

  Scenario: Crear usuario y retornar credenciales de autenticacion
    * url baseUrl
    * def randomEmail = 'user_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'

    # Función JS con bucle de reintentos y backoff exponencial para capturar HTTP 429
    * def intentarCrearUsuario =
    """
    function() {
      var maxReintentos = 5;
      var delayActual = 2000; // 2 segundos iniciales
      var ultimaRespuesta = null;

      for (var i = 0; i < maxReintentos; i++) {
        try {
          karate.log('🔄 Intento de registro ' + (i + 1) + ' de ' + maxReintentos + ' para: ' + randomEmail);

          // Llamada al helper HTTP sin aserciones estrictas
          var res = karate.call('classpath:common/helpers/signup-request.feature', {
            baseUrl: baseUrl,
            supabaseAnonKey: supabaseAnonKey,
            email: randomEmail,
            password: randomPassword
          });

          ultimaRespuesta = res;
          var statusCode = res.responseStatus || res.statusCode || res.status;

          karate.log('📡 Código de respuesta HTTP obtenido: ' + statusCode);

          if (statusCode === 200) {
            karate.log('✅ Usuario creado exitosamente en Supabase');
            return res;
          } else if (statusCode === 429) {
            karate.log('⚠️ Límite de tasa (Rate Limit 429) alcanzado. Esperando ' + delayActual + 'ms antes de reintentar...');
            java.lang.Thread.sleep(delayActual);
            delayActual = Math.min(delayActual * 2, 30000); // Multiplica el tiempo hasta un máximo de 30s
          } else {
            karate.log('⚠️ Respuesta inesperada con status HTTP: ' + statusCode);
            if (i < maxReintentos - 1) {
              java.lang.Thread.sleep(delayActual);
              delayActual = Math.min(delayActual * 2, 30000);
            }
          }
        } catch (e) {
          karate.log('❌ Excepción capturada en intento ' + (i + 1) + ': ' + e);
          if (i < maxReintentos - 1) {
            java.lang.Thread.sleep(delayActual);
            delayActual = Math.min(delayActual * 2, 30000);
          }
        }
      }

      throw '🚨 Se alcanzó el número máximo de reintentos (' + maxReintentos + ') para crear el usuario. Última respuesta: ' + JSON.stringify(ultimaRespuesta);
    }
    """

    # Ejecutar el bucle de reintentos
    * def resultado = call intentarCrearUsuario
    * match resultado.responseStatus == 200

    # Extraer variables necesarias para la suite global
    * def accessToken = resultado.response.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = randomEmail
    * def userPassword = randomPassword