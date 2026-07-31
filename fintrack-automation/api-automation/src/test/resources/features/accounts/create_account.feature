@api @accounts
Feature: Crear cuenta bancaria

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def accountSchema = read('classpath:common/schemas/account_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @smoke @positive
  Scenario: Crear cuenta con datos validos
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    * def holderName = 'Usuario ' + java.util.UUID.randomUUID().toString().substring(0, 6)
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: '#(holderName)', initial_balance: 500.00 }
    When method POST
    Then status 201
    And match response.account == accountSchema
    And match response.account.holder_name == holderName
    And match response.account.balance == 500.00
    And match response.account.status == 'active'

  @regression @negative
  Scenario: Crear cuenta sin holder_name
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
    And request { initial_balance: 1000 }
    When method POST
    Then status 400
    And match response contains { error: '#notnull' }

  @regression @negative
  Scenario: Crear cuenta sin autenticacion
    * url functionsUrl
    Given path 'banking-api/accounts'
    And request { holder_name: 'Test User', initial_balance: 100 }
    When method POST
    Then status 401
