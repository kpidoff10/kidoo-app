/**
 * HtmlRenderer Component
 * Rend le contenu HTML TipTap en composants React Native
 */

import React from 'react';
import { View, Text } from 'react-native';

interface HtmlRendererProps {
  html: string;
  textColor?: string;
  backgroundColor?: string;
}

export function HtmlRenderer({
  html,
  textColor = '#000000',
  backgroundColor = 'transparent',
}: HtmlRendererProps) {
  if (!html) {
    return (
      <View style={{ backgroundColor, paddingVertical: 4 }}>
        <Text style={{ color: textColor, fontSize: 14 }}>
          Contenu non disponible
        </Text>
      </View>
    );
  }

  // Parse HTML et crée les éléments React Native
  function parseHtml(content: string, key: { current: number }): React.ReactNode[] {
    const result: React.ReactNode[] = [];

    // Remplace les entités HTML
    let html = content
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");

    // Remplace les balises de titre par des marqueurs
    html = html.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, '<<HEADING>>$1<</HEADING>>');
    // Remplace les balises hr
    html = html.replace(/<hr\s*\/?>/g, '<<HR>>');

    // Split par blocs (paragraphes, headings, hr)
    const blocks = html.split(/<\/p>|<\/h[1-6]>/);

    for (const block of blocks) {
      // Heading
      if (block.includes('<<HEADING>>')) {
        const headingContent = block
          .replace(/.*?<<HEADING>>/g, '')
          .replace(/<\/HEADING>>.*/g, '')
          .trim();
        if (headingContent) {
          const inlineElements = parseInline(headingContent, textColor, key);
          result.push(
            <Text
              key={key.current++}
              style={{
                color: textColor,
                fontSize: 16,
                fontWeight: '600',
                marginVertical: 10,
              }}
            >
              {inlineElements}
            </Text>
          );
        }
      }

      // Horizontal rule
      if (block.includes('<<HR>>')) {
        result.push(
          <View
            key={key.current++}
            style={{
              height: 1,
              backgroundColor: '#cccccc',
              marginVertical: 12,
            }}
          />
        );
      }

      // Normal paragraph
      const cleanPara = block
        .replace(/<p[^>]*>/g, '')
        .replace(/<<HEADING>>.*?<\/HEADING>>/g, '')
        .replace(/<<HR>>/g, '')
        .trim();

      if (cleanPara) {
        const inlineElements = parseInline(cleanPara, textColor, key);

        result.push(
          <Text
            key={key.current++}
            style={{
              color: textColor,
              fontSize: 14,
              marginVertical: 6,
              lineHeight: 20,
            }}
          >
            {inlineElements}
          </Text>
        );
      }
    }

    return result;
  }

  function parseInline(text: string, color: string, key: { current: number }): React.ReactNode {
    // Vérifie s'il y a du formattage
    const hasFormatting = /<(strong|b|em|i)[^>]*>/.test(text);

    if (!hasFormatting) {
      // Pas de formattage, retourner le texte nettoyé
      return text.replace(/<[^>]*>/g, '');
    }

    // Sinon parser et retourner les éléments
    return parseInlineWithFormatting(text, color, key);
  }

  function parseInlineWithFormatting(text: string, color: string, key: { current: number }): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let inStrong = false;
    let inItalic = false;
    let lastIndex = 0;

    // Regex pour toutes les balises (pas seulement strong/em)
    const regex = /<\/?[^>]*>/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const plainText = text.substring(lastIndex, match.index);
      if (plainText) {
        if (inStrong && inItalic) {
          parts.push(
            <Text key={key.current++} style={{ fontWeight: '600', fontStyle: 'italic' }}>
              {plainText}
            </Text>
          );
        } else if (inStrong) {
          parts.push(
            <Text key={key.current++} style={{ fontWeight: '600' }}>
              {plainText}
            </Text>
          );
        } else if (inItalic) {
          parts.push(
            <Text key={key.current++} style={{ fontStyle: 'italic' }}>
              {plainText}
            </Text>
          );
        } else {
          parts.push(plainText);
        }
      }

      const tag = match[0].toLowerCase();
      if (tag === '<strong>' || tag === '<b>') {
        inStrong = true;
      } else if (tag === '</strong>' || tag === '</b>') {
        inStrong = false;
      } else if (tag === '<em>' || tag === '<i>') {
        inItalic = true;
      } else if (tag === '</em>' || tag === '</i>') {
        inItalic = false;
      }
      // Tous les autres tags sont ignorés/supprimés

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    const remaining = text.substring(lastIndex);
    if (remaining) {
      if (inStrong && inItalic) {
        parts.push(
          <Text key={key.current++} style={{ fontWeight: '600', fontStyle: 'italic' }}>
            {remaining}
          </Text>
        );
      } else if (inStrong) {
        parts.push(
          <Text key={key.current++} style={{ fontWeight: '600' }}>
            {remaining}
          </Text>
        );
      } else if (inItalic) {
        parts.push(
          <Text key={key.current++} style={{ fontStyle: 'italic' }}>
            {remaining}
          </Text>
        );
      } else {
        parts.push(remaining);
      }
    }

    return parts;
  }

  const keyRef = { current: 0 };

  return (
    <View style={{ backgroundColor, paddingVertical: 4 }}>
      {parseHtml(html, keyRef)}
    </View>
  );
}
