# Mapped venue-count pilot checkpoint

Status: descriptive pilot, not census validation. Five known Toronto points queried from the Gateway all timed out (count `null`, not zero). A separate hosted Blue Bottle run returned **27 mapped cafés** for the Broadview North point (43.685074, -79.34807) at 2026-10-23T23:34:59.812Z; its other two counts were unavailable. This proves the hosted transport can return real counts, not mapping completeness or production reliability.

The final implementation batches the three shortlist points into one public-provider union query, assigns returned point/way centres within 1 km to each target, caches successful counts for 15 minutes and retains failures as unavailable. The automated tests verify assignment and deduplication. A later hosted union-query run also timed out for all three points at the twelve-second bound; it did not block its four-field cited research. Mapping completeness and reliable count availability remain unproven.
## Evidence contract

- `retrieveStoreCount(point, format, signal?)` accepts `{id, latitude, longitude}` and returns `StoreCount` with matching target, category, 1,000 m radius, availability, nullable count, retrieval date, query link and coverage notice.
- Café format queries OSM `amenity=cafe`; full-service queries `amenity=restaurant`; fast-casual queries `amenity=restaurant|fast_food`. These are category proxies, not exact competitors. Café listings cannot establish indoor-playground competition.
- Unsupported formats and HTTP, runtime/partial, malformed, cancelled or timed-out results return `unavailable` with `count:null`. A completed empty response alone produces zero.
- Fixed Overpass endpoint: `https://overpass.private.coffee/api/interpreter`. Single-point helper: query timeout five seconds / request timeout seven seconds. Shortlist union query: ten seconds / twelve seconds, alongside agent research. Successful responses are reused for 15 minutes, with at most 60 process-local entries. Reuse preserves the original retrieval date and target coordinates. Public-provider outages must not block the scouting decision.
- Deduplicate identical OSM type/ID and explicitly member-linked, same-name/category node/way representations. Nearby same-name branches stay separate. Relation/way duplication and incomplete tagging remain possible.
- Exclude explicit disused/abandoned/demolished/removed/construction, closed and private tags. Absence of those tags does not establish current operation. Polygon centres and incomplete tagging can affect radius/category counts.
- `formatStoreCount` provides the same caution for exports. `StoreCounts` renders supplied values only, with query inspection and OpenStreetMap attribution. Neither count nor retrieval changes the Qloo ranking or establishes unmet demand.

## Implementation verification

- Focused Jest regressions cover category counting, duplicate representation, adjacent branches, malformed/partial output, zero versus failure, unsupported/cancelled requests, success-cache provenance and one-query shortlist assignment.
- Provider counts never affect ranking, eligibility or the Scout/Maybe verdict. The interface places Qloo taste evidence alongside counts, but does not call affinity demand.
- No claim of competitor census coverage, exhaustive entity deduplication or current operating status is made.

## Official reference links

- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Overpass QL](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)

The [public instance list](https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances) lists Private.coffee as allowing use in any project. Public endpoints have no reliability guarantee. One bounded union query per shortlist plus caching avoids parallel public-provider calls. No paid service was provisioned.
