# Gym App - AI-Powered Workout Tracker

Aplicación de gimnasio con generación de rutinas por IA y tracking de pesos.

## Características

- ✨ **Generación de rutinas con IA** usando Claude API
- 🎯 **Rutinas personalizadas** según objetivo (ganar masa, perder peso, fuerza, etc.)
- 📅 **Flexibilidad** de 3 o 5 días por semana
- 📊 **Tracking de pesos** por ejercicio
- 📈 **Historial de progreso** con gráficas de evolución
- 💪 **Contador de entrenamientos** completados

## Arquitectura

### Backend (Go)
```
Handler → Service → Repository → Database
```

- **Domain**: Entidades de dominio
- **DTOs**: Data Transfer Objects para requests/responses
- **Repository**: Acceso a datos (PostgreSQL)
- **Service**: Lógica de negocio + integración con IA
- **Handler**: HTTP handlers y routing

### Mobile (React Native)
```
Screens → Services/API → Backend REST API
```

- **Screens**: Pantallas de la app (Login, Home, DayDetail, History)
- **Contexts**: State management con React Context (Auth)
- **Services**: Axios client para comunicarse con el backend
- **Types**: TypeScript types compartidos con backend DTOs

## Requisitos

- Go 1.21+
- PostgreSQL 14+
- Claude API Key

## Setup

1. **Clonar y configurar**:
```bash
cd gym-app
cp .env.example .env
# Editar .env con tus credenciales
```

2. **Crear base de datos**:
```bash
createdb gym_app
psql gym_app < migrations/001_init_schema.sql
```

3. **Instalar dependencias**:
```bash
go mod download
```

4. **Ejecutar servidor**:
```bash
go run cmd/server/main.go
```

El servidor estará disponible en `http://localhost:8080`

5. **Ejecutar app mobile** (opcional):
```bash
cd mobile
npm install
npm start
```

Luego escanea el QR con Expo Go en tu teléfono. Ver [mobile/README.md](mobile/README.md) para más detalles.

## API Endpoints

### Users
- `POST /api/users` - Crear usuario
- `GET /api/users?id=1` - Obtener usuario
- `PUT /api/users?id=1` - Actualizar usuario
- `DELETE /api/users?id=1` - Eliminar usuario

### Routines
- `POST /api/routines/generate` - Generar rutina con IA
- `GET /api/routines?id=1` - Obtener rutina
- `GET /api/routines/active?user_id=1` - Obtener rutina activa del usuario

### Workouts
- `POST /api/workouts/log` - Registrar entrenamiento
- `GET /api/workouts/history?user_id=1&limit=10` - Historial de entrenamientos
- `GET /api/workouts/progress?user_id=1&exercise_id=1` - Progreso de peso en ejercicio

## Ejemplos de Uso

### Crear usuario
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "goal": "gain_muscle",
    "frequency": 5
  }'
```

### Generar rutina
```bash
curl -X POST http://localhost:8080/api/routines/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "goal": "gain_muscle",
    "frequency": 5
  }'
```

### Registrar entrenamiento
```bash
curl -X POST http://localhost:8080/api/workouts/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "routine_id": 1,
    "routine_day_id": 1,
    "duration": 60,
    "exercise_logs": [
      {
        "exercise_id": 1,
        "sets": [
          {"set_number": 1, "weight": 80, "reps": 10},
          {"set_number": 2, "weight": 80, "reps": 9},
          {"set_number": 3, "weight": 80, "reps": 8}
        ]
      }
    ]
  }'
```

## Próximos Pasos

### Backend
- [ ] Autenticación JWT
- [ ] Tests unitarios e integración
- [ ] Manejo de errores mejorado (códigos HTTP específicos)
- [ ] Middleware (logging, recovery)
- [ ] Router más robusto (chi/gorilla)
- [ ] Docker setup
- [ ] CI/CD pipeline

### Mobile
- [x] Frontend en React Native ✅
- [ ] Gráficas de progreso
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Estadísticas avanzadas

## Licencia

MIT
