@api @authentication
Feature: Autenticacion de usuarios

  Background:
    * url baseUrl
    * def loginSchema = read('classpath:common/schemas/login_response_schema.json')
    * def fixtures = read('classpath:common/fixtures/test_data.json')

  @smoke @positive
  Scenario: Login exitoso con credenciales validas
    # 1. Crear usuario dinámico para garantizar credenciales válidas
    * def randomEmail = 'login_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    * def randomPassword = 'TestPassword123'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: '#(randomPassword)' }
    When method POST
    Then status 200

    # 2. Probar el endpoint de login
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(randomEmail)', password: '#(randomPassword)' }
    When method POST
    Then status 200
And match response contains { access_token: '#string', token_type: 'bearer', expires_in: '#number', refresh_token: '#string', user: '#object' }    And match response.token_type == 'bearer'
    And def accessToken = response.access_token
    * assert accessToken.length > 0

  @regression @negative
  Scenario: Login fallido con credenciales invalidas
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.invalidUser.email)', password: '#(fixtures.invalidUser.password)' }
    When method POST
    Then status 400
And match response contains { msg: '#notnull' }