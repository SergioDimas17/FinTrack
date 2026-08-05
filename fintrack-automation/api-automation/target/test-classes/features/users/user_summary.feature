@api @users
Feature: Resumen de actividad del usuario

Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Obtener resumen de transferencias
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/summary'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { period: '#object' }

  @regression @positive
  Scenario: Obtener resumen con rango de fechas
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    * def today = java.time.LocalDate.now().toString()
    * def weekAgo = java.time.LocalDate.now().minusDays(7).toString()
    Given path 'banking-api/summary'
    And param from = weekAgo
    And param to = today
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response.period.from == weekAgo
    And match response.period.to == today

  @regression @negative
  Scenario: Resumen con fecha from mayor que to
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/summary'
    And param from = '2026-12-31'
    And param to = '2026-01-01'
    And header Authorization = user.authHeader
    When method GET
    Then status 400