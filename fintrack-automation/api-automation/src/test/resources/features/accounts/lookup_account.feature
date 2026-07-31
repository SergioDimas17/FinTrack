@api @accounts
Feature: Buscar cuenta por numero

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def lookupSchema = read('classpath:common/schemas/lookup_response_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @sanity @positive
  Scenario: Buscar cuenta existente por numero
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
    * def accountNumber = firstAccount.account_number

    Given path 'banking-api/lookup'
    And param account_number = accountNumber
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == lookupSchema
    And match response.account.account_number == accountNumber

  @regression @negative
  Scenario: Buscar cuenta inexistente
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/lookup'
    And param account_number = 'FT-9999999'
    And header Authorization = authHeader
    When method GET
    Then status 404
    And match response contains { error: '#notnull' }

  @regression @negative
  Scenario: Buscar cuenta sin parametro account_number
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/lookup'
    And header Authorization = authHeader
    When method GET
    Then status 400
