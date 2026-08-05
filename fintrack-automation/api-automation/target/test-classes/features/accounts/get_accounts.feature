@api @accounts
Feature: Obtener cuentas del usuario

  Background:
    * url baseUrl

  @smoke @positive
  Scenario: Listar cuentas del usuario autenticado
    # Invocación limpia de la capa helper
    * def user = call read('classpath:common/helpers/create_user.feature')

    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response == { accounts: '#array' }

  @regression @negative
  Scenario: Listar cuentas sin token de autenticacion
    * url functionsUrl
    Given path 'banking-api/accounts'
    When method GET
    Then status 401
    And match response contains { message: '#notnull' }