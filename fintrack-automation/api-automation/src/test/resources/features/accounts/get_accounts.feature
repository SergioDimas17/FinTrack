@api @accounts
Feature: Obtener cuentas del usuario

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def accountsSchema = read('classpath:common/schemas/accounts_list_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @smoke @positive
  Scenario: Listar cuentas del usuario autenticado
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
    And match response == accountsSchema

  @regression @negative
  Scenario: Listar cuentas sin token de autenticacion
    * url functionsUrl
    Given path 'banking-api/accounts'
    When method GET
    Then status 401
    And match response contains { error: '#notnull' }
