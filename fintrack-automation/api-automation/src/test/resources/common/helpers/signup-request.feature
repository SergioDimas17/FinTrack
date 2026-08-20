@ignore
Feature: Signup Request

  Scenario: Realizar solicitud de signup
    * url baseUrl
    * header apikey = supabaseAnonKey
    * header Content-Type = application/json
    * request { email: '#(email)', password: '#(randomPassword)' }
    * method post
    * path '/auth/v1/signup'