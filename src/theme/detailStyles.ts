/**
 * Styles partagés des écrans de détail Kidoo (Dream, Basic, etc.)
 */

import { StyleSheet } from 'react-native';

export const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  // Sticky header (ex. Dream : mode + env)
  stickyHeader: {},
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Carte type "mode" (icône + label)
  modeCard: {
    marginBottom: 0,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeText: {
    fontSize: 16,
  },
  // Bloc env (température / humidité)
  envRow: {},
  envValues: {
    flexDirection: 'row',
    gap: 16,
  },
});
