# Gemelo Digital Comercial para PyMEs — Plan de Proyecto

## Visión General

Plataforma web que permite a emprendedores simular y analizar su negocio antes de invertir dinero real. El núcleo es el **Gemelo Digital Comercial**: el usuario define su negocio mediante un proceso guiado de 6 pasos, luego recibe un análisis integral representado en tarjetas con código de colores, puede simular escenarios financieros completos y consultar un agente IA contextualizado.

**Stack tecnológico confirmado:**
- Frontend: React + CSS (animaciones fluidas, diseño en tarjetas)
- Backend: Java + Spring Boot
- Base de datos: PostgreSQL + PostGIS
- IA del producto: watsonx.ai (IBM Cloud) como motor del agente
- IDE de desarrollo: IBM BOB (cada integrante con su propio BOB sobre el repositorio compartido)
- Mapas: Leaflet + OpenStreetMap + Google Places API (competencia y POIs) + Google Routes API (accesibilidad)
- Datos: INEGI (demografía, nivel socioeconómico), Overpass/OSM (POIs), Google Places (negocios), RETyS (tnrámites)

**Ciudad MVP (placeholder):** Tijuana, B.C., México
**Tipos de negocio iniciales (placeholder):** Cafetería, Barbería, Tienda de conveniencia

**Colaboración en equipo:**
- Repositorio compartido en GitHub
- Cada integrante usa su propio IBM BOB IDE conectado al mismo repositorio
- El `AGENTS.md` del repositorio es el documento maestro que guía a todos los BOBs
- Responsabilidades: Backend (Java), Frontend (React), Datos/Mapas, IA/watsonx

**Principios UX no negociables:**
1. Preguntar progresivamente — solo lo necesario para cada análisis
2. Explicar siempre — ningún número sin contexto ni justificación
3. Permitir explorar — variables modificables, escenarios comparables
4. Tarjetas con código de color — verde (oportunidad), amarillo (precaución), rojo (riesgo), azul (sugerencia de mejora)
5. Animaciones fluidas y rebote — la UI debe sentirse viva e interactiva

**Principio de transparencia de datos:**
- 🔵 **Dato** — fuente verificable (INEGI, Google Places, RETyS)
- 🟡 **Estimación** — calculado por el motor de viabilidad o watsonx
- 🟠 **Suposición** — introducido manualmente por el usuario
- 🔴 **Faltante** — dato que mejoraría el análisis pero no está disponible

---

## Módulos del Sistema (11 módulos + agente)

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | **Creación de PyME** | Onboarding en 6 pasos + SCAMPER con watsonx |
| 2 | **Inteligencia de Ubicación** | Mapa interactivo con capas: competidores, POIs, zonas |
| 3 | **Análisis de Competencia** | Tabla de competidores cercanos + interpretación watsonx |
| 4 | **Inteligencia de Precios** | Comparador de precios del mercado + posicionamiento |
| 5 | **Curva Oferta-Demanda** | Simulación visual del precio óptimo estimado |
| 6 | **Estado de Resultados Humano** | P&L en lenguaje sencillo con datos del usuario |
| 7 | **Punto de Equilibrio** | Cálculo y visualización de break-even |
| 8 | **Apalancamiento Operativo** | Análisis de estructura de costos fijos vs. variables |
| 9 | **Análisis de Ciudad/Zonas** | Mapa de calor por zonas con índice de oportunidad |
| 10 | **Tráfico y Accesibilidad** | Accesibilidad por modo de transporte (Google Routes) |
| 11 | **Simulador de Escenarios** | "¿Qué pasa si...?" con costos futuros y proyecciones |
| 12 | **Agente IA** | Chat contextualizado con watsonx, conoce el proyecto del usuario |
| + | **Trámites / RETyS** | Ruta de permisos con progreso |
| + | **Escudo del Emprendedor** | Detección de trámites sospechosos |

---

## Sub-Tarea 1 — Flujo de Onboarding y Pantallas: Especificación UX Completa

**Status:** [ ] pending

### Intent
Documentar cada pantalla con sus elementos, lógica de navegación y transiciones. Énfasis en el sistema de tarjetas animadas, el onboarding de 6 pasos y el comportamiento del código de colores. Es la fuente de verdad para el equipo de frontend.

