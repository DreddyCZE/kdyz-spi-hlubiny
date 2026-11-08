import {createScenarioRegistry} from '../engine/scenario-registry.js';
import {blackwaterScenario} from './blackwater-scenario.js';
import {content} from '../engine/content.js';
import {presentation} from './presentation.js';
export const scenarioRegistry=createScenarioRegistry([
 {scenario:blackwaterScenario,content,presentation,locations:presentation.locations,clockDisplayId:'tide-bells',investigatorName:'Eleanor Whitmore'}
]);
export const activeScenarioPack=scenarioRegistry.first();
