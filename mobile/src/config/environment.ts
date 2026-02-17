// Configuración de entornos

// IMPORTANTE: Cambia esto según el entorno
type Environment = 'development' | 'production';

const ENV: Environment = 'production'; // Conectado a Railway

const config = {
  development: {
    API_URL: 'http://localhost:8080',
    USE_MOCK_API: true,
  },
  production: {
    API_URL: 'https://gym-app-production-4dc4.up.railway.app',
    USE_MOCK_API: false,
  },
};

export const API_BASE_URL = config[ENV].API_URL;
export const USE_MOCK_API = config[ENV].USE_MOCK_API;

export default config[ENV];
