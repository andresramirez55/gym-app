#!/bin/bash

echo "🚀 Iniciando Gym App Mobile..."
echo ""

# Limpiar procesos anteriores
echo "🧹 Limpiando procesos anteriores..."
killall -9 node 2>/dev/null
sleep 2

# Ir al directorio correcto
cd "$(dirname "$0")"

echo "✅ Listo para iniciar"
echo ""
echo "📱 IMPORTANTE:"
echo "   1. Asegúrate de tener Expo Go instalado en tu teléfono"
echo "   2. Tu teléfono debe estar en la MISMA red WiFi que esta computadora"
echo ""
echo "Iniciando Expo..."
echo ""

# Iniciar Expo
npx expo start
