@ignore
Feature: Helper para creacion de usuario dinamico con mecanismo de reintentos

  Scenario: Crear usuario y retornar credenciales de autenticacion
    * url baseUrl
    * def randomEmail = 'user_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'

    * def intentarCrearUsuario =
    """
    function() {
      var maxReintentos = 10;        // Aumentado a 10 intentos
      var delayActual = 5000;         // Delay inicial de 5 segundos
      var ultimaRespuesta = null;

      for (var i = 0; i < maxReintentos; i++) {
        try {
          karate.log('🔄 Intento de registro ' + (i + 1) + ' de ' + maxReintentos + ' para: ' + randomEmail);

          var res = karate.call('classpath:common/helpers/signup-request.feature', {
            baseUrl: baseUrl,
            supabaseAnonKey: supabaseAnonKey,
            email: randomEmail,
            password: randomPassword
          });

          ultimaRespuesta = res;
          var statusCode = res.responseStatus || res.statusCode || res.status;

          karate.log('📡 Código de respuesta HTTP: ' + statusCode);
          karate.log('📡 Respuesta: ' + JSON.stringify(res));

          if (statusCode === 200) {
            karate.log('✅ Usuario creado exitosamente');
            return res;
          } else if (statusCode === 429) {
            karate.log('⚠️ Rate limit 429. Esperando ' + delayActual + 'ms antes de reintentar...');
            java.lang.Thread.sleep(delayActual);
            delayActual = Math.min(delayActual * 2, 60000); // Máximo 60 segundos
          } else {
            karate.log('⚠️ Status inesperado: ' + statusCode);
            if (i < maxReintentos - 1) {
              java.lang.Thread.sleep(delayActual);
              delayActual = Math.min(delayActual * 2, 60000);
            }
          }
        } catch (e) {
          karate.log('❌ Excepción en intento ' + (i + 1) + ': ' + (e.message || e));
          if (i < maxReintentos - 1) {
            java.lang.Thread.sleep(delayActual);
            delayActual = Math.min(delayActual * 2, 60000);
          }
        }
      }

      throw '🚨 Se alcanzó el máximo de reintentos (' + maxReintentos + '). Última respuesta: ' + JSON.stringify(ultimaRespuesta);
    }
    """

    * def resultado = call intentarCrearUsuario
    * match resultado.responseStatus == 200

    * def accessToken = resultado.response.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = randomEmail
    * def userPassword = randomPassword