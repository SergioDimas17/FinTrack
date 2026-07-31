@api @transfers
Feature: Transferencias - escenarios negativos

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @regression @negative
  Scenario: Transferencia sin token de autenticacion
    * url functionsUrl
    Given path 'transfer'
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: 100 }
    When method POST
    Then status 401

  @regression @negative
  Scenario: Transferencia con monto negativo
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: -100 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con monto cero
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: 0 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con campos faltantes
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000' }
    When method POST
    Then status 400

  @regression @negative
  Scenario: Transferencia a misma cuenta
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

    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(firstAccountId)', destination_account_id: '#(firstAccountId)', amount: 50 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con fondos insuficientes
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
    * def accounts = response.accounts
    * assert accounts.length >= 2
    * def sourceId = accounts[0].id
    * def destId = accounts[1].id

    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 999999999 }
    When method POST
    Then status 422
