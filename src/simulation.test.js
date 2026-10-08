import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate} from './simulation.js';
test('cas déterministe : débit, conservation et intégration exacte de l’occupation', () => {
 const {final,events}=simulate({arrival:6,service:5,servers:1,duration:60,distribution:'fixed',seed:42});
 assert.equal(final.entered,10); assert.equal(final.exited,9); assert.equal(final.wait,0); assert.equal(final.stay,5); assert.equal(final.utilization,75);
 for(const e of events) assert.equal(e.entered,e.exited+e.queue+e.busy);
});
test('saturation : la file augmente et les durées restent cohérentes', () => {
 const {final}=simulate({arrival:2,service:8,servers:1,duration:60,distribution:'fixed',seed:42});
 assert.equal(final.entered,30); assert.equal(final.exited,7); assert.equal(final.queue,22); assert.ok(final.wait>0); assert.ok(final.utilization<=100);
});
test('reproductibilité et comparaison avec des arrivées communes', () => {
 const a=simulate({seed:77}), b=simulate({seed:77}), c=simulate({seed:77,servers:2});
 assert.deepEqual(a,b); assert.equal(a.final.entered,c.final.entered); assert.ok(c.final.wait<=a.final.wait); assert.notDeepEqual(a,simulate({seed:78}));
 for(const e of c.events) assert.equal(e.entered,e.exited+e.queue+e.busy);
});
test('événements simultanés et borne de fin', () => {
 const {final}=simulate({arrival:5,service:5,servers:1,duration:20,distribution:'fixed'});
 assert.equal(final.wait,0); assert.equal(final.exited,3); assert.equal(final.busy,1);
});
test('paramètres invalides rejetés', () => {
 for(const x of [{arrival:0},{servers:1.5},{duration:Infinity},{distribution:'bad'}]) assert.throws(()=>simulate(x));
});