### Expected Outcomes
- Archivo `docs/ux-screens.md` con especificación textual de cada pantalla del MVP
- Cubre el onboarding en 6 pasos, el hub "Mi Proyecto", todos los módulos de análisis, el simulador y el agente IA
- Describe el sistema de tarjetas con código de colores y comportamiento de animaciones
- Describe qué información se solicita al usuario en cada paso y por qué
- Incluye tarjetas azules de "puntos de mejora" al final de cada módulo
- Describe el comportamiento progresivo: análisis completo vs. análisis específico

### Datos que se piden al usuario por módulo
Antes de documentar cada pantalla, el sistema debe solicitar únicamente:

**Onboarding (siempre, todos los modos):**
- Paso 1 — ¿Qué?: Descripción libre del producto/servicio/idea
- Paso 2 — ¿Quién?: Edad estimada del cliente, perfil, necesidades (selección + texto libre)
- Paso 3 — ¿Dónde?: Ciudad → zona → pin en mapa
- Paso 4 — ¿Cuánto?: Capital inicial disponible, presupuesto mensual estimado, número de empleados
- Paso 5 — ¿Cómo?: Canal de venta (local físico / internet / domicilio / marketplace / mixto)
- Paso 6 — ¿Por qué?: Problema que resuelve (texto libre → entrada para SCAMPER)

**Solo si se selecciona análisis de precios:**
- Precio que el usuario planea cobrar
- Precios conocidos de competidores (opcional, manual)

**Solo si se selecciona estado de resultados / simulador:**
- Ventas mensuales estimadas
- Costos variables estimados
- Gastos operativos fijos mensuales
- Inversión inicial
- Horizonte de proyección (6 meses / 1 año / 2 años)

### Todo List
- [ ] Pantalla 0: Landing animada con propuesta de valor del Gemelo Digital
- [ ] Pantalla 1: Selector de modo ("¿Qué quieres hacer?" — 5 opciones en tarjetas grandes animadas)
- [ ] Pantalla 2A–2F: Onboarding en 6 pasos (una tarjeta por paso, transición tipo slide con rebote)
- [ ] Pantalla 3: SCAMPER — watsonx toma la respuesta del Paso 6 y genera 6 variantes del negocio en tarjetas
- [ ] Pantalla 4: Dashboard "Mi Proyecto" (hub con los módulos disponibles según datos capturados)
- [ ] Pantalla 5: Inteligencia de Ubicación (mapa con capas activables: competidores, POIs, zonas, transporte)
- [ ] Pantalla 6: Análisis de Competencia (tabla + tarjeta de interpretación watsonx con código de color)
- [ ] Pantalla 7: Inteligencia de Precios (rango del mercado + posición del precio del usuario)
- [ ] Pantalla 8: Curva Oferta-Demanda (slider de precio → actualiza demanda estimada e ingresos)
- [ ] Pantalla 9: Estado de Resultados Humano (4 bloques: Ingresos → Costos Variables → Gastos Fijos → Utilidad)
- [ ] Pantalla 10: Punto de Equilibrio (gráfica + unidades/mes necesarias + margen de seguridad)
- [ ] Pantalla 11: Apalancamiento Operativo (comparador de dos estructuras de costos)
- [ ] Pantalla 12: Análisis de Ciudad/Zonas (mapa de calor con índice de oportunidad por zona)
- [ ] Pantalla 13: Tráfico y Accesibilidad (barras por modo de transporte: auto / transporte / peatón)
- [ ] Pantalla 14: Simulador de Escenarios "¿Qué pasa si...?" (variables editables + proyección financiera a futuro)
- [ ] Pantalla 15: Trámites / Ruta RETyS (lista de pasos con progreso)
- [ ] Pantalla 16: Escudo del Emprendedor (verificación de trámites y alertas de riesgo)
- [ ] Pantalla 17: Agente IA / Chat (panel lateral o pantalla completa con historial de conversación)
- [ ] Definir sistema de tarjetas: verde/amarillo/rojo para análisis + azul para sugerencias de mejora
- [ ] Definir animaciones: entrada con rebote (spring), transición entre pasos (slide), hover (escala suave)
- [ ] Definir comportamiento "Mostrar detalles" en pie de cada tarjeta (expansión inline o modal)
- [ ] Definir componentes de accesibilidad: "Explícame esto de manera sencilla", alto contraste, ARIA

