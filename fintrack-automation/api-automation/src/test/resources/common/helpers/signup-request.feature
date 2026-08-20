@ignore
Feature: Peticion HTTP directa de Registro de Usuario (Signup)

  Scenario: Ejecutar peticion POST a Supabase Auth
    Given url baseUrl + '/auth/v1/signup'
    And header apikey = supabaseAnonKey
    And header Content-Type = 'application/json'
    And request { email: email, password: password }
    When method post
    # 🟢 NOTA DE ARQUITECTURA:
    # No se incluye "Then status 200" en este archivo.
    # Si Supabase responde HTTP 429 (Rate Limit), no debemos lanzar una excepción de Karate,
    # sino permitir que el valor "responseStatus" regrese a create_user.feature para aplicar el backoff.