import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const TWEMOJI_BASE_URL = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

function toTwemojiUrl(emoji: string): string | null {
  const chars = Array.from(emoji.trim());
  if (chars.length === 0) {
    return null;
  }
  const codepoints = chars.map((char) => char.codePointAt(0)?.toString(16)).filter(Boolean);
  if (codepoints.length === 0) {
    return null;
  }
  return `${TWEMOJI_BASE_URL}/${codepoints.join('-')}.png`;
}

export type EmojiGridItem = {
  emoji: string;
  name: string;
};

export function EmojiGrid({ items }: { items: EmojiGridItem[] }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No seasonal items yet.</Text>;
  }

  return (
    <View style={styles.grid}>
      {items.map((item, index) => {
        return (
          <EmojiCell key={`${item.name}-${index}`} emoji={item.emoji} name={item.name} />
        );
      })}
    </View>
  );
}

function EmojiCell({ emoji, name }: EmojiGridItem) {
  const [imageFailed, setImageFailed] = useState(false);
  const twemojiUrl = toTwemojiUrl(emoji);

  return (
    <View style={styles.item}>
      <View style={styles.cell}>
        {!imageFailed && twemojiUrl ? (
          <Image source={{ uri: twemojiUrl }} style={styles.emojiImage} onError={() => setImageFailed(true)} />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  item: {
    width: '23.5%',
    gap: 6,
    alignItems: 'center'
  },
  cell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6
  },
  emoji: {
    fontSize: 32
  },
  emojiImage: {
    width: 32,
    height: 32
  },
  name: {
    fontSize: 12,
    color: '#223127',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  empty: {
    color: '#4E5A52'
  }
});
