@ignore
Feature: Helper de Autenticación Unica

  Scenario: Obtener Token
    Given url baseUrl
    And path '/auth/v1/token'
    And param grant_type = 'password'
    And header apikey = supabaseAnonKey
    And header Content-Type = 'application/json'
    And request { email: '#(qaEmail)', password: '#(qaPassword)' }
    When method POST
    Then status 200

    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken