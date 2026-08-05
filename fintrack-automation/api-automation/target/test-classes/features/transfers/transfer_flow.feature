@api @transfers
Feature: Transferencias entre cuentas

  Background:
    * url baseUrl

  @smoke @positive
  Scenario: Transferencia exitosa entre cuentas propias
    # 1. Registrar usuario dinámico y obtener token
    * def randomEmail = 'transfer_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    # 2. Crear Cuenta de Origen
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: 'Cuenta Origen', initial_balance: 1000.00 }
    When method POST
    Then status 201
    * def sourceId = response.account.id

    # 3. Crear Cuenta de Destino
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: 'Cuenta Destino', initial_balance: 100.00 }
    When method POST
    Then status 201
    * def destId = response.account.id

    # 4. Realizar Transferencia
    * def randomIdemKey = 'karate-' + java.util.UUID.randomUUID().toString()
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 100, idempotency_key: '#(randomIdemKey)' }
    When method POST
    Then status 202
    And match response contains { success: true, transaction_id: '#notnull' }

  @regression @positive
  Scenario: Transferencia con idempotency key duplicado
    # 1. Registrar usuario dinámico y obtener token
    * def randomEmail = 'transfer_idem_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    # 2. Crear Cuentas para la prueba
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: 'Cuenta A', initial_balance: 500.00 }
    When method POST
    Then status 201
    * def sourceId = response.account.id

    Given path 'banking-api/accounts'
    And header Authorization = authHeader
    And request { holder_name: 'Cuenta B', initial_balance: 50.00 }
    When method POST
    Then status 201
    * def destId = response.account.id

    * def idemKey = 'idem-' + java.util.UUID.randomUUID().toString()

    # 3. Primera Petición con Idempotency Key
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 50, idempotency_key: '#(idemKey)' }
    When method POST
    Then status 202

    # 4. Petición Duplicada con el mismo Idempotency Key
    Given path 'transfer'
    And header Authorization = authHeader
    And request { source_account_id: '#(sourceId)', destination_account_id: '#(destId)', amount: 50, idempotency_key: '#(idemKey)' }
    When method POST
    Then status 202