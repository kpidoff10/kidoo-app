/**
 * Carte Kidoo pour le modèle Basic
 */

import React from 'react';
import { BaseKidooCard } from './BaseKidooCard';
import { Kidoo } from '@/api';

interface BasicKidooCardProps {
  kidoo: Kidoo;
  onPress: () => void;
  refreshTrigger?: number;
}

export function BasicKidooCard({ kidoo, onPress, refreshTrigger }: BasicKidooCardProps) {
  return <BaseKidooCard kidoo={kidoo} onPress={onPress} refreshTrigger={refreshTrigger} />;
}
