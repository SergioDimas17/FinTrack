@api @accounts
Feature: Buscar cuenta por numero

Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Buscar cuenta existente por numero
    # 1. Crear usuario dinámico
    * def user = call read('classpath:common/helpers/create_user.feature')

    # 2. Crear una cuenta para garantizar que existe un account_number
    * url functionsUrl
    * def holderName = 'Usuario ' + java.util.UUID.randomUUID().toString().substring(0, 6)
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    And request { holder_name: '#(holderName)', initial_balance: 300.00 }
    When method POST
    Then status 201
    * def accountNumber = response.account.account_number

    # 3. Buscar la cuenta creada por su número
    Given path 'banking-api/lookup'
    And param account_number = accountNumber
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { account: '#object' }
    And match response.account.account_number == accountNumber

  @regression @negative
  Scenario: Buscar cuenta inexistente
    * def user = call read('classpath:common/helpers/create_user.feature')

    * url functionsUrl
    Given path 'banking-api/lookup'
    And param account_number = 'FT-9999999'
    And header Authorization = user.authHeader
    When method GET
    Then status 404

  @regression @negative
  Scenario: Buscar cuenta sin parametro account_number
    * def user = call read('classpath:common/helpers/create_user.feature')

    * url functionsUrl
    Given path 'banking-api/lookup'
    And header Authorization = user.authHeader
    When method GET
    Then status 400