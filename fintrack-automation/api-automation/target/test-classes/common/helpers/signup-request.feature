@ignore
Feature: Peticion HTTP directa de Registro de Usuario (Signup)

  Scenario: Ejecutar peticion POST a Supabase Auth
    Given url baseUrl + '/auth/v1/signup'
    And header apikey = supabaseAnonKey
    And header Content-Type = 'application/json'
    # 🟢 CORRECCIÓN: Usar #(variable) para inyectar los valores dinámicos
    And request { email: '#(email)', password: '#(password)' }
    When method post