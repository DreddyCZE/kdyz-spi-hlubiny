import {createScenarioRegistry} from '../engine/scenario-registry.js';
import {blackwaterScenario} from './blackwater-scenario.js';
import {blackwaterContent} from '../engine/content.js';
import {blackwaterPrologue} from './blackwater-onboarding.js';
import {presentation} from './presentation.js';
export const scenarioRegistry=createScenarioRegistry([
 {scenario:blackwaterScenario,content:blackwaterContent,presentation,locations:presentation.locations,intro:blackwaterPrologue,clockDisplayId:'tide-bells',investigatorName:'Eleanor Whitmore'}
]);
export const activeScenarioPack=scenarioRegistry.first();