### Relevant Context
- Onboarding en 6 pasos: secciones 3, 12 del contexto original + pasos detallados en el mensaje nuevo (¿Qué? ¿Quién? ¿Dónde? ¿Cuánto? ¿Cómo? ¿Por qué?)
- Sistema de tarjetas con código de colores: especificado en el mensaje nuevo
- SCAMPER: descrito en el mensaje nuevo (S/C/A/M/P/E/R aplicado al negocio del usuario)
- Filosofía UX: secciones 3, 27 del contexto original
- Transparencia de IA: sección 17 del contexto original
- Análisis de ciudad / mapa de calor: mensaje nuevo, punto 9

---

## Sub-Tarea 2 — Arquitectura Backend: APIs REST Java + Spring Boot

**Status:** [ ] pending

### Intent
Definir la arquitectura completa del backend: módulos, endpoints REST, modelos de datos, motor financiero, estrategia de integración con APIs externas y conexión con watsonx. Permite que el equipo de backend trabaje de forma independiente.

### Expected Outcomes
- Archivo `docs/backend-architecture.md` con:
  - Estructura de módulos Spring Boot (11 módulos)
  - Catálogo de endpoints REST (método, ruta, request/response body, código de color de respuesta)
  - Modelos de datos principales (PostgreSQL + PostGIS)
  - Motor de viabilidad ponderado con sus factores
  - Motor financiero (punto de equilibrio, apalancamiento operativo, estado de resultados, proyecciones)
  - Estrategia de integración: Google Places, Google Routes, INEGI, Overpass, RETyS, watsonx
  - Esquema del servidor MCP para watsonx

### Todo List
- [ ] Definir estructura de módulos Spring Boot: `onboarding`, `location`, `competition`, `pricing`, `financial`, `simulation`, `tramites`, `security`, `agent`, `project`
- [ ] Definir entidades DB: `Project`, `BusinessProfile`, `Location`, `CompetitorSnapshot`, `PriceSnapshot`, `FinancialInput`, `Scenario`, `Tramite`, `Alert`, `ChatMessage`
- [ ] Especificar endpoints `POST /api/project` — crear proyecto con datos del onboarding
- [ ] Especificar endpoints `POST /api/analysis/location` — análisis de ubicación (devuelve competidores, POIs, índice de zona)
- [ ] Especificar endpoints `POST /api/analysis/competition` — análisis de competencia con Google Places
- [ ] Especificar endpoints `POST /api/analysis/pricing` — análisis de precios del mercado
- [ ] Especificar endpoints `POST /api/analysis/demand-curve` — curva oferta-demanda estimada
- [ ] Especificar endpoints `POST /api/financial/income-statement` — estado de resultados con datos del usuario
- [ ] Especificar endpoints `POST /api/financial/break-even` — cálculo del punto de equilibrio
- [ ] Especificar endpoints `POST /api/financial/operating-leverage` — apalancamiento operativo
- [ ] Especificar endpoints `POST /api/simulation/scenario` — crear/modificar escenario con proyección a futuro
- [ ] Especificar endpoints `GET /api/tramites/{businessType}/{city}` — ruta de trámites
- [ ] Especificar endpoints `POST /api/security/verify` — verificación de trámite contra fuente oficial
- [ ] Especificar endpoints `POST /api/agent/chat` — proxy de conversación hacia watsonx
- [ ] Especificar endpoints `POST /api/scamper` — genera variantes SCAMPER del negocio vía watsonx
- [ ] Definir motor de viabilidad ponderado (factores, pesos, normalización, etiqueta de color)
- [ ] Definir motor financiero: fórmulas de break-even, apalancamiento operativo, proyección de flujo de caja
- [ ] Definir integración Google Places API (búsqueda de negocios cercanos, rating, reviews, horarios)
- [ ] Definir integración Google Routes API (tiempos de viaje por modo de transporte)
- [ ] Definir integración INEGI (API o datos descargados: población, nivel socioeconómico por AGEB)
- [ ] Definir integración Overpass/OSM (escuelas, oficinas, centros comerciales, transporte)
- [ ] Definir integración RETyS (trámites por tipo de negocio y municipio)
- [ ] Definir integración watsonx.ai (IBM Cloud): autenticación IAM, endpoint de inferencia, modelo base
- [ ] Definir esquema PostGIS: geometrías de zonas, puntos de competidores, radio de análisis

