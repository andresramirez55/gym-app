// Exercise alternatives grouped by category
// Users can replace exercises with similar alternatives from the same category

export interface ExerciseAlternative {
  name: string;
  category: string;
}

export const EXERCISE_CATEGORIES: { [key: string]: ExerciseAlternative[] } = {
  'Pecho': [
    { name: 'Press banca con barra', category: 'Pecho' },
    { name: 'Press inclinado con mancuernas', category: 'Pecho' },
    { name: 'Press inclinado con barra', category: 'Pecho' },
    { name: 'Press declinado con barra', category: 'Pecho' },
    { name: 'Press con mancuernas plano', category: 'Pecho' },
    { name: 'Fondos en paralelas con peso', category: 'Pecho' },
    { name: 'Fondos en paralelas', category: 'Pecho' },
    { name: 'Aperturas con mancuernas', category: 'Pecho' },
    { name: 'Aperturas en cable bajo', category: 'Pecho' },
    { name: 'Aperturas en cable alto', category: 'Pecho' },
    { name: 'Cruces en polea', category: 'Pecho' },
    { name: 'Press en máquina', category: 'Pecho' },
  ],
  'Espalda': [
    { name: 'Dominadas pronadas', category: 'Espalda' },
    { name: 'Dominadas supinas', category: 'Espalda' },
    { name: 'Dominadas lastradas', category: 'Espalda' },
    { name: 'Dominadas agarre neutro', category: 'Espalda' },
    { name: 'Remo con barra prono', category: 'Espalda' },
    { name: 'Remo Pendlay con barra', category: 'Espalda' },
    { name: 'Remo en polea baja agarre neutro', category: 'Espalda' },
    { name: 'Remo en polea baja agarre ancho', category: 'Espalda' },
    { name: 'Remo con mancuerna a una mano', category: 'Espalda' },
    { name: 'Jalón al pecho agarre ancho', category: 'Espalda' },
    { name: 'Jalón al pecho agarre cerrado', category: 'Espalda' },
    { name: 'Pullover en polea alta', category: 'Espalda' },
    { name: 'Peso muerto convencional', category: 'Espalda' },
    { name: 'Face pulls con cuerda', category: 'Espalda' },
  ],
  'Hombros': [
    { name: 'Press militar con barra', category: 'Hombros' },
    { name: 'Press militar con mancuernas', category: 'Hombros' },
    { name: 'Press Arnold', category: 'Hombros' },
    { name: 'Elevaciones laterales con mancuernas', category: 'Hombros' },
    { name: 'Elevaciones laterales en cable', category: 'Hombros' },
    { name: 'Elevaciones frontales con barra', category: 'Hombros' },
    { name: 'Elevaciones frontales con mancuernas', category: 'Hombros' },
    { name: 'Pájaros con mancuernas', category: 'Hombros' },
    { name: 'Face pulls con cuerda', category: 'Hombros' },
    { name: 'Remo al mentón con barra', category: 'Hombros' },
  ],
  'Bíceps': [
    { name: 'Curl con barra', category: 'Bíceps' },
    { name: 'Curl con barra EZ', category: 'Bíceps' },
    { name: 'Curl con mancuernas', category: 'Bíceps' },
    { name: 'Curl con mancuernas inclinado', category: 'Bíceps' },
    { name: 'Curl martillo bilateral', category: 'Bíceps' },
    { name: 'Curl martillo alternado', category: 'Bíceps' },
    { name: 'Curl en polea baja', category: 'Bíceps' },
    { name: 'Curl concentrado', category: 'Bíceps' },
    { name: 'Curl predicador', category: 'Bíceps' },
  ],
  'Tríceps': [
    { name: 'Press francés con barra EZ', category: 'Tríceps' },
    { name: 'Press francés con mancuernas', category: 'Tríceps' },
    { name: 'Extensiones de tríceps en polea', category: 'Tríceps' },
    { name: 'Extensiones sobre la cabeza con cuerda', category: 'Tríceps' },
    { name: 'Fondos para tríceps', category: 'Tríceps' },
    { name: 'Press cerrado con barra', category: 'Tríceps' },
    { name: 'Patada de tríceps con mancuerna', category: 'Tríceps' },
  ],
  'Piernas - Cuádriceps': [
    { name: 'Sentadilla con barra', category: 'Piernas - Cuádriceps' },
    { name: 'Sentadilla frontal', category: 'Piernas - Cuádriceps' },
    { name: 'Sentadilla búlgara con mancuernas', category: 'Piernas - Cuádriceps' },
    { name: 'Prensa a 45°', category: 'Piernas - Cuádriceps' },
    { name: 'Prensa a 45° pies altos', category: 'Piernas - Cuádriceps' },
    { name: 'Extensión de cuádriceps', category: 'Piernas - Cuádriceps' },
    { name: 'Zancadas con barra', category: 'Piernas - Cuádriceps' },
    { name: 'Zancadas con mancuernas', category: 'Piernas - Cuádriceps' },
    { name: 'Hack squat', category: 'Piernas - Cuádriceps' },
  ],
  'Piernas - Isquiotibiales': [
    { name: 'Peso muerto rumano', category: 'Piernas - Isquiotibiales' },
    { name: 'Peso muerto convencional', category: 'Piernas - Isquiotibiales' },
    { name: 'Curl femoral acostado', category: 'Piernas - Isquiotibiales' },
    { name: 'Curl femoral sentado', category: 'Piernas - Isquiotibiales' },
    { name: 'Buenos días con barra', category: 'Piernas - Isquiotibiales' },
  ],
  'Glúteos': [
    { name: 'Hip thrust con barra', category: 'Glúteos' },
    { name: 'Hip thrust en máquina', category: 'Glúteos' },
    { name: 'Peso muerto rumano', category: 'Glúteos' },
    { name: 'Sentadilla búlgara con mancuernas', category: 'Glúteos' },
    { name: 'Patada de glúteo en polea', category: 'Glúteos' },
    { name: 'Abducción de cadera en máquina', category: 'Glúteos' },
  ],
  'Pantorrillas': [
    { name: 'Elevaciones de pantorrilla de pie', category: 'Pantorrillas' },
    { name: 'Elevaciones de pantorrilla', category: 'Pantorrillas' },
    { name: 'Elevaciones de pantorrilla sentado', category: 'Pantorrillas' },
    { name: 'Elevaciones de pantorrilla en prensa', category: 'Pantorrillas' },
  ],
};

// Helper function to find category for an exercise
export function findExerciseCategory(exerciseName: string): string | null {
  for (const [category, exercises] of Object.entries(EXERCISE_CATEGORIES)) {
    if (exercises.some(ex => ex.name.toLowerCase() === exerciseName.toLowerCase())) {
      return category;
    }
  }
  return null;
}

// Helper function to get alternatives for an exercise
export function getExerciseAlternatives(exerciseName: string): ExerciseAlternative[] {
  const category = findExerciseCategory(exerciseName);
  if (!category) {
    // If no specific category found, return all exercises
    return Object.values(EXERCISE_CATEGORIES).flat();
  }
  return EXERCISE_CATEGORIES[category].filter(ex => ex.name !== exerciseName);
}
