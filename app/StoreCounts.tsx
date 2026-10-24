import type {StoreCount} from '@/lib/sites/store-counts';
/** Supplied server evidence only; this component never queries OSM from the browser. */
export default function StoreCounts({value}:{value:StoreCount}){
 return <section aria-label="Mapped venue context">
  <p><strong>{value.status==='available'&&value.count!==null?`${value.count} mapped ${value.categoryLabel} within 1 km`:'Mapped venue count unavailable'}</strong></p>
  <details><summary>Count method and limits</summary><p>{value.notice}</p></details>
  <small>{value.cached?'Reused count':'Retrieved'} {new Date(value.retrievedAt).toLocaleString('en-CA',{timeZone:'UTC'})} UTC. <a href={value.source.url} target="_blank" rel="noopener noreferrer">Inspect category query</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></small>
 </section>;
}