### Relevant Context
- Arquitectura conceptual: secciones 25 y 26 del contexto original
- Motor de viabilidad: sección 20 del contexto original
- Google Places para competencia: punto 3 del mensaje nuevo
- Google Routes para accesibilidad: punto 10 del mensaje nuevo
- Estado de resultados humano: punto 6 del mensaje nuevo
- Punto de equilibrio: punto 7 del mensaje nuevo
- Apalancamiento operativo: punto 8 del mensaje nuevo
- Los datos financieros son introducidos manualmente por el usuario (no estimados automáticamente)

---

## Sub-Tarea 3 — Documento Maestro IBM BOB + Especificación watsonx

**Status:** [ ] pending

### Intent
Crear los documentos que gobiernan el uso de IBM BOB en el equipo y la especificación técnica del agente watsonx del producto. El `AGENTS.md` es el **documento maestro compartido** en GitHub: cuando cada integrante abra BOB en su copia local, BOB leerá este archivo y entenderá la arquitectura, convenciones y responsabilidades del proyecto. Adicionalmente, se especifica cómo watsonx actúa como motor del agente que ve el usuario final.

### Expected Outcomes
- `AGENTS.md` en la raíz del repositorio: documento maestro del proyecto para los 4 BOBs del equipo
- `.bob/custom_modes.yaml`: Custom Mode "Asesor del Emprendedor" para el agente del producto
- `docs/watsonx-agent-spec.md`: especificación técnica del agente watsonx (intenciones, herramientas, flujos, prompts base)
- `docs/mcp-server-spec.md`: esquema del servidor MCP que conecta watsonx con el backend Java

### Estructura del AGENTS.md (documento maestro del equipo)
El archivo deberá cubrir:
1. Propósito y visión del proyecto (resumen ejecutivo de 5 líneas)
2. Estructura de directorios del repositorio
3. Stack tecnológico y versiones
4. Convenciones de código: Java (paquetes, naming), React (componentes, hooks), CSS (variables, clases)
5. Responsabilidades por integrante: quién es dueño de qué módulo
6. APIs externas: cómo están configuradas, variables de entorno necesarias
7. Cómo correr el proyecto localmente (comandos)
8. Cómo conectar watsonx (endpoint, API key, modelo)
9. Reglas de Git: branching, commits, PRs
10. Qué NO debe hacer BOB (no cambiar la arquitectura sin consenso, no cambiar módulos ajenos)

### Especificación del Agente watsonx
El agente que ve el usuario final es impulsado por watsonx.ai y accede al backend Java mediante el servidor MCP. Sus herramientas son:
- `get_project_context` — lee el estado actual del proyecto del usuario
- `run_viability_analysis` — ejecuta el motor de viabilidad con parámetros
- `run_scenario_simulation` — simula escenario con variables modificadas y proyección financiera
- `get_location_data` — datos de mapa, competencia, POIs y socioeconómicos de una ubicación
- `get_competitor_analysis` — análisis de competidores via Google Places
- `get_tramite_route` — ruta de trámites para tipo de negocio y ciudad
- `verify_tramite_safety` — verifica si un trámite/sitio es sospechoso
- `explain_result` — convierte resultado técnico en lenguaje sencillo
- `run_scamper` — genera variantes SCAMPER del negocio del usuario
- `get_financial_projection` — proyección de costos futuros y ganancias según horizonte temporal

