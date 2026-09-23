# MCP Server Specification

> **Status:** [ ] pending — Sub-Tarea 3 del Documento Maestro

## Descripción
El servidor MCP conecta watsonx.ai con los endpoints del backend Java.
El backend Java actúa como servidor MCP: expone las herramientas para que watsonx las invoque.

## Herramientas expuestas

| Herramienta | Endpoint backend | Método |
|-------------|-----------------|--------|
| `get_project_context` | `/api/project/{id}` | GET |
| `run_viability_analysis` | `/api/analysis/location` | POST |
| `run_scenario_simulation` | `/api/simulation/scenario` | POST |
| `get_location_data` | `/api/analysis/location` | POST |
| `get_competitor_analysis` | `/api/analysis/competition` | POST |
| `get_tramite_route` | `/api/tramites/{type}/{city}` | GET |
| `verify_tramite_safety` | `/api/security/verify` | POST |
| `explain_result` | `/api/agent/explain` | POST |
| `run_scamper` | `/api/scamper` | POST |
| `get_financial_projection` | `/api/simulation/scenario` | POST |

## Autenticación
<!-- TODO: IBM Cloud IAM, variables de entorno -->
