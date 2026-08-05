@api @transfers
Feature: Historial de transacciones

  Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Listar transacciones del usuario
    * def user = call read('classpath:common/helpers/create_user.feature')

    * url functionsUrl
    Given path 'banking-api/transactions'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { transactions: '#array' }
@regression @positive
Scenario: Listar transacciones con paginacion
  * def user = call read('classpath:common/helpers/create_user.feature')

  * url functionsUrl
  Given path 'banking-api/transactions'
  And param limit = 5
  And param offset = 0
  And header Authorization = user.authHeader
  When method GET
  Then status 200
  And match response contains { transactions: '#array' }

  @regression @positive
  Scenario: Listar transacciones filtradas por cuenta
    # 1. Crear usuario dinámico
    * def user = call read('classpath:common/helpers/create_user.feature')

    # 2. Crear cuenta para obtener un ID válido
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: 'Cuenta Transacciones', initial_balance: 100.00 }
    When method POST
    Then status 201
    * def firstAccountId = response.account.id

    # 3. Filtrar transacciones por el account_id
    Given path 'banking-api/transactions'
    And param account_id = firstAccountId
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { transactions: '#array' }