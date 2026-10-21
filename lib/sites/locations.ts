export type LocationMatch = { id: string; name: string; label: string; latitude: number; longitude: number; kind: string };
type Row = Record<string, unknown>;
const row = (value: unknown): Row => value && typeof value === 'object' ? value as Row : {};
export function parseLocations(raw: unknown): LocationMatch[] {
  const features = row(raw).features;
  if (!Array.isArray(features)) return [];
  return features.flatMap(feature => {
    const item = row(feature), properties = row(item.properties), coordinates = row(item.geometry).coordinates;
    if (!Array.isArray(coordinates) || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number' || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1]) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 85) return [];
    const street = [properties.housenumber, properties.street].filter(v => typeof v === 'string').join(' ');
    const parts = [properties.name, street, properties.city, properties.state, properties.country].filter((v): v is string => typeof v === 'string' && v.length > 0);
    const label = [...new Set(parts)].join(', ');
    if (!label) return [];
    return [{ id: `${properties.osm_type ?? 'point'}:${properties.osm_id ?? coordinates.join(',')}`, name: typeof properties.name === 'string' ? properties.name : street || label, label, longitude: coordinates[0], latitude: coordinates[1], kind: typeof properties.type === 'string' ? properties.type : 'place' }];
  }).slice(0, 5);
}
