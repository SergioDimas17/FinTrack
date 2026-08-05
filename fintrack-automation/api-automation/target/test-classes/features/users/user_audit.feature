@api @users
Feature: Eventos de auditoria

 Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Listar eventos de auditoria
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/audit'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { events: '#array' }

  @regression @positive
  Scenario: Listar eventos filtrados por severidad
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/audit'
    And param severity = 'INFO'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { events: '#array' }

  @regression @positive
  Scenario: Listar eventos con paginacion
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/audit'
    And param limit = 10
    And param offset = 0
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response.limit == 10
    And match response.offset == 0