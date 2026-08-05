@api @transfers
Feature: Transferencias - escenarios negativos

Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @regression @negative
  Scenario: Transferencia sin token de autenticacion
    * url functionsUrl
    Given path 'transfer'
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: 100 }
    When method POST
    Then status 401

  @regression @negative
  Scenario: Transferencia con monto negativo
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'transfer'
    And header Authorization = user.authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: -100 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con monto cero
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'transfer'
    And header Authorization = user.authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000', destination_account_id: '00000000-0000-0000-0000-000000000001', amount: 0 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con campos faltantes
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'transfer'
    And header Authorization = user.authHeader
    And request { source_account_id: '00000000-0000-0000-0000-000000000000' }
    When method POST
    Then status 400

  @regression @negative
  Scenario: Transferencia a misma cuenta
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: 'Cuenta Unica', initial_balance: 500.00 }
    When method POST
    Then status 201
    * def firstAccountId = response.account.id

    Given path 'transfer'
    And header Authorization = user.authHeader
    And request { source_account_id: '#(firstAccountId)', destination_account_id: '#(firstAccountId)', amount: 50 }
    When method POST
    Then status 422

  @regression @negative
  Scenario: Transferencia con fondos insuficientes
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: 'Origen', initial_balance: 100.00 }
    When method POST
    Then status 201
    * def sourceId = response.account.id

    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: 'Destino', initial_balance: 100.00 }
    When method POST
    Then status 201
    * def destId = response.account.id

    Given path 'transfer'
    And header Authorization = user.authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 999999999 }
    When method POST
    Then status 422