### Todo List
- [ ] Escribir `AGENTS.md` raíz: documento maestro del equipo (secciones 1–10 descritas arriba)
- [ ] Escribir `.bob/custom_modes.yaml` con el Custom Mode del agente IA del producto
- [ ] Definir identidad del agente watsonx: nombre placeholder, tono, restricciones de lenguaje
- [ ] Definir las 9 intenciones principales: analizar-ubicacion, analizar-competencia, simular-escenario, consultar-tramites, verificar-seguridad, explicar-resultado, generar-scamper, proyectar-financiero, comparar-zonas
- [ ] Definir flujo de conversación: contexto de sesión, manejo de "Mi Proyecto", progresión natural
- [ ] Especificar las 10 herramientas MCP (nombre, descripción, parámetros de entrada, schema de respuesta)
- [ ] Definir prompt base del sistema para watsonx (rol, restricciones, formato de respuestas)
- [ ] Definir reglas de transparencia en respuestas (etiquetar dato vs. estimación vs. suposición)
- [ ] Definir manejo de incertidumbre y datos faltantes
- [ ] Definir reglas del Escudo del Emprendedor (nunca afirmar estafa sin evidencia, siempre citar fuente oficial)
- [ ] Definir formato de respuestas: cuándo usar listas, cuándo párrafo, cuándo tabla
- [ ] Escribir 5 ejemplos de conversación completa (onboarding, análisis de ubicación, simulación, trámites, alerta de seguridad)
- [ ] Especificar `docs/mcp-server-spec.md`: cómo el backend Java expone el servidor MCP para watsonx
- [ ] Especificar autenticación IBM Cloud IAM para watsonx (variables de entorno, no hardcodear keys)

### Relevant Context
- IBM BOB soporta Custom Modes vía `.bob/custom_modes.yaml` (slug, name, roleDefinition, groups, whenToUse, customInstructions)
- IBM BOB carga `AGENTS.md` automáticamente en cada conversación — es el mecanismo de documento maestro del equipo
- watsonx.ai (IBM Cloud) actúa como motor LLM del agente del producto final
- El servidor MCP conecta watsonx con los endpoints del backend Java (local o como microservicio)
- Comportamiento esperado del agente: secciones 10, 11, 16, 17 del contexto original
- SCAMPER: descrito en el mensaje nuevo — el agente genera variantes del negocio
- Identificar información faltante: punto 11 del mensaje nuevo (el agente pregunta lo que falta)
- Colaboración en equipo via GitHub + BOB individual: confirmado en las respuestas de clarificación

---

## Sub-Tarea 4 — Roadmap y Decisiones Pendientes

**Status:** [ ] pending

### Intent
Documentar decisiones que el equipo aún no ha tomado y que condicionan la implementación. Definir el roadmap MVP → v1.1 → futuro para presentación al jurado.

### Expected Outcomes
- Archivo `docs/decisions-and-roadmap.md` con decisiones pendientes, criterios de decisión y roadmap

### Todo List
- [ ] Decisión pendiente: nombre del proyecto y del agente IA
- [ ] Decisión pendiente: ciudad definitiva del MVP (Tijuana como candidato principal)
- [ ] Decisión pendiente: 2–3 tipos de negocio definitivos del MVP
- [ ] Decisión pendiente: ponderaciones definitivas del índice de viabilidad (propuesta: 25/20/20/15/10/10)
- [ ] Decisión pendiente: fuente de flujo peatonal (Google Popular Times via proxy, datos municipales, o eliminarlo del MVP y usar accesibilidad como proxy)
- [ ] Decisión pendiente: integración RETyS (API disponible vs. datos estáticos estructurados manualmente para MVP)
- [ ] Decisión pendiente: modelo base de watsonx a usar (granite, llama, mixtral — según disponibilidad en IBM Cloud)
- [ ] Roadmap MVP: los 11 módulos + agente + trámites + escudo
- [ ] Roadmap v1.1: comparador de zonas automático, recomendación de ubicaciones disponibles, análisis de proveedores
- [ ] Roadmap futuro: Machine Learning sobre datos históricos, tiempo real, financiamiento

### Relevant Context
- Sección 31 del contexto original: "Algo que todavía debemos investigar"
- Sección 22: función futura "encontrar mejor ubicación"
- Sección 30: MVP propuesto original (12 funciones)

---

## Diagrama de Arquitectura del Sistema

