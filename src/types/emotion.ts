/**
 * Types pour le système d'émotions/animations du Kidoo Gotchi
 */

// Types de triggers automatiques disponibles
export type TriggerType =
  | 'manual' // Pas de déclenchement automatique
  // Hunger triggers
  | 'hunger_critical' // Hunger ≤ 10%
  | 'hunger_low' // Hunger ≤ 20%
  | 'hunger_medium' // Hunger entre 40-60%
  | 'hunger_full' // Hunger ≥ 90%
  // Manger (un seul trigger, variants = Biberon / Gâteau / Pomme / Bonbon)
  | 'eating'
  // Happiness triggers
  | 'happiness_low' // Happiness ≤ 20%
  | 'happiness_medium' // Happiness entre 40-60%
  | 'happiness_high' // Happiness ≥ 80%
  // Health triggers
  | 'health_critical' // Health ≤ 20%
  | 'health_low' // Health ≤ 40%
  | 'health_good' // Health ≥ 80%
  // Fatigue triggers
  | 'fatigue_high' // Fatigue ≥ 80%
  | 'fatigue_low' // Fatigue ≤ 20%
  // Hygiene triggers
  | 'hygiene_low' // Hygiene ≤ 20%
  | 'hygiene_good'; // Hygiene ≥ 80%

// Labels pour le menu déroulant
export const TRIGGER_OPTIONS: Array<{ value: TriggerType; label: string; description: string }> = [
  {
    value: 'manual',
    label: 'Manuel',
    description: 'Pas de déclenchement automatique',
  },
  // Hunger
  {
    value: 'hunger_critical',
    label: 'Faim critique',
    description: 'Quand la faim est ≤ 10%',
  },
  {
    value: 'hunger_low',
    label: "J'ai faim",
    description: 'Quand la faim est ≤ 20%',
  },
  {
    value: 'hunger_medium',
    label: 'Faim moyenne',
    description: 'Quand la faim est entre 40-60%',
  },
  {
    value: 'hunger_full',
    label: 'Rassasié',
    description: 'Quand la faim est ≥ 90%',
  },
  // Manger (mêmes variants que la faim)
  {
    value: 'eating',
    label: 'Mange',
    description: 'Manger (Biberon, Gâteau, Pomme, Bonbon)',
  },
  // Happiness
  {
    value: 'happiness_low',
    label: 'Triste',
    description: 'Quand le bonheur est ≤ 20%',
  },
  {
    value: 'happiness_medium',
    label: 'Content',
    description: 'Quand le bonheur est entre 40-60%',
  },
  {
    value: 'happiness_high',
    label: 'Très heureux',
    description: 'Quand le bonheur est ≥ 80%',
  },
  // Health
  {
    value: 'health_critical',
    label: 'Très malade',
    description: 'Quand la santé est ≤ 20%',
  },
  {
    value: 'health_low',
    label: 'Malade',
    description: 'Quand la santé est ≤ 40%',
  },
  {
    value: 'health_good',
    label: 'En bonne santé',
    description: 'Quand la santé est ≥ 80%',
  },
  // Fatigue
  {
    value: 'fatigue_high',
    label: 'Très fatigué',
    description: 'Quand la fatigue est ≥ 80%',
  },
  {
    value: 'fatigue_low',
    label: 'Bien reposé',
    description: 'Quand la fatigue est ≤ 20%',
  },
  // Hygiene
  {
    value: 'hygiene_low',
    label: 'Sale',
    description: 'Quand la propreté est ≤ 20%',
  },
  {
    value: 'hygiene_good',
    label: 'Propre',
    description: 'Quand la propreté est ≥ 80%',
  },
];

// Action sur une frame spécifique
export interface FrameAction {
  type: 'vibration' | 'led';
  effect?: string;
  color?: string;
}

// Timeline d'une frame
export interface FrameTimeline {
  sourceFrameIndex: number;
  actions?: FrameAction[];
}

// Phase d'une émotion (intro, loop, exit)
export interface EmotionPhase {
  frames: number;
  timeline: FrameTimeline[];
}

// Phases complètes d'une émotion
export interface EmotionPhases {
  intro: EmotionPhase;
  loop: EmotionPhase;
  exit: EmotionPhase;
}

// Vidéo d'une émotion
export interface EmotionVideo {
  emotion_videoId: string;
  fps: number;
  width: number;
  height: number;
  totalFrames: number;
  durationS: number;
  phases: EmotionPhases;
}

// Structure complète d'une émotion
export interface Emotion {
  key: string; // Identifiant unique (ex: "hungry_1", "eating_2")
  trigger: TriggerType; // Type de déclenchement automatique
  emotionId: string; // UUID
  emotion_videos: EmotionVideo[];
}

// Structure du config.json complet
export type EmotionsConfig = Emotion[];
