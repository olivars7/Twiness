# AGENTS.md — Documento Maestro del Equipo

> Este archivo es leído automáticamente por IBM BOB en cada conversación.
> Define la arquitectura, convenciones y responsabilidades del proyecto para los 4 BOBs del equipo.

---

## 1. Propósito y Visión

**viabL** es una plataforma web que permite a emprendedores simular y analizar su negocio **antes de invertir dinero real**.
El núcleo es el **Gemelo Digital Comercial**: el usuario define su negocio en 6 pasos guiados, recibe un análisis integral
en tarjetas con código de colores, puede simular escenarios financieros y consultar un agente IA contextualizado.
MVP dirigido a PyMEs en Tijuana, B.C., México. Tipos de negocio iniciales: Cafetería, Barbería, Tienda de conveniencia.

---

## 2. Estructura de Directorios

```
viabL-hackathon-project/
├── frontend/               ← Next.js 15 + TypeScript + Tailwind CSS
│   └── src/
│       ├── app/            ← Rutas (App Router): onboarding/, proyecto/*, api/proxy/
│       ├── components/     ← ui/, maps/, charts/, onboarding/, agent/
│       ├── hooks/          ← useProject, useAnalysis, useChat
│       ├── lib/            ← api.ts, viability.ts, financial.ts
│       ├── store/          ← projectStore.ts (Zustand)
│       └── types/          ← project.ts, analysis.ts, financial.ts
├── backend/                ← Java 17 + Spring Boot 3
│   └── src/main/java/com/viabl/
│       └── modules/        ← onboarding, location, competition, pricing, financial, agent...
├── docs/                   ← Documentación técnica del equipo
├── AGENTS.md               ← Este archivo
└── .bob/
    └── custom_modes.yaml   ← Custom Mode del agente del producto
```

---

## 3. Stack Tecnológico y Versiones

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js | 15.x (App Router) |
| UI | React | 19.x |
| Estilos | Tailwind CSS | 4.x |
| Animaciones | Framer Motion | latest |
| Gráficas | Recharts | latest |
| Mapas | Leaflet + react-leaflet | latest |
| Estado | Zustand | latest |
| Formularios | React Hook Form + Zod | latest |
| Backend | Java | 17 |
| Framework | Spring Boot | 3.x |
| Base de datos | PostgreSQL + PostGIS | 15.x |
| IA del producto | watsonx.ai (IBM Cloud) | — |

---

## 4. Convenciones de Código

### Java (Backend)
- Paquete raíz: `com.viabl`
- Módulos: `com.viabl.modules.<nombre>` (ej: `com.viabl.modules.location`)
- Naming: `PascalCase` para clases, `camelCase` para métodos y variables
- Services llevan sufijo `Service`, Controllers `Controller`, Entities sin sufijo
- DTOs llevan sufijo `Request` / `Response`

### React / TypeScript (Frontend)
- Componentes: `PascalCase` en archivos `.tsx`
- Hooks: `useCamelCase` en archivos `.ts`
- Tipos e interfaces: `PascalCase` en `src/types/`
- Siempre usar `'use client'` en componentes que usen estado o animaciones
- Mapas (Leaflet): importar siempre con `dynamic(..., { ssr: false })`

### CSS / Tailwind
- Usar variables de color del proyecto: `green-400`, `yellow-400`, `red-400`, `blue-400` para el sistema de tarjetas
- Animaciones spring en Framer Motion: `type: 'spring', stiffness: 300, damping: 20`
- Hover en tarjetas: `whileHover={{ scale: 1.02 }}`

---

## 5. Responsabilidades por Integrante

| Área | Módulos / Archivos bajo su responsabilidad |
|------|--------------------------------------------|
| **Backend** | `backend/`, endpoints REST, motor de viabilidad, motor financiero |
| **Frontend** | `frontend/src/`, componentes UI, onboarding, tarjetas animadas |
| **Datos / Mapas** | Integración Google Places, Google Routes, INEGI, Overpass/OSM |
| **IA / watsonx** | Agente watsonx, servidor MCP, `docs/watsonx-agent-spec.md` |

> ⚠️ **No modificar módulos fuera de tu área de responsabilidad sin consenso del equipo.**

---

## 6. APIs Externas — Variables de Entorno

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<key>

# backend/.env (o application.properties)
GOOGLE_PLACES_API_KEY=<key>
GOOGLE_ROUTES_API_KEY=<key>
WATSONX_API_KEY=<ibm_cloud_api_key>
WATSONX_PROJECT_ID=<project_id>
WATSONX_ENDPOINT=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL=ibm/granite-13b-instruct-v2
DATABASE_URL=jdbc:postgresql://localhost:5432/viabl
```

> ⚠️ **Nunca hardcodear API keys en el código. Siempre usar variables de entorno.**

---

## 7. Cómo Correr el Proyecto Localmente

```bash
# Frontend
cd frontend
npm install
npm run dev         # http://localhost:3000

# Backend
cd backend
./mvnw spring-boot:run   # http://localhost:8080

# Base de datos (Docker)
docker run -d \
  --name viabl-postgres \
  -e POSTGRES_DB=viabl \
  -e POSTGRES_USER=viabl \
  -e POSTGRES_PASSWORD=viabl \
  -p 5432:5432 \
  postgis/postgis:15-3.4
```

---

## 8. Conexión con watsonx

```java
// Autenticación IBM Cloud IAM
POST https://iam.cloud.ibm.com/identity/token
  grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=<WATSONX_API_KEY>

// Inferencia
POST https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29
Authorization: Bearer <iam_token>
{
  "model_id": "ibm/granite-13b-instruct-v2",
  "project_id": "<WATSONX_PROJECT_ID>",
  "input": "<prompt>",
  "parameters": { "max_new_tokens": 500, "temperature": 0.7 }
}
```

---

## 9. Reglas de Git

- `main` — rama estable, solo merge via PR aprobado
- `develop` — rama de integración
- `feat/<nombre>` — nuevas funcionalidades
- `fix/<nombre>` — correcciones
- Commits: `feat:`, `fix:`, `docs:`, `refactor:` (Conventional Commits)
- PRs requieren al menos 1 aprobación antes de merge

---

## 10. Qué NO debe hacer BOB

- ❌ No cambiar la arquitectura de módulos sin consenso del equipo
- ❌ No modificar archivos fuera del área de responsabilidad asignada
- ❌ No hardcodear API keys, tokens ni credenciales
- ❌ No cambiar el sistema de colores de las tarjetas (verde/amarillo/rojo/azul)
- ❌ No eliminar el sistema de transparencia de datos (🔵🟡🟠🔴)
- ❌ No agregar dependencias nuevas sin revisar el `package.json` / `pom.xml` primero
- ❌ No hacer commits directamente a `main`
