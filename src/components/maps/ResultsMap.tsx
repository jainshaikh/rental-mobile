import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../theme';
import type { Coords } from '../../hooks/useCurrentLocation';

interface ResultsMapProps {
  userLocation: Coords;
  radiusKm: number;
  pins: { id: string; lat: number; lng: number; title?: string }[];
}

// Mirrors web's ResultsMap: a marker for the user's location, a circle showing
// the active search radius, and one marker per result with map coordinates.
export function ResultsMap({ userLocation, radiusKm, pins }: ResultsMapProps) {
  const { radii } = useTheme();
  // Roughly fit the search radius in view (1 degree of latitude =~ 111km).
  const delta = Math.max((radiusKm / 111) * 2.4, 0.02);

  return (
    <View style={[styles.container, { borderRadius: radii.card }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
      >
        <Marker
          coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
          title="Your location"
          pinColor="blue"
        />
        <Circle
          center={{ latitude: userLocation.lat, longitude: userLocation.lng }}
          radius={radiusKm * 1000}
          strokeColor="rgba(255,78,100,0.5)"
          fillColor="rgba(255,78,100,0.12)"
        />
        {pins.map((pin) => (
          <Marker key={pin.id} coordinate={{ latitude: pin.lat, longitude: pin.lng }} title={pin.title} />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    overflow: 'hidden',
  },
});
