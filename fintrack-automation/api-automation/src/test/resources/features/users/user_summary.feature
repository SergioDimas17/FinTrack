@api @users
Feature: Resumen de actividad del usuario

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def summarySchema = read('classpath:common/schemas/summary_schema.json')

  @sanity @positive
  Scenario: Obtener resumen de transferencias
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/summary'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == summarySchema

  @regression @positive
  Scenario: Obtener resumen con rango de fechas
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    * def today = java.time.LocalDate.now().toString()
    * def weekAgo = java.time.LocalDate.now().minusDays(7).toString()
    Given path 'banking-api/summary'
    And param from = weekAgo
    And param to = today
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == summarySchema
    And match response.period.from == weekAgo
    And match response.period.to == today

  @regression @negative
  Scenario: Resumen con fecha from mayor que to
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/summary'
    And param from = '2026-12-31'
    And param to = '2026-01-01'
    And header Authorization = authHeader
    When method GET
    Then status 400
