import type {ExploreBrief} from './explore';
/** Owner-specified new concept. Café references are resolved live on the server. */
export const demoBrief:ExploreBrief={city:'Toronto, Ontario, Canada',center:{latitude:43.6534817,longitude:-79.3839347},radiusKm:10,minimumPopularityPercentile:20,concept:'A new café with an indoor playground. Find areas to scout using popular Toronto cafés as audience references.',references:['Popular Toronto cafés — resolved live'],restaurant:{brandName:'New café with an indoor playground',format:'cafe',servicePeriod:'unspecified',pricePosition:'unspecified'},existingOutlets:[],minimumOutletDistanceKm:0};

/** Lead expansion scenario: a proposed Toronto entry, not a claim that the brand is already present. */
export const blueBottleBrief:ExploreBrief={city:'Toronto, Ontario, Canada',center:{latitude:43.6534817,longitude:-79.3839347},radiusKm:10,minimumPopularityPercentile:20,concept:'Scout Toronto areas for a proposed Blue Bottle specialty coffee café.',references:['Blue Bottle Coffee'],restaurant:{brandName:'Blue Bottle Coffee',format:'cafe',servicePeriod:'unspecified',pricePosition:'unspecified'},existingOutlets:[],minimumOutletDistanceKm:0};
