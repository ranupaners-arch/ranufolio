/** End-to-end checks using Chromium's native DevTools protocol (no test dependencies). */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';

const dist = resolve('dist');
const artifacts = process.env.PIXEL_PET_ARTIFACTS || join(tmpdir(), 'ranufolio-pet-v2-qa');
await mkdir(artifacts, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(dist, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(dist + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let ws;
let target;
let debugURL = process.env.PIXEL_PET_CDP_URL;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pending = new Map();
const errors = [];
const failures = [];
const passed = [];
const patrols = [];
let id = 0;
let send;
let evaluate;
const pass = name => { passed.push(name); console.log('PASS', name); };

try {
  if (!debugURL) {
    const profile = await mkdtemp(join(tmpdir(), 'ranufolio-pet-browser-'));
    browser = spawn(process.env.CHROME_BIN || '/usr/bin/chromium', ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
    browser.on('error', error => errors.push(error.message));
    for (let i = 0; i < 100; i++) {
      try { debugURL = 'http://127.0.0.1:' + (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await sleep(100); }
    }
    assert.ok(debugURL, 'Chromium must be installed; set CHROME_BIN if needed.');
  }
  target = await fetch(`${debugURL}/json/new?about:blank`, { method: 'PUT' }).then(r => r.json());
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, reject) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  ws.addEventListener('message', ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) {
      const p = pending.get(m.id); if (!p) return;
      pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(m.error) : p.resolve(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
    if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(origin) && m.params.response.status >= 400) failures.push(m.params.response.url);
  });
  send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    const timer = setTimeout(() => { pending.delete(n); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(n, { resolve, reject, timer }); ws.send(JSON.stringify({ id: n, method, params }));
  });
  evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Page.bringToFront');
  const waitFor = async (expression, timeout = 16000) => {
    const until = Date.now() + timeout;
    do { if (await evaluate(expression)) return; await sleep(40); } while (Date.now() < until);
    throw new Error(`Timed out: ${expression}\n${JSON.stringify(await inspect())}`);
  };
  const inspect = () => evaluate(`(()=>{
    const h=document.querySelector('[data-pet]'),a=h.querySelector('[data-pet-actor]'),b=h.querySelector('button'),e=h.querySelector('[data-pet-eyes]');
    const r=b.getBoundingClientRect(), root=h.closest('[data-carousel]').getBoundingClientRect();
    return {mode:h.dataset.mode,visual:h.dataset.visual,card:+h.dataset.card,x:+h.dataset.x,y:+h.dataset.y,face:h.dataset.facing,angle:+a.dataset.angle,behind:a.dataset.behind==='true',plane:a.parentElement.dataset.petBack!==undefined?'back':'front',frame:h.querySelector('[data-pet-frame]').dataset.frame,eyes:e.style.transform,expression:e.dataset.expression,layerHidden:h.querySelector('[data-pet-layers]').hidden,spriteHidden:h.querySelector('[data-pet-frame]').hidden,particles:h.querySelectorAll('.pet-particle').length,bubble:!h.querySelector('[data-pet-sleep]').hidden,hit:{x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height,receives:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b},width:parseFloat(h.style.getPropertyValue('--pet-width')),height:parseFloat(h.style.getPropertyValue('--pet-height')),root:{x:root.x,y:root.y},cards:[...document.querySelectorAll('[data-project-tile] > a')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x-root.x,y:r.y-root.y,width:r.width,height:r.height}})};
  })()`);
  const screenshot = async name => { const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 90 }); await writeFile(join(artifacts, name + '.webp'), Buffer.from(shot.data, 'base64')); };
  const mouse = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const click = async () => {
    let p = await inspect(); assert.ok(p.hit.width > 0 && p.hit.height > 0);
    await mouse(p.hit.x, p.hit.y); await sleep(40); p = await inspect(); assert.ok(p.hit.receives, 'Actual click target must be the pet button');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, x: p.hit.x, y: p.hit.y });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: p.hit.x, y: p.hit.y });
  };
  const play = (action, direction) => evaluate(`document.querySelector('[data-pet]').play(${JSON.stringify(action)},${direction ?? 'undefined'})`);
  const open = async (path = '/') => {
    await send('Page.navigate', { url: origin + path });
    await waitFor(`location.pathname===${JSON.stringify(path)} && !!document.querySelector('[data-pet-button]:not([hidden])')`);
    await evaluate('document.fonts.ready');
    await evaluate(`document.querySelector('#work').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(150);
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  // Regression: observe normal behavior, without play(), synthetic activity, or scrolling.
  // The previous checks proved flight mechanics but could not catch a starved autonomous tour.
  for(const [width,height,path,name] of [[1280,900,'/','desktop'],[390,844,'/','mobile'],[1280,900,'/ar/','rtl']]) {
    await send('Page.navigate',{url:'about:blank'});await sleep(100);
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<640});
    await open(path);
    await evaluate(`window.patrol=[];window.autoModes=[];window.autoSeen={hideOccluded:false,climbRotated:false};window.watchPatrol=true;window.patrolStarted=performance.now();document.querySelector('[data-pet]').addEventListener('pixel-pet:mode',e=>autoModes.push({mode:e.detail.mode,ms:Math.round(performance.now()-patrolStarted)}));function watch(){const h=document.querySelector('[data-pet]'),card=+h.dataset.card,a=h.querySelector('[data-pet-actor]'),b=h.querySelector('button');if(!patrol.length||patrol.at(-1).card!==card)patrol.push({card,ms:Math.round(performance.now()-patrolStarted),mode:h.dataset.mode});if(h.dataset.mode==='hide'&&a.parentElement.hasAttribute('data-pet-back')&&b.offsetHeight<parseFloat(h.style.getPropertyValue('--pet-height'))/2)autoSeen.hideOccluded=true;if(h.dataset.mode==='climb'&&Math.abs(+a.dataset.angle)>85)autoSeen.climbRotated=true;if(watchPatrol)requestAnimationFrame(watch)}watch()`);
    await waitFor('autoSeen.hideOccluded',9000);await screenshot('auto-hide-'+name);
    let result;
    if(width<640){
      // HP: carousel tidak boleh digeser kamera sebelum ada interaksi, jadi pet hanya berpatroli di card yang terlihat.
      await waitFor('performance.now()-patrolStarted>7500',9000);
      result=await evaluate(`({cards:patrol,scroll:document.querySelector('[data-track]').scrollLeft,camera:document.querySelector('[data-track]').dataset.petCamera||'',overflow:document.documentElement.scrollWidth>innerWidth})`);
      assert.equal(result.scroll,0,'Mobile carousel must start at scrollLeft 0 and stay there before user interaction');
      assert.notEqual(result.camera,'following','Pet camera must not follow before user interaction on mobile');
      assert.deepEqual([...new Set(result.cards.map(p=>p.card))],[0],'Mobile pet must stay on the visible card before user interaction');
      assert.ok(!result.overflow);
      await screenshot('tour-'+name);
      pass(`Autonomous ${name} patrol keeps carousel at scrollLeft 0 before user interaction`);
    } else {
    await waitFor(`new Set(patrol.map(p=>p.card)).size===document.querySelectorAll('[data-project-tile]').length`,11000);
    result=await evaluate(`({cards:patrol,scroll:document.querySelector('[data-track]').scrollLeft,overflow:document.documentElement.scrollWidth>innerWidth})`);
    assert.deepEqual(result.cards.slice(0,3).map(p=>p.card),[0,1,2]);
    assert.ok(result.cards.at(-1).ms<11000,'Visit all cards before the inactivity sleep deadline');
    assert.ok(Math.abs(result.scroll)>10,'Carousel must follow visits to previously hidden cards');
    assert.ok(!result.overflow);
    await screenshot('tour-'+name);
    pass(`Autonomous ${name} patrol: cards 1 → 2 → 3 without play(), swipe, or user activity`);
    }
    await waitFor('autoSeen.climbRotated',5000);await screenshot('auto-climb-'+name);
    await waitFor(`document.querySelector('[data-pet]').dataset.mode==='sleep'`,6500);
    const behavior=await evaluate(`watchPatrol=false;({modes:autoModes,seen:autoSeen,elapsed:Math.round(performance.now()-patrolStarted)})`);
    const completed=mode=>behavior.modes.some((entry,i)=>{const next=behavior.modes[i+1];return entry.mode===mode&&next?.mode==='idle'&&next.ms-entry.ms>=(mode==='hide'?3900:3100)});
    assert.ok(completed('hide'),'Automatic hide must finish before another activity can replace it');
    assert.ok(completed('climb'),'Automatic climb must finish before another activity can replace it');
    assert.ok(behavior.elapsed<15500,'Behavior scheduling must preserve the inactivity sleep deadline');
    patrols.push({width,path,...result,...behavior});
    pass(`Autonomous ${name} hide + climb complete without forced modes, then sleep within 10–15s`);
  }
  await send('Page.navigate',{url:'about:blank'});await sleep(100);
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await open();
  // Keyboard focus holds the pet still while real pointer events exercise all eye directions.
  await evaluate(`document.querySelector('[data-pet-button]').focus()`);
  const p = await inspect();
  const eyeResults = [];
  for (const [dx, dy] of [[-160,0],[160,0],[0,-90],[0,160],[160,120]]) {
    const x = Math.max(3, p.root.x + p.x + dx), y = Math.max(3, p.root.y + p.y + dy);
    await mouse(x, y); await sleep(280);
    const result = await inspect();
    const [ex,ey] = result.eyes.match(/-?\d+(?:\.\d+)?/g).map(Number);
    if(dx) assert.equal(Math.sign(ex), Math.sign(dx)); if(dy) assert.equal(Math.sign(ey), Math.sign(dy));
    assert.ok(Math.abs(ex) <= 2.51 && Math.abs(ey) <= 2.51); eyeResults.push([ex,ey]);
  }
  await mouse(p.root.x + p.x + 15, p.root.y + p.y + 8); await sleep(120);
  assert.equal((await inspect()).expression, 'squint');
  await mouse(5, 80);
  await waitFor(`document.querySelector('[data-pet-eyes]').dataset.expression==='closed'`, 6500);
  await waitFor(`document.querySelector('[data-pet-eyes]').dataset.expression==='open'`, 1000);
  await screenshot('desktop');
  pass('Original WebP layers, bounded interpolated eyes in five directions, squint and automatic blink');

  await click(); await sleep(50);
  let current = await inspect(); assert.equal(current.mode, 'react'); assert.equal(current.expression, 'surprised'); assert.equal(current.particles, 12);
  await screenshot('reaction');
  await sleep(350); current = await inspect(); assert.equal(current.visual, 'atlas'); assert.ok(current.layerHidden && !current.spriteHidden);
  await click(); await sleep(40); assert.equal((await inspect()).particles, 12);
  await waitFor(`document.querySelector('[data-pet]').dataset.mode==='idle'`, 1500);
  await evaluate(`document.querySelector('[data-pet-button]').focus()`);
  for (const [key, code, virtual, text] of [['Enter','Enter',13,'\r'],[' ','Space',32,' ']]) {
    await send('Input.dispatchKeyEvent', { type:'keyDown',key,code,windowsVirtualKeyCode:virtual,text,unmodifiedText:text });
    await send('Input.dispatchKeyEvent', { type:'keyUp',key,code,windowsVirtualKeyCode:virtual });
    assert.equal((await inspect()).mode, 'react'); await sleep(900);
  }
  pass('Real mouse clicks, rapid clicks, surprise + small hop + 12 particles, Enter and Space');

  await evaluate(`document.querySelector('[data-pet-button]').blur()`); await mouse(5,80);
  await play('walk',1); await sleep(120); const rightA = await inspect(); await sleep(450); const rightB = await inspect();
  assert.ok(rightB.x-rightA.x > 20 && rightB.x-rightA.x < 45); assert.equal(rightB.face,'right'); assert.match(rightB.frame,/walk_right/);
  await play('walk',-1); await sleep(100); const leftA = await inspect(); const feet = new Set([leftA.frame]);
  for(let i=0;i<4;i++){await sleep(70);feet.add((await inspect()).frame);} const leftB = await inspect();
  assert.ok(leftB.x<leftA.x); assert.equal(leftB.face,'left'); assert.match(leftB.frame,/walk_left/); assert.ok(feet.size>1);
  pass('70px/sec walks, both travel directions, corresponding animated feet and facing');

  // Keep user activity alive during the longer trips; switch it off for the inactivity test.
  let pulse = false;
  let awake = setInterval(()=>{pulse=!pulse;void mouse(pulse?5:7,80);},1500);
  try {
    await evaluate(`window.flight=[];window.recordFlight=true;function record(){const h=document.querySelector('[data-pet]');if(h.dataset.mode==='jump')flight.push({x:+h.dataset.x,y:+h.dataset.y});if(recordFlight)requestAnimationFrame(record)}record()`);
    const source = (await inspect()).card;
    await play('jump'); await waitFor(`document.querySelector('[data-pet]').dataset.mode==='jump'`,16000);
    await sleep(240); await screenshot('jump');
    // A real click during a flight suspends it and safely resumes the same trajectory.
    await click(); await sleep(40); assert.equal((await inspect()).mode,'react'); await sleep(900);
    await waitFor(`+document.querySelector('[data-pet]').dataset.card!==${source}`,3500);
    current=await inspect();const card=current.cards[current.card];
    assert.ok(Math.abs(current.y+current.height/2-card.y)<1.1,'Feet land on the actual card edge');
    const flight=await evaluate('recordFlight=false;flight');
    assert.ok(flight.length>8);assert.ok(Math.min(...flight.map(f=>f.y))<card.y-current.height/2-5);
    assert.ok(flight.slice(1).every((f,i)=>Math.abs(f.x-flight[i].x)<65),'No teleport between adjacent flight frames');
    pass('Curved inter-card jump, exact landing, squash/stretch, click interruption and safe resume');

    await play('climb'); await waitFor(`document.querySelector('[data-pet]').dataset.mode==='climb'`,17000);
    await sleep(900);current=await inspect();assert.ok(Math.abs(current.angle)>85);assert.match(current.frame,/walk_/);
    const cy=current.y;await screenshot('climb');await sleep(350);assert.ok(Math.abs((await inspect()).y-cy)>2);
    await click();await sleep(40);assert.equal((await inspect()).mode,'react');
    await waitFor(`document.querySelector('[data-pet]').dataset.mode==='climb'`,1500);
    await waitFor(`document.querySelector('[data-pet]').dataset.mode==='idle'`,4500);
    assert.ok(Math.abs((await inspect()).angle)<0.1);
    pass('90-degree climb down/up with animated feet, interruption, and upright return');

    await play('hide');await waitFor(`document.querySelector('[data-pet]').dataset.mode==='hide'`,17000);
    await sleep(1100);current=await inspect();assert.ok(current.behind);assert.equal(current.plane,'back');
    assert.ok(current.hit.height<current.height && current.hit.height>0,'Only the exposed head receives clicks');
    await screenshot('hide');
    const linkReceives=await evaluate(`(()=>{const h=document.querySelector('[data-pet]'),card=[...document.querySelectorAll('[data-project-tile] > a')][+h.dataset.card],r=card.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+30)?.closest('[data-project-tile] > a')})()`);
    assert.ok(linkReceives,'The hiding pet does not steal the card link');
    await click();await sleep(40);assert.equal((await inspect()).mode,'react');
    await waitFor(`document.querySelector('[data-pet]').dataset.mode==='hide'`,1500);
    await waitFor(`document.querySelector('[data-pet]').dataset.mode==='idle'`,4500);
    pass('Real occlusion behind a card, peeking, exposed-head click area, unobstructed project link');
  } finally { clearInterval(awake); }

  await evaluate(`document.querySelector('[data-pet-button]').focus()`);await mouse(5,80);
  await waitFor(`document.querySelector('[data-pet]').dataset.mode==='sleep'`,14500);
  await sleep(450);current=await inspect();assert.equal(current.expression,'closed');assert.ok(current.bubble);await screenshot('sleep');
  await mouse(12,85);await sleep(100);assert.notEqual((await inspect()).mode,'sleep');
  pass('Automatic sleep within 10–15 seconds, closed eyes + zZ + breathing, wake on input');

  await evaluate(`document.querySelector('[data-pet-button]').blur()`);await mouse(5,80);
  await play('walk',-1);await sleep(180);
  await evaluate(`window.scrollTo({top:document.body.scrollHeight,behavior:'instant'})`);await sleep(200);
  const offscreenX=(await inspect()).x;await sleep(450);assert.equal((await inspect()).x,offscreenX);
  await evaluate(`document.querySelector('#work').scrollIntoView({block:'start',behavior:'instant'})`);await sleep(120);
  const background=await send('Target.createTarget',{url:'about:blank'});await send('Target.activateTarget',{targetId:background.targetId});
  await waitFor('document.hidden',2000);await sleep(100);const hiddenX=(await inspect()).x;await sleep(400);assert.equal((await inspect()).x,hiddenX);
  await send('Page.bringToFront');await waitFor('!document.hidden',2000);await send('Target.closeTarget',{targetId:background.targetId});
  pass('Animation pauses offscreen and in a hidden tab, then resumes safely');

  const before=await inspect();await evaluate(`window.savedPet=document.querySelector('[data-pet]');savedPet.remove()`);
  const layoutWithout=await evaluate(`({cards:[...document.querySelectorAll('[data-project-tile] > a')].map(a=>({width:a.offsetWidth,height:a.offsetHeight})),overflow:document.documentElement.scrollWidth>innerWidth})`);
  assert.ok(!layoutWithout.overflow);before.cards.forEach((c,i)=>{assert.ok(Math.abs(c.width-layoutWithout.cards[i].width)<1);assert.ok(Math.abs(c.height-layoutWithout.cards[i].height)<1);});
  await evaluate(`document.querySelector('[data-carousel]').append(savedPet)`);await sleep(100);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(100);
  const reduced=(await inspect()).x;await sleep(600);assert.equal((await inspect()).x,reduced);
  await click();await sleep(80);current=await inspect();assert.equal(current.mode,'react');assert.equal(current.expression,'surprised');const staticY=current.y;await sleep(200);assert.equal((await inspect()).y,staticY);
  await sleep(650);
  pass('Unmount/reconnect cleanup, unchanged card dimensions, no page overflow, reduced-motion interactive fallback');

  await send('Page.navigate',{url:'about:blank'});await sleep(100);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await open();
  const touchPoint=async()=>{const p=await inspect();assert.ok(p.hit.receives);const v=await evaluate('({x:visualViewport.offsetLeft,y:visualViewport.offsetTop,scale:visualViewport.scale})');return {x:(p.hit.x-v.x)*v.scale,y:(p.hit.y-v.y)*v.scale};};
  const finger=await touchPoint();
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...finger,radiusX:4,radiusY:4}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(80);
  assert.equal((await inspect()).mode,'react');assert.equal(await evaluate('location.pathname'),'/');await screenshot('mobile');await sleep(950);
  await evaluate(`document.querySelector('[data-pet-button]').blur()`);
  // Real horizontal touch gesture through the carousel, not a synthetic click on a project.
  const metrics=await evaluate(`(()=>{const r=document.querySelector('[data-track]').getBoundingClientRect();return {y:r.y+120-visualViewport.offsetTop}})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:metrics.y}]});
  for(let i=1;i<=8;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:310-i*34,y:metrics.y}]});await sleep(35);}
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await waitFor(`+document.querySelector('[data-pet]').dataset.card>0`,3500);
  current=await inspect();assert.ok(Math.abs(current.y+current.height/2-current.cards[current.card].y)<2);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  pass('Mobile touch reaction, real carousel swipe, flight to the new card, accurate mobile landing');

  await send('Page.navigate',{url:'about:blank'});await sleep(100);await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setDeviceMetricsOverride',{width:820,height:1000,deviceScaleFactor:1,mobile:false});await open();await click();await sleep(50);
  assert.equal((await inspect()).mode,'react');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await screenshot('tablet');
  pass('Tablet layout, click target, and no horizontal page overflow');
  await send('Page.navigate',{url:'about:blank'});await sleep(100);
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  for(const path of ['/en/','/ar/']){await open(path);await click();await sleep(40);assert.equal((await inspect()).mode,'react');}
  pass('English and Arabic/RTL integration');
  assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(failures.length,0,JSON.stringify(failures));
  pass('No JavaScript exceptions, console errors, or local asset 404s');
  await writeFile(join(artifacts,'report.json'),JSON.stringify({passed,errors,assetFailures:failures,eyeResults,patrols},null,2));
  console.log(`Screenshots and report: ${artifacts}`);
} catch(error) {
  if(send){try{const shot=await send('Page.captureScreenshot',{format:'webp'});await writeFile(join(artifacts,'failure.webp'),Buffer.from(shot.data,'base64'));}catch{}}
  throw error;
} finally {
  if(ws?.readyState===WebSocket.OPEN) ws.close();
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Browser check ended'));}
  if(browser) browser.kill('SIGTERM');
  else if(debugURL && target) await fetch(`${debugURL}/json/close/${target.id}`).catch(()=>{});
  server.closeAllConnections();server.close();
}
