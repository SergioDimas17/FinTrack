@api @accounts
Feature: Obtener cuenta por ID

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def accountSchema = read('classpath:common/schemas/account_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @sanity @positive
  Scenario: Obtener cuenta propia por ID
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
    * def firstAccount = response.accounts[0]
    * def accountId = firstAccount.id

    Given path 'banking-api/accounts', accountId
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response.account == accountSchema
    And match response.account.id == accountId

  @regression @negative
  Scenario: Obtener cuenta inexistente por ID
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    * def fakeId = java.util.UUID.randomUUID().toString()
    Given path 'banking-api/accounts', fakeId
    And header Authorization = authHeader
    When method GET
    Then status 404
