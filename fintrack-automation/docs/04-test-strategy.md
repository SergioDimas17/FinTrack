# Test Strategy

## Niveles de Prueba

### Smoke
- **Objetivo**: verificar que los flujos más críticos funcionen.
- **Duración**: menos de 2 minutos.
- **Cobertura**: login, listar cuentas, transferencia básica, health check.
- **Tags**: `@smoke`
- **Ejecución**: en cada push a CI.

### Sanity
- **Objetivo**: validaciones rápidas para confirmar que el sistema está operativo.
- **Duración**: menos de 1 minuto.
- **Cobertura**: login, balance visible, historial, resumen.
- **Tags**: `@sanity`
- **Ejecución**: antes de deployments.

### Regression
- **Objetivo**: ejecutar todos los escenarios automatizados.
- **Duración**: 5-10 minutos.
- **Cobertura**: todos los flujos positivos y negativos.
- **Tags**: `@regression`
- **Ejecución**: nightly o antes de releases.

### Full
- **Objetivo**: ejecutar absolutamente todas las pruebas.
- **Tags**: sin filtro de tags.
- **Ejecución**: manual, bajo demanda.

## Cobertura por Módulo

### API
| Funcionalidad | Smoke | Sanity | Regression |
|---------------|-------|--------|------------|
| Login | x | | x |
| Signup | | | x |
| Health check | x | | |
| Listar cuentas | x | | x |
| Crear cuenta | x | | x |
| Buscar cuenta | | x | x |
| Obtener cuenta por ID | | x | x |
| Transferencia exitosa | x | | x |
| Transferencia negativa | | | x |
| Historial | | x | x |
| Resumen | | x | x |
| Auditoría | | x | x |
| Conciliación | | x | x |

### Web
| Funcionalidad | Smoke | Sanity | Regression |
|---------------|-------|--------|------------|
| Login | x | x | x |
| Dashboard | x | | x |
| Transferencia | | | x |
| Historial | | | x |

### Mobile
| Funcionalidad | Smoke | Sanity |
|---------------|-------|--------|
| Login | x | x |
| Dashboard | x | x |

### Performance
| Escenario | VUs | Duración |
|-----------|-----|----------|
| Smoke | 2 | 1 min |
| Load | 10-20 | 3 min |
| Stress | 50-100 | 5 min |
| Spike | 100 | 30 seg |

### Security
| Escenario | Tipo |
|-----------|------|
| Baseline scan | ZAP pasivo |
| Active scan | ZAP activo |

## Tipos de Escenario

- **@positive**: flujos que deben funcionar (happy path).
- **@negative**: flujos que deben fallar (unhappy path).
- **@critical**: escenarios críticos del negocio.

## Convenciones de Tags

```
@api @transfers @smoke @positive
@api @accounts @regression @negative
@web @smoke
@mobile @sanity
@performance @load
@security
```

## Gestión de Datos

- **Fixtures**: datos de prueba en `common/fixtures/` (JSON).
- **Payloads**: cuerpos de petición en `common/payloads/` (JSON con placeholders).
- **Schemas**: validaciones JSON Schema en `common/schemas/`.
- **Datos dinámicos**: generados con `RandomData` (nombres, montos, keys).

## Evidencias

| Tipo | API | Web | Mobile |
|------|-----|-----|--------|
| Logs | x | x | x |
| Request/Response | x | | |
| Screenshots | | x | x |
| Videos | | x | x |
