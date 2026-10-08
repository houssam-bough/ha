// File FIFO à événements discrets, sans perte, initialement vide.
// Arrivées et services utilisent des flux aléatoires séparés et reproductibles.
export function random(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function simulate({ arrival = 6, service = 5, servers = 1, duration = 480, distribution = 'exponential', seed = 42 } = {}) {
  if (![arrival, service, servers, duration, seed].every(Number.isFinite) || arrival < 1 || service < 1 || duration < 1 || duration > 1440 || servers < 1 || servers > 8 || !Number.isInteger(servers) || !['fixed','exponential'].includes(distribution)) throw new Error('Paramètres de simulation invalides.');
  const ra = random(seed), rs = random(seed ^ 0x9e3779b9);
  const sample = (mean, rng) => distribution === 'fixed' ? mean : -Math.log(1 - rng()) * mean;
  let time = 0, next = sample(arrival, ra), entered = 0, exited = 0, busyArea = 0, queueArea = 0, waits = 0, started = 0, stays = 0, maxQueue = 0;
  const workers = Array.from({length:servers}, () => null), queue = [], events = [];
  const snapshot = (label, kind) => ({time, label, kind, entered, exited, queue:queue.length, busy:workers.filter(Boolean).length, maxQueue, wait:started ? waits/started:0, stay:exited ? stays/exited:0, utilization:time ? busyArea/(time*servers)*100:0, averageQueue:time ? queueArea/time:0});
  events.push(snapshot('Système vide : début de l’expérience', 'start'));
  function advance(to) { const dt = to-time; busyArea += dt*workers.filter(Boolean).length; queueArea += dt*queue.length; time=to; }
  function dispatch() { for(let i=0;i<workers.length;i++) if(!workers[i] && queue.length) { const item=queue.shift(); waits+=time-item.arrived; started++; workers[i]={...item,end:time+item.service}; } }
  while(true) {
    const end=Math.min(...workers.map(x=>x?.end ?? Infinity));
    const at=Math.min(next,end);
    if(at>duration) break;
    advance(at);
    let label,kind;
    // Une fin de service est traitée avant une arrivée simultanée.
    if(end<=next) { const i=workers.findIndex(x=>x?.end===end); const item=workers[i]; workers[i]=null; exited++; stays+=time-item.arrived; label=`Item ${item.id} terminé · serveur ${i+1} libéré`; kind='departure'; dispatch(); }
    else { entered++; queue.push({id:entered,arrived:time,service:sample(service,rs)}); next=time+sample(arrival,ra); dispatch(); label=`Arrivée de l’item ${entered}${queue.length?' · mise en attente':' · prise en charge'}`; kind='arrival'; }
    maxQueue=Math.max(maxQueue,queue.length);
    events.push(snapshot(label,kind));
  }
  advance(duration);
  events.push(snapshot('Horizon atteint · fin de l’observation', 'end'));
  return {events, final:events.at(-1), config:{arrival,service,servers,duration,distribution,seed}};
}
