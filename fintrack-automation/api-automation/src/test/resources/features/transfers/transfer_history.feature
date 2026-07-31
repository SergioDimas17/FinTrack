@api @transfers
Feature: Historial de transacciones

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def transactionsSchema = read('classpath:common/schemas/transactions_list_schema.json')

  @sanity @positive
  Scenario: Listar transacciones del usuario
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/transactions'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == transactionsSchema

  @regression @positive
  Scenario: Listar transacciones con paginacion
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/transactions'
    And param limit = 5
    And param offset = 0
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response.limit == 5
    And match response.offset == 0

  @regression @positive
  Scenario: Listar transacciones filtradas por cuenta
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
    * def firstAccountId = response.accounts[0].id

    Given path 'banking-api/transactions'
    And param account_id = firstAccountId
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == transactionsSchema
