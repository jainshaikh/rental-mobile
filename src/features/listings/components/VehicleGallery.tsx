import { useState } from 'react';
import { Dimensions, FlatList, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme';
import { AppText } from '../../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function VehicleGallery({ images, title }: { images: { url: string; altText: string | null }[]; title: string }) {
  const { colors, spacing } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  if (images.length === 0) {
    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          aspectRatio: 16 / 10,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText muted>No images available</AppText>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: SCREEN_WIDTH, aspectRatio: 16 / 10, backgroundColor: colors.surfaceAlt }}
            contentFit="cover"
            transition={150}
            accessibilityLabel={item.altText ?? title}
          />
        )}
      />
      {images.length > 1 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.xs,
            position: 'absolute',
            bottom: spacing.sm,
            width: '100%',
          }}
        >
          {images.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activeIndex ? colors.primary : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
