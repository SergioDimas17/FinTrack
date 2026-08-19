@ignore
Feature: Helper de Autenticación de Usuario QA

  Background:
    * url baseUrl
    * def envEmail = java.lang.System.getenv('K6_TEST_EMAIL')
    * def envPassword = java.lang.System.getenv('K6_TEST_PASSWORD')
    * def qaEmail = envEmail ? envEmail : 'pruebasQA@gmail.com'
    * def qaPassword = envPassword ? envPassword : 'TestPassword123'

  Scenario: Obtener Token de Acceso
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And header apikey = supabaseAnonKey
    And header Content-Type = 'application/json'
    And request { email: '#(qaEmail)', password: '#(qaPassword)' }
    When method POST
    Then status 200

    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken
    * def userEmail = qaEmail
    * def userPassword = qaPassword