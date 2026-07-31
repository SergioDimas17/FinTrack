@api @authentication
Feature: Autenticacion de usuarios

  Background:
    * url baseUrl
    * def loginPayload = read('classpath:common/payloads/login_payload.json')
    * def loginSchema = read('classpath:common/schemas/login_response_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')
    * def fixtures = read('classpath:common/fixtures/test_data.json')

  @smoke @positive
  Scenario: Login exitoso con credenciales validas
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    And match response == loginSchema
    And match response.token_type == 'bearer'
    And def accessToken = response.access_token
    * assert accessToken.length > 0

  @regression @negative
  Scenario: Login fallido con credenciales invalidas
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.invalidUser.email)', password: '#(fixtures.invalidUser.password)' }
    When method POST
    Then status 400
    And match response contains { error: '#notnull' }