```
USUARIO (Navegador)
        │
        ▼
┌─────────────────────────────────────┐
│   Frontend: React                    │
│   Sistema de Tarjetas Animadas       │
│   (verde / amarillo / rojo / azul)  │
│   Leaflet + Google Maps embed        │
│   Onboarding 6 pasos                 │
└──────────────────┬──────────────────┘
                   │ HTTP REST
                   ▼
┌─────────────────────────────────────────────────────┐
│          Backend: Java + Spring Boot                  │
│                                                       │
│  /api/project        /api/analysis/*                 │
│  /api/financial/*    /api/simulation/*               │
│  /api/tramites       /api/security                   │
│  /api/agent/chat     /api/scamper                    │
│                                                       │
│  Motor de Viabilidad Ponderado                        │
│  Motor Financiero (P&L, Break-even, Leverage)         │
│  PostGIS spatial queries                              │
└───────────┬──────────────────────────┬───────────────┘
            │                          │
            ▼                          ▼
┌───────────────────┐      ┌───────────────────────────┐
│  PostgreSQL       │      │  watsonx.ai (IBM Cloud)    │
│  + PostGIS        │      │                           │
│                   │      │  Motor del Agente IA      │
│  Projects         │      │  Modelo: granite / llama  │
│  FinancialInputs  │      │                           │
│  Scenarios        │      │  Recibe contexto via MCP: │
│  Competitors      │      │  - get_project_context    │
│  Tramites         │      │  - run_viability_analysis │
│  Alerts           │      │  - run_scenario_simulation│
│  ChatHistory      │      │  - get_competitor_analysis│
└───────────────────┘      │  - run_scamper            │
                           │  - get_tramite_route      │
                           │  - verify_tramite_safety  │
                           │  - get_financial_projection│
                           └─────────────┬─────────────┘
                                         │
                           ┌─────────────▼─────────────┐
                           │  APIs Externas             │
                           │  Google Places (competencia│
                           │  y POIs)                   │
                           │  Google Routes (acceso)    │
                           │  INEGI (demografía)        │
                           │  Overpass/OSM (POIs extra) │
                           │  RETyS (trámites)          │
                           └────────────────────────────┘
```

---

## Flujo de Onboarding y Navegación

```
LANDING
   │
   ▼
¿QUÉ QUIERES HACER?  [5 tarjetas animadas]
   │
   ├─ Análisis completo ─────────────────────┐
   ├─ Análisis específico ───────────────────┤
   ├─ Simular escenarios ────────────────────┤
   ├─ Consultar al agente ───────────────────┤
   └─ Conocer mis trámites ─────────────────┤
                                             │
                                             ▼
                                   ONBOARDING 6 PASOS
                                   [tarjetas con slide + rebote]
                                   Paso 1: ¿Qué?
                                   Paso 2: ¿Quién?
                                   Paso 3: ¿Dónde?
                                   Paso 4: ¿Cuánto?
                                   Paso 5: ¿Cómo?
                                   Paso 6: ¿Por qué?
                                             │
                                             ▼
                                   SCAMPER (watsonx)
                                   [6 tarjetas de variantes]
                                             │
                                             ▼
                                   MI PROYECTO (Hub)
                                   [módulos disponibles]
                                   ├── 📍 Ubicación
                                   ├── 🏪 Competencia
                                   ├── 💲 Precios
                                   ├── 📊 Demanda
                                   ├── 📄 Estado de Resultados
                                   ├── ⚖️ Punto de Equilibrio
                                   ├── 🔧 Apalancamiento
                                   ├── 🗺️ Análisis de Ciudad
                                   ├── 🚗 Accesibilidad
                                   ├── 🔮 Escenarios
                                   ├── 🧾 Trámites
                                   ├── 🛡️ Escudo
                                   └── 🤖 Agente IA
```

---

## Sistema de Tarjetas con Código de Color

Cada módulo de análisis produce tarjetas con código de color:

| Color | Significado | Condición |
|-------|-------------|-----------|
| 🟢 Verde | Oportunidad favorable | Índice del factor ≥ 70 |
| 🟡 Amarillo | Precaución / neutro | Índice del factor 40–69 |
| 🔴 Rojo | Riesgo / condición desfavorable | Índice del factor < 40 |
| 🔵 Azul | Sugerencia de mejora | Siempre al final de cada módulo |

Comportamiento de las tarjetas:
- Animación de entrada: spring/rebote al aparecer
- Hover: escala suave (1.02)
- Botón "Mostrar detalles" en el pie: expande inline o abre panel lateral
- Las tarjetas azules muestran acciones concretas (ej: "Ver locaciones disponibles en presupuesto")

