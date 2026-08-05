@api @accounts
Feature: Crear cuenta bancaria

  Background:
    * url baseUrl
    * def accountSchema = read('classpath:common/schemas/account_schema.json')

  @smoke @positive
  Scenario: Crear cuenta con datos validos
    # 1. Registrar usuario dinámico y obtener token
    * def randomEmail = 'acc_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    # 2. Crear cuenta bancaria
    * url functionsUrl
    * def holderName = 'Usuario ' + java.util.UUID.randomUUID().toString().substring(0, 6)
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: '#(holderName)', initial_balance: 500.00 }
    When method POST
    Then status 201
And match response.account == { id: '#string', account_number: '#string', holder_name: '#(holderName)', balance: '#number', status: 'active', user_id: '#string', created_at: '#string' }
    And match response.account.holder_name == holderName
    And match response.account.balance == 500.00
    And match response.account.status == 'active'

  @regression @negative
  Scenario: Crear cuenta sin holder_name
    # 1. Registrar usuario dinámico y obtener token
    * def randomEmail = 'acc_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    # 2. Intentar crear cuenta con payload inválido
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