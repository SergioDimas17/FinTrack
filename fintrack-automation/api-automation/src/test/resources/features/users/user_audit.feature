@api @users
Feature: Eventos de auditoria

  Background:
    * url baseUrl
    * def fixtures = read('classpath:common/fixtures/test_data.json')
    * def auditSchema = read('classpath:common/schemas/audit_events_schema.json')

  @sanity @positive
  Scenario: Listar eventos de auditoria
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/audit'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == auditSchema

  @regression @positive
  Scenario: Listar eventos filtrados por severidad
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/audit'
    And param severity = 'INFO'
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response == auditSchema
    * def events = response.events
    * match each events contains { severity: 'INFO' }

  @regression @positive
  Scenario: Listar eventos con paginacion
    * url baseUrl
    Given path '/auth/v1/token'
    And param grant_type = 'password'
    And request { email: '#(fixtures.testUser.email)', password: '#(fixtures.testUser.password)' }
    When method POST
    Then status 200
    * def accessToken = response.access_token
    * def authHeader = 'Bearer ' + accessToken

    * url functionsUrl
    Given path 'banking-api/audit'
    And param limit = 10
    And param offset = 0
    And header Authorization = authHeader
    When method GET
    Then status 200
    And match response.limit == 10
    And match response.offset == 0
