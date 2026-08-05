@api @authentication
Feature: Registro de usuarios

  Background:
    * url baseUrl

  @regression @positive
  Scenario: Registro de nuevo usuario
    * def randomEmail = 'test' + java.util.UUID.randomUUID().toString().substring(0, 8) + '@fintrack.dev'
    Given path '/auth/v1/signup'
    And request { email: '#(randomEmail)', password: 'TestPassword123' }
    When method POST
    Then status 200
    And match response.user.email == randomEmail