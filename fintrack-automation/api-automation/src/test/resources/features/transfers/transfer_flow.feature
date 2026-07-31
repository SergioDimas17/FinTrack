@api @transfers
Feature: Transferencias entre cuentas

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def transferSchema = read('classpath:common/schemas/transfer_response_schema.json')
    * def errorSchema = read('classpath:common/schemas/error_schema.json')

  @smoke @positive
  Scenario: Transferencia exitosa entre cuentas propias
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
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 100, idempotency_key: 'karate-' + java.util.UUID.randomUUID().toString() }
    When method POST
    Then status 202
    And match response == transferSchema
    And match response.success == true
    And match response.transaction_id != null

  @regression @positive
  Scenario: Transferencia con idempotency key duplicado
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
    * def idemKey = 'idem-' + java.util.UUID.randomUUID().toString()

    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 50, idempotency_key: '#(idemKey)' }
    When method POST
    Then status 202

    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 50, idempotency_key: '#(idemKey)' }
    When method POST
    Then status 202
