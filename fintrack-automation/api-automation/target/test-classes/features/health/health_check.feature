@api @health
Feature: Health check de Edge Functions

  Background:
    * url baseUrl

  @smoke @positive
  Scenario: Edge Function banking-api responde
    # 1. Generar usuario dinámico y obtener token
    * def randomEmail = 'health_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token

    # 2. Probar la Edge Function
    * url functionsUrl
    Given path 'banking-api/accounts'
    And header Authorization = 'Bearer ' + accessToken
    When method GET
    Then status 200
    And match response contains { accounts: '#array' }

  @smoke @positive
  Scenario: Edge Function transfer responde a metodo no permitido
    # 1. Generar usuario dinámico y obtener token
    * def randomEmail = 'health_' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    * def accessToken = response.access_token

    # 2. Validar método no permitido
    * url functionsUrl
    Given path 'transfer'
    And header Authorization = 'Bearer ' + accessToken
    When method GET
    Then status 405