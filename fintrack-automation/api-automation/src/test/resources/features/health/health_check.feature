@api @health
Feature: Health check de Edge Functions

  Background:
    * url functionsUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def loginPayload = read('classpath:common/payloads/login_payload.json')

  @smoke @positive
  Scenario: Edge Function banking-api responde
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response contains { accounts: '#array' }

  @smoke @positive
  Scenario: Edge Function transfer responde a metodo no permitido
    * url functionsUrl
    Given path 'transfer'
    When method GET
    Then status 405
