@api @accounts
Feature: Obtener cuenta por ID

Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Obtener cuenta propia por ID
    # 1. Crear usuario dinámico
    * def user = call read('classpath:common/helpers/create_user.feature')

    # 2. Crear cuenta bancaria para garantizar que exista
    * url functionsUrl
    * def holderName = 'Usuario ' + java.util.UUID.randomUUID().toString().substring(0, 6)
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: '#(holderName)', initial_balance: 500.00 }
    When method POST
    Then status 201
    * def accountId = response.account.id

    # 3. Obtener la cuenta por su ID
    Given path 'banking-api/accounts', accountId
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response.account.id == accountId
    And match response.account.holder_name == holderName

  @regression @negative
  Scenario: Obtener cuenta inexistente por ID
    # 1. Crear usuario dinámico
    * def user = call read('classpath:common/helpers/create_user.feature')

    # 2. Consultar con ID inexistente
    * url functionsUrl
    * def fakeId = java.util.UUID.randomUUID().toString()
    Given path 'banking-api/accounts', fakeId
    And header Authorization = user.authHeader
    When method GET
    Then status 404