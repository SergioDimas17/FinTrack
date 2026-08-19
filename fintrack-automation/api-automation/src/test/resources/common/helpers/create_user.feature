@ignore
Feature: Helper para creación de usuario dinámico y obtención de token

  Scenario: Crear usuario y retornar credenciales
    * url baseUrl
    * def randomEmail = 'user_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'

    Given path '/auth/v1/signup'
    # Agregamos explícitamente la cabecera apikey requerida por Supabase
    And header apikey = supabaseAnonKey
    And header Content-Type = 'application/json'
    And request { email: '#(randomEmail)', password: '#(randomPassword)' }
    When method POST
    Then status 200

    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = randomEmail
    * def userPassword = randomPassword