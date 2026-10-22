import {z} from 'zod';
import {exploreCity,exploreSchema} from './explore';
import {compareSites} from './compare';
import {briefSchema,type Trace} from './schema';
import {researchArea,researchSchema} from './research';
import {profileAudience} from './profile';
import {resolveReferences,createReader} from './qloo';
import {runScout} from './scout-agent';
const audienceSchema=exploreSchema.pick({references:true,referenceSelections:true});
export const mcpTools=[
 {name:'explore_restaurant_areas',description:'Find real Qloo taste/popularity-contrast points within an operator radius and outlet rules. Not demand or property availability.',schema:exploreSchema},
 {name:'compare_restaurant_sites',description:'Compare supplied restaurant sites with Qloo evidence and operator rents. Sample mode is explicitly fixed and disclosed.',schema:briefSchema},
 {name:'audience_profile',description:'Read Qloo taste tags, signed demographic affinity and related brands for resolved audience references. Not a local census.',schema:audienceSchema},
 {name:'research_restaurant_area',description:'Search public web sources for restaurant scouting trade-offs. Returns real grounding citations; no source-free fallback.',schema:researchSchema},
 {name:'scout_restaurant_city',description:'Run the bounded Gemini Site Scout tool loop: explore Qloo, profile the audience, compare a venue, research an eligible area, and return an evidence-linked scouting brief. Can take up to 150 seconds.',schema:exploreSchema},
];
export function listMcpTools(){return mcpTools.map(t=>({name:t.name,description:t.description,inputSchema:z.toJSONSchema(t.schema),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:true}}));}
export async function callMcpTool(name:string,args:unknown){
 switch(name){
  case 'explore_restaurant_areas':return exploreCity(exploreSchema.parse(args));
  case 'compare_restaurant_sites':return compareSites(briefSchema.parse(args));
  case 'audience_profile':{const input=audienceSchema.parse(args);const trace:Trace[]=[];const references=await resolveReferences(input,createReader(trace));const profile=await profileAudience(references);return {...profile,trace:[...trace,...profile.trace]};}
  case 'research_restaurant_area':return researchArea(researchSchema.parse(args));
  case 'scout_restaurant_city':return runScout(exploreSchema.parse(args),()=>{});
  default:throw new Error('Unknown tool');
 }
}