---

## Motor de Viabilidad Ponderado (MVP)

```
Índice de Viabilidad =
  Demanda estimada (proxy: densidad poblacional + POIs)  × 25%
  Competencia en zona (Google Places, densidad)          × 20%
  Nivel socioeconómico (INEGI AGEB)                      × 20%
  Accesibilidad (Google Routes multi-modal)              × 15%
  Costos / renta estimada (manual usuario)               × 10%
  Puntos de interés compatibles (escuelas, oficinas)     × 10%
```

Nota: flujo peatonal directo NO está incluido en MVP. Se usa accesibilidad como variable proxy.
Las ponderaciones son configurables en la base de datos (tabla `ViabilityWeights`).

---

## Motor Financiero (datos introducidos por el usuario)

Módulos financieros que calculan a partir de los inputs del usuario:

**Estado de Resultados:**
```
Ingresos = precio_promedio × ventas_estimadas_mes
Costos Variables = costo_variable_unitario × ventas_estimadas_mes
Utilidad Bruta = Ingresos - Costos Variables
Gastos Operativos = suma de gastos fijos mensuales del usuario
Utilidad Operativa = Utilidad Bruta - Gastos Operativos
Margen Operativo = Utilidad Operativa / Ingresos
```

**Punto de Equilibrio:**
```
Unidades Break-even = Costos Fijos / (Precio - Costo Variable Unitario)
Ventas Break-even = Unidades Break-even × Precio
Margen de Seguridad = (Ventas Actuales - Ventas Break-even) / Ventas Actuales
```

**Apalancamiento Operativo:**
```
GAO = Margen de Contribución / Utilidad Operativa
Impacto en Utilidad = % cambio en ventas × GAO
```

**Simulador con proyección futura:**
```
Para cada mes t en horizonte:
  Ingresos(t) = ventas_base × (1 + tasa_crecimiento)^t
  Costos_Variables(t) = costo_variable × Ingresos(t)
  Costos_Fijos(t) = costos_fijos + inflación_estimada × t
  Flujo_Caja(t) = Ingresos(t) - Costos_Variables(t) - Costos_Fijos(t)
  Acumulado(t) = Acumulado(t-1) + Flujo_Caja(t)
Recuperación inversión = primer t donde Acumulado(t) ≥ 0
```

---

## Notas de Implementación

### Documento Maestro AGENTS.md y trabajo en equipo
- El `AGENTS.md` en la raíz del repositorio GitHub es el documento maestro
- Cada integrante clona el repositorio y abre su IBM BOB — BOB carga automáticamente el `AGENTS.md`
- Esto garantiza que los 4 BOBs individuales entiendan la misma arquitectura, convenciones y responsabilidades
- El `AGENTS.md` debe ser conciso y accionable — no repetir todo el contexto del reto, solo lo que BOB necesita para generar código coherente

### watsonx.ai como motor del agente
- El agente del producto final usa watsonx.ai (IBM Cloud) como LLM
- El backend Java actúa como proxy: recibe el mensaje del usuario, construye el contexto (proyecto + historial), llama a watsonx via REST API con IBM Cloud IAM auth
- El servidor MCP expone las herramientas del backend para que watsonx pueda invocarlas
- Las API keys de IBM Cloud van en variables de entorno (nunca en código)

### Integración Google Places
- Permite buscar negocios por tipo y ubicación (texto o coordenadas + radio)
- Devuelve: nombre, distancia, rating, número de reviews, horarios, tipos
- No devuelve datos de ventas ni demanda — cualquier inferencia es una estimación del motor de viabilidad
- El sistema debe etiquetar claramente qué es dato observado (Google Places) vs. inferencia del modelo

### Tarjetas azules de mejora (fin de cada módulo)
- Siempre aparecen al terminar un módulo de análisis
- Contienen acciones concretas, no solo consejos genéricos
- Ejemplo para Ubicación: "Encontramos 3 locales disponibles en Zona Río con renta estimada < $15,000/mes — ver opciones"
- Ejemplo para Competencia: "Tus competidores cercanos tienen rating promedio de 4.2. Tu diferenciador podría ser X — consultar al agente"