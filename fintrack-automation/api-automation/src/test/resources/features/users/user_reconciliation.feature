@api @users
Feature: Reportes de conciliacion

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def reconciliationSchema = read('classpath:common/schemas/reconciliation_schema.json')

  @sanity @positive
  Scenario: Listar reportes de conciliacion
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/reconciliation'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == reconciliationSchema

  @regression @positive
  Scenario: Ejecutar cierre de caja
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    * def reportDate = java.time.LocalDate.now().minusDays(1).toString()
    Given path 'banking-api/day-close'
    And header Authorization = authHeader
    And request { date: '#(reportDate)' }
    When method POST
    Then status 201
    And match response contains { report: '#object' }
    And match response.is_balanced == '#boolean'
    And match response.report_hash == '#string'

  @regression @negative
  Scenario: Cierre de caja duplicado para misma fecha
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    * def reportDate = java.time.LocalDate.now().minusDays(1).toString()
    Given path 'banking-api/day-close'
    And header Authorization = authHeader
    And request { date: '#(reportDate)' }
    When method POST
    Then status 409
