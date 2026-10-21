# Sitebrief copy

Full copy for the current comparison screen. Dynamic labels and messages are included below. The submission description is in [sitebrief-devpost.md](sitebrief-devpost.md).

## Homepage

For restaurant owners & commercial realtors

**Compare locations for your restaurant.**

Enter your rent budget and the brands or places your customers might like. Compare locations and choose which one to investigate first.

No account needed · Try the sample

## Comparison mode

**Sample comparison**
The rents and scores are made up for this example. These locations are not advertised as available to rent.

Action: Use my locations

**Your locations**
Enter your locations and rents to request Qloo taste data.

Action: Reset example

## Form

**Describe your restaurant**

- Restaurant idea
- City or neighborhood
- Monthly rent budget
- Brands or places your customers might like

Enter 1–3 exact names, separated by commas. These choices describe the audience you hope to reach; they are assumptions about your customers.

**Locations to compare**
Use one currency for all rents.
Paste each location’s latitude and longitude from a map. Leave rent blank if you do not know it.

For each location: name, latitude, longitude, monthly rent.

Actions: Compare sample locations / Compare my locations
While loading: Comparing locations…

Sitebrief does not save your entries. For live comparisons, it sends the chosen brands, places, and locations to Qloo.

Loading message: Looking up Qloo taste scores and nearby restaurants. This can take up to 50 seconds.

## Map

**Location map**

Orange markers show your locations.
Before a comparison: Run a comparison to add taste scores to the map.
After a comparison: Green dots show sample/Qloo taste scores. Darker green means a stronger match within this comparison.

Action: Open larger map

Before results: **Compare your locations**
Run a comparison to see nearby taste scores, check rents against your budget, and review nearby restaurants.

After results: **Nearby restaurants · Within 1 km**
**Restaurants to review**
Qloo ranks this selected list using your chosen brands and places. Other competitors may be missing. Check the area in person.

Missing results: Nearby restaurants could not be loaded.
Empty results: No restaurants were found for this search. Check other sources before assuming the area has few competitors.
Missing restaurant score: Score unavailable.

## Results

**Your location comparison**
Sample data / Live Qloo data

**Where to start**
Start with [location]. It has the highest nearby taste score among locations within your rent budget. Check lease terms and operating costs before deciding.

Tied scores: The leading locations within your rent budget have the same taste score. Compare lease terms and operating costs to decide which to visit first.

No supported location: No location can be shortlisted yet. Each location needs a rent within your budget and a nearby Qloo score. Check the rents and scores below.

Higher scores show a stronger match to the brands and places you chose. Compare scores from this run only. A score does not predict sales.

Card labels:
- Nearby Qloo taste score
- Sample monthly rent / Monthly rent you entered
- Budget check: Within budget / Over budget / Rent missing
- Distance to the score’s map point
- Missing score: No score within 2 km
- Action: View on map

Actions: Copy comparison / Download comparison
Success: Comparison copied.
Copy failure: Copying is unavailable in this browser. Use Download comparison instead.

**What to check before signing a lease**
1. Confirm the rent, extra charges, lease terms, and permission to operate a restaurant.
2. Visit during your planned opening hours and count passersby. Check whether they are likely customers.
3. Check kitchen equipment, permits, renovation costs, and the sales needed to cover your costs.

Expandable sources: View data sources · [count] steps
Brands and places found in Qloo: [names and IDs]
Step status: Loaded / Unavailable · [count] results
Technical request paths and parameters remain visible in this expanded section.

## How the comparison works

**Understand the scores before choosing a location.**

Sitebrief compares nearby Qloo taste scores and the rents you enter. The brands and places you choose describe your intended audience. The restaurant idea is a label for your comparison; it does not change the scores.

Check foot traffic, lease terms, permits, and operating costs before deciding. Sitebrief does not verify available rentals, population figures, or likely sales.

Expandable section: **How scores and map data are used**

Each location uses the nearest point from the same Qloo map, up to 2 km away. Locations without a point in that range have no score. Sitebrief uses the score as returned, without estimating values between map points.

Qloo calls this score “affinity.” Higher values show a stronger taste match within this response. They are not percentages or predictions of restaurant success. The map displays up to 4,000 returned points; all returned points remain available for the comparison.

The nearby restaurant list covers selected results within 1 km, rather than every business in the area. Missing results do not prove that an area lacks competitors.

This hackathon prototype has not been tested with restaurant owners or realtors.

Link: Read the Qloo map documentation

Footer: Sitebrief / Restaurant location comparison
Built for the Qloo Agentic Hackathon · 2026

## Errors

- Timeout: The comparison took too long. Your entries are still here. Please try again.
- Comparison failure: We could not finish the comparison. Please try again.
- Live configuration missing: Live comparisons are not configured yet. Try the sample comparison for now.
- Qloo request failure: Qloo did not return the data for this step. Try again or use the sample comparison.
- Reference name unresolved: We could not find a single exact match for “[name]”. Check the name or choose another brand or place.
- No map data: Qloo returned no map scores for this area. Try another city or a different brand or place.
- Edited sample: The sample uses fixed New York locations. Choose Reset example to restore them, or use your own locations for a live comparison.
- Busy: Other comparisons are running. Please try again shortly.
- Entries too long: Your entries are too long. Shorten them and try again.

## Exported comparison

The download contains the restaurant idea, city, date, brands and places used, suggested starting location, and the same rent/score data shown on screen. It includes the method, lease checklist, source IDs, and request details for review.

Closing sample notice: This example uses sample rents and taste scores. The locations are not advertised as available to rent.
Closing custom notice: You supplied the locations and rents. Sitebrief has not verified them.

## What changed

Removed the “right corner” and “leap of faith” slogans. Replaced “raw taste affinity” with a defined taste score. Simplified form labels and recovery messages. Kept sample disclosures, score limits, calculation details, source IDs, and the existing decision rules.
