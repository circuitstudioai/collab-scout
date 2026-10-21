# Sitebrief submission draft

Not submitted. Live Qloo workflow verified; Devpost human verification remains open.

Demo: https://collab-scout.vercel.app
Public MIT source: https://github.com/circuitstudioai/collab-scout

## Tagline
Compare restaurant locations by nearby taste scores and monthly rent.

## Inspiration
Restaurant owners need to compare locations before committing to a lease. Rent is one part of that decision. Understanding whether a location fits the intended audience needs separate evidence. We built Sitebrief to put those details side by side and show what still needs checking.

## What it does
A restaurant owner or commercial realtor enters 2–3 locations, a monthly rent budget, and brands or places the intended customers might like. Users can place locations on the map or enter coordinates directly. Sitebrief looks up those names in Qloo. If several records match, the user chooses the intended record by type and address before comparing.

The comparison shows a nearby taste score, the rent entered, and whether that rent fits the budget. Locations with missing rent or map data stay out of the shortlist. A tie stays a tie. Users can review nearby restaurants, inspect the data sources, and download the comparison.

## How we built it
The app uses Next.js, React, TypeScript, Zod, Leaflet, and OpenStreetMap. A server-side tool runs the Qloo searches, requests one shared taste map, and looks up nearby restaurants. The tool then checks the rent budget and compares the supported locations. An agent can call the same tool through its published JSON schema.

Each location uses the nearest returned map point within 2 km. The comparison uses Qloo's original score. No language model assigns scores or writes the recommendation. The app includes a labelled sample and reports live-data failures separately.

## How Qloo contributes
The live workflow uses Qloo to connect the chosen brands and places with geographic taste data. The scores and nearby restaurant results provide the comparison's taste information. Without those results, the tool cannot rank locations by taste.

A public-browser test on October 21 completed the live workflow with 1,553 returned map cells and eight nearby restaurants per site. These counts describe that test, not guaranteed coverage in every location.

## What we learned
A taste score does not tell an owner how many customers will visit. A short restaurant list does not show every competitor. We kept the rent check separate, showed missing data, and added a checklist for the work needed before signing a lease.

## Current limits
We have not interviewed restaurant owners or realtors. The app does not verify available rentals, rent quotes, foot traffic, population figures, permits, or likely sales. The sample rents, scores, and nearby restaurant entries are made up for the demo. Live API access works; coverage varies by area and audience reference. Human Devpost verification remains unresolved.

## Testing instructions
1. Open the hosted demo.
2. Select Compare sample locations.
3. Check that Williamsburg is over budget, even though it has the highest sample taste score.
4. Select each location on the map.
5. Expand View data sources.
6. Download the comparison.
7. Select Use my locations, compare, select the Blue Bottle Coffee record at 54 W 40th St, New York when prompted, then compare again.
8. Confirm that a failed live request shows an error without replacing the result with sample data.

## Submission gates

- [x] Live Qloo search, shared map, and nearby restaurant responses verified
- [x] Public sample and live journey verified without login
- [x] Public repository, source branch, and visible MIT license
- [x] Copy-pass screenshots updated to tested app source 8d359a1
- [ ] Devpost security verification and login completed
- [ ] Submission receipt and public project URL recorded
