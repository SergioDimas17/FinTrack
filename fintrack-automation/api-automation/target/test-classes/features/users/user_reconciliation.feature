@api @users
Feature: Reportes de conciliacion

Background:
  * def user = callonce read('classpath:common/helpers/create_user.feature')

  @sanity @positive
  Scenario: Listar reportes de conciliacion
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    Given path 'banking-api/reconciliation'
    And header Authorization = user.authHeader
    When method GET
    Then status 200
    And match response contains { reports: '#array' }

  @regression @positive
  Scenario: Ejecutar cierre de caja
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    # Generar offset aleatorio usando Math.floor en lugar de (int)
    * def randomDays = Math.floor(Math.random() * 500) + 10
    * def reportDate = java.time.LocalDate.now().minusDays(randomDays).toString()
    Given path 'banking-api/day-close'
    And header Authorization = user.authHeader
    And request { date: '#(reportDate)' }
    When method POST
    Then status 201
    And match response contains { report: '#object' }

  @regression @negative
  Scenario: Cierre de caja duplicado para misma fecha
    * def user = call read('classpath:common/helpers/create_user.feature')
    * url functionsUrl
    * def randomDays = Math.floor(Math.random() * 500) + 1000
    * def reportDate = java.time.LocalDate.now().minusDays(randomDays).toString()
    
    # 1. Primer intento exitoso (201 Created)
    Given path 'banking-api/day-close'
    And header Authorization = user.authHeader
    And request { date: '#(reportDate)' }
    When method POST
    Then status 201

    # 2. Segundo intento duplicado (409 Conflict)
    Given path 'banking-api/day-close'
    And header Authorization = user.authHeader
    And request { date: '#(reportDate)' }
    When method POST
    Then status 409