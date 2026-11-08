import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent} from '../src/engine/content.js';
import {newState,explorationView,currentCard,transition} from '../src/engine/game.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {validScenarioSession} from '../src/engine/scenario-storage.js';
test('companion-gated lead stays unavailable until the scent is discovered',()=>{
 const data=blackwaterContent;
 const card=data.byId['bw-dog-trail'];
 assert.ok(card);
 let game=newState(data);game.locationId='location-1';
 assert.equal(explorationView(game,data).deferred>=1,true);
 assert.equal(card.conditions[0].id,'dog-scent-found');
 let session=newScenarioSession(blackwaterScenario,data);
 session=scenarioSessionTransition(session,{type:'move',locationId:'location-1'},blackwaterScenario,data);
 session=scenarioSessionTransition(session,{type:'recruitCompanion',revision:session.game.revision,companionId:'blackwater-dog'},blackwaterScenario,data);
 assert.equal(session.scenario.companion.activeId,'blackwater-dog');
 session=scenarioSessionTransition(session,{type:'useCompanionAbility',revision:session.game.revision,abilityId:'scent',trigger:'exploration'},blackwaterScenario,data);
 assert.equal(session.game.flags['dog-scent-found'],true);
 assert.equal(validScenarioSession(session,blackwaterScenario,data),true);
 assert.equal(explorationView(session.game,data).deferred,explorationView(game,data).deferred-1);
 const next=transition(session.game,{type:'draw',revision:session.game.revision},data,{scenarioClock:true,maxRounds:12,apPerRound:3});
 assert.ok(next!==session.game);
 assert.ok(currentCard(next,data));
});

test('lighthouse follow-up requires recorded dog trail, but ordinary route remains playable',()=>{
 const data=blackwaterContent;
 const dog=data.byId['bw-lighthouse-dog-trail'];
 const ordinary=data.byId['bw-lighthouse-salt'];
 assert.ok(dog);assert.ok(ordinary);
 let game=newState(data);game.locationId='location-5';
 assert.equal(dog.conditions[0].id,'dog-trail-recorded');
 assert.equal(ordinary.conditions.length,0);
 assert.equal(ordinary.choices[0].test.difficulty,9);
 assert.equal(data.refs.flags.includes('salt-route-known'),true);
 assert.equal(data.refs.flags.includes('dog-trail-recorded'),true);
});
