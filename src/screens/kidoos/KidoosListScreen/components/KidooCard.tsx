/**
 * Carte Kidoo — dispatche vers la carte spécifique au modèle.
 */

import React from 'react';
import { Kidoo } from '@/api';
import { BasicKidooCard } from './BasicKidooCard';
import { DreamKidooCard } from './DreamKidooCard';

export interface KidooCardProps {
  kidoo: Kidoo;
  onPress: () => void;
  /** Incrémenté par la liste au pull-to-refresh pour relancer get-info dans chaque carte */
  refreshTrigger?: number;
}

export function KidooCard({ kidoo, onPress, refreshTrigger }: KidooCardProps) {
  switch (kidoo.model) {
    case 'dream':
      return <DreamKidooCard kidoo={kidoo} onPress={onPress} refreshTrigger={refreshTrigger} />;
    case 'basic':
    default:
      return <BasicKidooCard kidoo={kidoo} onPress={onPress} refreshTrigger={refreshTrigger} />;
  }
}
