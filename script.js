/* =====================================================================
   RANVIR SINGH — FULLY 3D PORTFOLIO
   One continuous Three.js world. Scroll = camera flight.
   Sectors: Entry → Operator → Threat Grid → Skill Ring (fly-through)
            → Project Corridor (clickable monoliths) → Clearance → Uplink
   ===================================================================== */
(() => {
"use strict";
addEventListener("error", e => { if(!window.__RS_BOOTED) window.__RS_ERROR = e.message; });

const PRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let motionOn = !PRM;
const MOBILE = Math.min(window.innerWidth, window.innerHeight) < 700;

/* ---------------- data ---------------- */
const PROJECTS = [
  { t:"SOC Monitoring & Incident Response", tag:"// CASE FILE 01 — SOC OPS",
    d:"End-to-end SOC pipeline in a home lab: Splunk ingestion from Windows targets, eight SPL/AQL detection rules, alert triage scoring in Python, and full IR playbooks for five incident classes.",
    s:["Splunk","QRadar AQL","Python","PowerShell","Sysmon"], link:"projects-underway.html#soc-monitoring-incident-response" },
  { t:"Threat Intel IOC Checker", tag:"// CASE FILE 02 — THREAT INTEL",
    d:"Bulk IOC enrichment tool that pivots hashes, IPs and domains through VirusTotal and AbuseIPDB, scores reputation, and exports analyst-ready verdicts for SIEM watchlists.",
    s:["Python","VirusTotal API","AbuseIPDB","STIX"], link:"projects-underway.html#threat-intel-ioc-checker" },
  { t:"SIEM Detection Engineering", tag:"// CASE FILE 03 — DETECTION",
    d:"A rule library mapped to MITRE ATT&CK: brute force, lateral movement, persistence and exfil patterns written as Splunk SPL and QRadar AQL, with test traffic to validate every rule.",
    s:["MITRE ATT&CK","SPL","AQL","Detection-as-Code"], link:"projects-underway.html#siem-detection-engineering" },
  { t:"Windows Event Hunter", tag:"// CASE FILE 04 — ENDPOINT",
    d:"PowerShell tooling that sweeps Windows Event Logs for suspicious logon storms, service installs and script-block anomalies — built to triage a noisy endpoint in minutes.",
    s:["PowerShell","Win Event Log","KQL","Sigma"], link:"projects-underway.html#windows-event-hunter" },
  { t:"Identity Attack Lab", tag:"// CASE FILE 05 — IDENTITY",
    d:"Active Directory attack/detect lab: simulated password spraying and Kerberos abuse with hydra and Rubeus-style techniques, paired with the detections that catch them.",
    s:["Active Directory","Kali","Hydra","Blue Team"], link:"projects-underway.html#identity-attack-detection-lab" },
  { t:"Home SOC Lab Blueprint", tag:"// CASE FILE 06 — INFRASTRUCTURE",
    d:"Reproducible three-VM lab — Kali attacker, Windows 10 target, Splunk head — with attack scripts, recording checkpoints and setup docs so anyone can rebuild the entire SOC at home.",
    s:["VirtualBox","Kali Linux","Splunk","Networking"], link:"projects-underway.html#home-soc-lab-blueprint" },
];
const SKILLS = [
  { n:"SIEM", icon:"siem", lvl:"daily driver", d:"Alert triage, dashboarding and correlation across Splunk and QRadar — the screen I live on. Tuned rules to cut noise, built views the whole shift can read.", tags:["Triage","Dashboards","Correlation"] },
  { n:"Splunk", icon:"splunk", lvl:"home-lab search head", d:"SPL detections for brute force, lateral movement and exfil. Runs as the head of my three-VM lab, ingesting Windows and Sysmon telemetry.", tags:["SPL","Sysmon","Detections"] },
  { n:"QRadar", icon:"radar", lvl:"AQL + offense tuning", d:"AQL rule writing and offense tuning, including standing up QRadar CE in a constrained lab to learn the platform end to end.", tags:["AQL","Offenses","QRadar CE"] },
  { n:"MITRE ATT&CK", icon:"matrix", lvl:"every rule mapped", d:"Every detection I write is mapped to a technique. I use the matrix to find coverage gaps, not just to decorate reports.", tags:["TTPs","Coverage","Detection Eng"] },
  { n:"Incident Response", icon:"ir", lvl:"playbooks for 5 classes", d:"Wrote and drilled IR playbooks for phishing, brute force, malware, exfil and insider scenarios — detection through containment to lessons learned.", tags:["Playbooks","Containment","Reporting"] },
  { n:"Threat Intel", icon:"intel", lvl:"IOC enrichment", d:"Pivot hashes, IPs and domains through VirusTotal and AbuseIPDB; built a bulk IOC checker that exports analyst-ready verdicts for watchlists.", tags:["VirusTotal","AbuseIPDB","IOCs"] },
  { n:"Python", icon:"python", lvl:"triage tooling", d:"The language my tooling is built in: IOC enrichment, alert scoring, log parsers and automation glue between APIs and the SIEM.", tags:["Automation","APIs","Parsing"] },
  { n:"PowerShell", icon:"powershell", lvl:"Windows event hunting", d:"Sweeps Windows Event Logs for logon storms, rogue services and script-block anomalies — triage a noisy endpoint in minutes.", tags:["Event Logs","DFIR","Endpoint"] },
  { n:"JavaScript / Node", icon:"js", lvl:"full-stack builds", d:"Built browser extensions, Express backends and AI-powered tools — the engineering muscle behind the security work, including this site.", tags:["Node.js","Extensions","Express"] },
  { n:"Wireshark", icon:"wireshark", lvl:"packet-level proof", d:"When logs disagree, packets settle it. Protocol-level investigation of suspicious traffic captured in the lab.", tags:["PCAP","Protocols","Forensics"] },
  { n:"Nmap", icon:"nmap", lvl:"recon & fingerprinting", d:"Service discovery and fingerprinting on lab networks — and the attacker's-eye view that makes my detections sharper.", tags:["Recon","Scanning","Red-team lens"] },
  { n:"Identity & Access", icon:"iam", lvl:"Entra ID + AD, in production", d:"Resolved real IAM tickets at Trios College — MFA failures, lockouts, group provisioning in Entra ID and Active Directory at 95% SLA — plus lab Kerberos attack & detect.", tags:["Entra ID","Active Directory","IAM","Kerberos"] },
  { n:"Linux", icon:"linux", lvl:"Kali + hardening", d:"Kali as the attack box, Ubuntu servers as infrastructure; comfortable in the shell for hardening, logging and automation.", tags:["Kali","Bash","Hardening"] },
  { n:"Networking", icon:"net", lvl:"TCP/IP fundamentals", d:"Subnetting, segmentation and firewall rules — the mental map underneath every alert: who talked to whom, and should they have.", tags:["TCP/IP","Firewalls","Segmentation"] },
];
const K = SKILLS.length;
const SECTOR_NAMES = ["SECTOR 01 — ENTRY","SECTOR 02 — OPERATOR","SECTOR 03 — THREAT GRID","SECTOR 04 — SKILL RING","SECTOR 05 — FIELD LOG","SECTOR 06 — OPERATIONS","SECTOR 07 — CLEARANCE","SECTOR 08 — UPLINK"];
const FEED = [
  "[ feed ] 185.220.x.x → TOR exit probing :443 … dropped",
  "[ feed ] brute force burst on RDP — 47 attempts / 60s … rule fired",
  "[ feed ] beacon-like DNS to rare domain … ticket opened",
  "[ feed ] impossible travel: Lagos → Toronto in 4 min … MFA challenged",
  "[ feed ] EICAR test string on host WS-07 … quarantined",
  "[ feed ] port scan from 45.143.x.x … geo-blocked",
];

/* ---------------- palette ---------------- */
const C = { cyan:0x00e5ff, red:0xff2d55, green:0x2dff9c, slate:0x93a3bf, dim:0x16304a, ink:0x0a1020 };

/* ---------------- renderer / scene ---------------- */
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 2.5 : 2));
renderer.setSize(innerWidth, innerHeight);
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04070f);
scene.fog = new THREE.Fog(0x04070f, 18, 95);

const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, .1, 400);

/* bloom post-processing (graceful fallback if example scripts fail) */
let composer = null, bloomPass = null;
if(!MOBILE && THREE.EffectComposer && THREE.UnrealBloomPass){
  try{
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .85, .55, .12);
    composer.addPass(bloomPass);
  }catch(e){ composer = null; }
}

scene.add(new THREE.AmbientLight(0x223355, 1.1));
const key = new THREE.PointLight(C.cyan, 1.1, 120); key.position.set(0, 12, -20); scene.add(key);

/* ---------------- helpers ---------------- */
const lerp = (a,b,t)=>a+(b-a)*t;
const damp = (k,dt)=>1-Math.exp(-k*dt);   // framerate-independent smoothing factor
const smooth = t=>t*t*(3-2*t);
function textSprite(text, color="#00e5ff", size=30){
  const pad=20, cv=document.createElement("canvas"), g=cv.getContext("2d");
  g.font = `700 ${size}px "JetBrains Mono", monospace`;
  cv.width = Math.ceil(g.measureText(text).width)+pad*2; cv.height = size+pad*2;
  g.font = `700 ${size}px "JetBrains Mono", monospace`;
  g.fillStyle = color; g.textBaseline="middle";
  g.shadowColor = color; g.shadowBlur = 14;
  g.fillText(text, pad, cv.height/2);
  const tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tx, transparent:true, depthWrite:false }));
  sp.scale.set(cv.width/90, cv.height/90, 1);
  return sp;
}

/* ---------------- starfield ---------------- */
{
  const n = MOBILE? 2200: 5200, pos = new Float32Array(n*3);
  for(let i=0;i<n;i++){
    pos[i*3]   = (Math.random()-.5)*340;
    pos[i*3+1] = (Math.random()-.5)*200;
    pos[i*3+2] = -Math.random()*320 + 40;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:0x9fd8ff, size:.16, transparent:true, opacity:.8, fog:false })));
}

/* ---------------- grid floor ---------------- */
const gridA = new THREE.GridHelper(400, 100, C.cyan, C.dim);
gridA.material.transparent = true; gridA.material.opacity = .34;
gridA.position.set(0,-2.2,-100); scene.add(gridA);

/* ---------------- data streaks (sense of speed) ---------------- */
const streaks = [];
{
  const mat = new THREE.MeshBasicMaterial({ color:C.cyan, transparent:true, opacity:.5 });
  const matR = new THREE.MeshBasicMaterial({ color:C.red, transparent:true, opacity:.4 });
  const geo = new THREE.BoxGeometry(.025,.025,2.4);
  for(let i=0;i<(MOBILE?40:90);i++){
    const m = new THREE.Mesh(geo, Math.random()<.16? matR: mat);
    m.position.set((Math.random()-.5)*70, Math.random()*16-3, -Math.random()*240+10);
    m.userData.v = .35 + Math.random()*.85;
    scene.add(m); streaks.push(m);
  }
}

/* =====================================================
   SECTOR 1 — HERO CORE  (z ≈ 0)
   A layered cyber-core: nested shells, orbiting sentinels,
   particle halo, and three rings labelled with attack TTPs
   that expand dramatically as the name flies out.
   ===================================================== */
const ATTACKS = [
  "SQL INJECTION","XSS","PHISHING","BRUTE FORCE","RANSOMWARE","DDoS",
  "PRIVILEGE ESC","LATERAL MOVEMENT","C2 BEACON","ZERO-DAY","MITM","CREDENTIAL STUFFING",
  "DNS TUNNELING","KERBEROASTING","SUPPLY CHAIN","DATA EXFIL"
];
const core = new THREE.Group(); core.position.set(0,1.5,0); scene.add(core);
core.userData.expand = 0;   // 0 = compact, 1 = fully expanded (driven by hero fly-out)
{
  const shellOuter = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,1),
    new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true, transparent:true, opacity:.85 }));
  const shellMid = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05,0),
    new THREE.MeshBasicMaterial({ color:C.red, wireframe:true, transparent:true, opacity:.6 }));
  const shellDodeca = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2,0),
    new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true, transparent:true, opacity:.18 }));
  const shellCoreSolid = new THREE.Mesh(new THREE.IcosahedronGeometry(.5,0),
    new THREE.MeshBasicMaterial({ color:C.green, wireframe:true, transparent:true, opacity:.9 }));
  core.add(shellOuter, shellMid, shellDodeca, shellCoreSolid);
  core.userData.shells = { shellOuter, shellMid, shellDodeca, shellCoreSolid };

  // plain decorative rings
  const ring = (r,rot,col=C.cyan,op=.5)=> {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r,.016,8,96),
      new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:op }));
    m.rotation.set(rot,rot*.6,0); m.userData.r0 = r; core.add(m); return m;
  };
  core.userData.r1 = ring(2.5, Math.PI/2.2);
  core.userData.r2 = ring(3.1, Math.PI/3.4);
  core.userData.r3 = ring(3.7, Math.PI/1.7, C.red, .3);

  // orbiting sentinels
  core.userData.orbs = [];
  for(let i=0;i<6;i++){
    const o = new THREE.Mesh(new THREE.TetrahedronGeometry(.12),
      new THREE.MeshBasicMaterial({ color:C.green }));
    o.userData.a = i/6*Math.PI*2; o.userData.r = 2.4 + (i%2)*.5; core.add(o); core.userData.orbs.push(o);
  }

  // particle halo that bursts outward on expand
  const HN = MOBILE? 120: 240;
  const hp = new Float32Array(HN*3); core.userData.haloDir = [];
  for(let i=0;i<HN;i++){
    const v = new THREE.Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5).normalize();
    core.userData.haloDir.push(v);
    hp[i*3]=v.x*2; hp[i*3+1]=v.y*2; hp[i*3+2]=v.z*2;
  }
  const hg = new THREE.BufferGeometry(); hg.setAttribute("position", new THREE.BufferAttribute(hp,3));
  const halo = new THREE.Points(hg, new THREE.PointsMaterial({ color:C.cyan, size:.05, transparent:true, opacity:.6 }));
  core.add(halo); core.userData.halo = halo;

  // THREE attack-technique rings: tilted bands carrying TTP labels
  core.userData.ttpRings = [];
  const ringDefs = [
    { tilt:[Math.PI/2.3, 0, 0],          r:4.2, col:C.cyan,  count:6, spin:.18 },
    { tilt:[Math.PI/2.8, Math.PI/3, 0],  r:5.2, col:C.red,   count:5, spin:-.13 },
    { tilt:[Math.PI/1.9, -Math.PI/4, 0], r:6.2, col:C.green, count:5, spin:.09 },
  ];
  let ai = 0;
  ringDefs.forEach(def=>{
    const band = new THREE.Group();
    band.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
    // the ring line itself
    const torus = new THREE.Mesh(new THREE.TorusGeometry(def.r,.012,6,120),
      new THREE.MeshBasicMaterial({ color:def.col, transparent:true, opacity:.4 }));
    band.add(torus);
    // labels spaced around it
    for(let k=0;k<def.count;k++){
      const ang = k/def.count*Math.PI*2;
      const label = textSprite(ATTACKS[ai % ATTACKS.length], "#e8f2ff", 20); ai++;
      label.position.set(Math.cos(ang)*def.r, 0, Math.sin(ang)*def.r);
      label.scale.multiplyScalar(.85);
      band.add(label);
      // a small node marker at each label
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(.1),
        new THREE.MeshBasicMaterial({ color:def.col }));
      node.position.copy(label.position);
      band.add(node);
    }
    band.userData = { spin:def.spin, r0:def.r };
    band.visible = false;       // hidden until the core expands
    core.add(band); core.userData.ttpRings.push(band);
  });
}

/* =====================================================
   SECTOR 3 — THREAT GLOBE  (z ≈ -46)
   ===================================================== */
const globe = new THREE.Group(); globe.position.set(0,2,-46); scene.add(globe);
const arcs = [];
{
  const R = 4.2;
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 26, 18),
    new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true, transparent:true, opacity:.28 })));
  // vertex dust
  const sg = new THREE.SphereGeometry(R, 40, 28);
  globe.add(new THREE.Points(sg, new THREE.PointsMaterial({ color:C.cyan, size:.05, transparent:true, opacity:.8 })));
  const onSphere = ()=>{
    const u=Math.random(), v=Math.random(), th=2*Math.PI*u, ph=Math.acos(2*v-1);
    return new THREE.Vector3(R*Math.sin(ph)*Math.cos(th), R*Math.cos(ph), R*Math.sin(ph)*Math.sin(th));
  };
  // Toronto SOC node (fixed)
  const soc = new THREE.Vector3(0, R*.62, R*.78).normalize().multiplyScalar(R);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.2),
    new THREE.MeshBasicMaterial({ color:C.green }));
  marker.position.copy(soc); globe.add(marker); globe.userData.marker = marker;
  const lbl = textSprite("TORONTO SOC", "#2dff9c", 26);
  lbl.position.copy(soc).multiplyScalar(1.28); globe.add(lbl);
  // attack arcs → SOC, each with a clickable packet traveling along it
  for(let i=0;i<10;i++){
    const a = onSphere();
    const mid = a.clone().add(soc).multiplyScalar(.5).normalize().multiplyScalar(R*1.55);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, soc);
    const hostile = i < 7;
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const lm = new THREE.LineBasicMaterial({ color: hostile? C.red: C.green, transparent:true, opacity:.35 });
    const line = new THREE.Line(g, lm);
    globe.add(line);
    const pk = new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),
      new THREE.MeshBasicMaterial({ color: hostile? C.red: C.green }));
    // generous invisible hit sphere so packets are easy to click
    const hit = new THREE.Mesh(new THREE.SphereGeometry(.42,8,8),
      new THREE.MeshBasicMaterial({ visible:false }));
    hit.userData.packet = pk;
    pk.add(hit);
    pk.userData = { curve, off:Math.random(), speed:.10+Math.random()*.12, hostile, line, hit, cool:0 };
    pk.position.copy(curve.getPoint(pk.userData.off));
    globe.add(pk); arcs.push(pk);
  }
}

/* ---------------- skill glyph emblems (custom, IP-safe) ---------------- */
function glyphTexture(kind, color="#00e5ff"){
  const S = 128, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const g = cv.getContext("2d");
  g.translate(S/2, S/2);
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 7;
  g.lineCap = "round"; g.lineJoin = "round";
  g.shadowColor = color; g.shadowBlur = 12;
  const P = (...pts)=>{ g.beginPath(); pts.forEach((p,i)=> i? g.lineTo(p[0],p[1]): g.moveTo(p[0],p[1])); g.stroke(); };
  const ring = (r)=>{ g.beginPath(); g.arc(0,0,r,0,Math.PI*2); g.stroke(); };
  switch(kind){
    case "siem":
      g.strokeRect(-42,-34,84,26); g.strokeRect(-42,2,40,30); g.strokeRect(6,2,36,30); break;
    case "splunk":
      P([-38,30],[-38,8]); P([-20,30],[-20,-6]); P([-2,30],[-2,-22]);
      g.beginPath(); g.arc(20,-6,18,0,Math.PI*2); g.stroke(); P([33,7],[44,18]); break;
    case "radar":
      ring(38); ring(20); P([0,0],[34,-18]); g.beginPath(); g.arc(0,0,38,-0.5,0.2); g.stroke(); break;
    case "matrix":
      for(let x=-36;x<=36;x+=24) P([x,-36],[x,36]);
      for(let y=-36;y<=36;y+=24) P([-36,y],[36,y]);
      g.fillRect(-36,-36,24,24); g.fillRect(12,-12,24,24); break;
    case "ir":
      P([0,-40],[34,-26],[34,8],[0,40],[-34,8],[-34,-26],[0,-40]);
      P([-20,0],[-8,0],[-2,-14],[6,16],[12,0],[22,0]); break;
    case "intel":
      ring(34); P([-44,0],[-30,0]); P([30,0],[44,0]); P([0,-44],[0,-30]); P([0,30],[0,44]);
      g.beginPath(); g.arc(0,0,9,0,Math.PI*2); g.fill(); break;
    case "python":
      g.beginPath(); g.arc(-10,-12,22,Math.PI*0.5,Math.PI*2); g.stroke();
      g.beginPath(); g.arc(10,12,22,Math.PI*1.5,Math.PI*3); g.stroke();
      g.beginPath(); g.arc(-10,-20,5,0,Math.PI*2); g.fill();
      g.beginPath(); g.arc(10,20,5,0,Math.PI*2); g.fill(); break;
    case "powershell":
      g.strokeRect(-42,-32,84,64); P([-26,-10],[-10,0],[-26,10]); P([-2,14],[18,14]); break;
    case "js":
      g.font = "700 70px monospace"; g.textAlign="center"; g.textBaseline="middle";
      g.fillText("{ }", 0, 4); break;
    case "wireshark":
      P([-44,0],[-26,0],[-18,-26],[-2,26],[10,-26],[22,0],[44,0]); break;
    case "nmap":
      ring(36); ring(22); ring(8);
      for(let k=0;k<8;k++){ const an=k/8*Math.PI*2; P([Math.cos(an)*36,Math.sin(an)*36],[Math.cos(an)*44,Math.sin(an)*44]); } break;
    case "iam":
      g.beginPath(); g.arc(-14,-14,16,0,Math.PI*2); g.stroke();
      P([-3,-3],[34,34]); P([24,24],[34,14]); P([14,34],[24,44]); break;
    case "linux":
      g.strokeRect(-40,-40,80,80); P([-22,-12],[-6,2],[-22,16]); P([2,18],[24,18]); break;
    case "net":
      g.beginPath(); g.arc(0,-26,9,0,7); g.fill();
      g.beginPath(); g.arc(-28,22,9,0,7); g.fill();
      g.beginPath(); g.arc(28,22,9,0,7); g.fill();
      P([0,-26],[-28,22]); P([0,-26],[28,22]); P([-28,22],[28,22]); break;
    default: ring(30);
  }
  const tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; tx.anisotropy = maxAniso; return tx;
}

/* =====================================================
   SECTOR 4 — SKILL RING  (z ≈ -78)
   Scroll-driven carousel: the ring deals each skill to the
   camera as a card, in the direction of its rotation.
   ===================================================== */
const ringGrp = new THREE.Group(); ringGrp.position.set(0,2,-78); scene.add(ringGrp);
const skillNodes = [], skillCards = [], skillBadges = [];
const RING_R = 5.0, STEP = Math.PI*2/K;
const CARD_FRONT = new THREE.Vector3(0, 2, -69.7);   // where the active card parks
let ringRot = 0, holdBase = 0, wasHold = false, ringDone = false, lastC = -1, wasHoldPrev = false;
let halo;
function skillCardTexture(s){
  const SC=2;
  const cv=document.createElement("canvas"); cv.width=300*SC; cv.height=400*SC;
  const g=cv.getContext("2d"); g.scale(SC,SC);
  g.fillStyle="#070d1a"; g.fillRect(0,0,300,400);
  g.strokeStyle="rgba(0,229,255,.6)"; g.lineWidth=3; g.strokeRect(7,7,286,386);
  g.strokeStyle="rgba(0,229,255,.18)"; g.strokeRect(15,15,270,370);
  g.fillStyle="#2dff9c"; g.font='500 13px "JetBrains Mono", monospace';
  g.fillText("// CAPABILITY", 26, 46);
  // emblem in the top-right of the card
  const gi = glyphTexture(s.icon, "#00e5ff").image;
  if(gi) g.drawImage(gi, 222, 22, 56, 56);
  g.fillStyle="#e8f2ff"; g.font='800 30px "Syne", sans-serif';
  // wrap title
  let words=s.n.split(" "), line="", y=88;
  words.forEach(w=>{ if(g.measureText(line+w).width>248){ g.fillText(line,26,y); y+=36; line=w+" "; } else line+=w+" "; });
  g.fillText(line,26,y); y+=30;
  g.fillStyle="#00e5ff"; g.font='500 14px "JetBrains Mono", monospace';
  g.fillText(s.lvl.toUpperCase(), 26, y); y+=30;
  g.fillStyle="#93a3bf"; g.font='400 15px "Space Grotesk", sans-serif';
  words=s.d.split(" "); line="";
  words.forEach(w=>{ if(g.measureText(line+w).width>248){ g.fillText(line,26,y); y+=21; line=w+" "; } else line+=w+" "; });
  g.fillText(line,26,y);
  g.fillStyle="#2dff9c"; g.font='400 13px "JetBrains Mono", monospace';
  g.fillText("» click for full readout", 26, 372);
  const tx=new THREE.CanvasTexture(cv); tx.minFilter=THREE.LinearFilter; tx.anisotropy=maxAniso; return tx;
}
{
  halo = new THREE.Mesh(new THREE.TorusGeometry(RING_R,.03,8,140),
    new THREE.MeshBasicMaterial({ color:C.cyan, transparent:true, opacity:.55 }));
  ringGrp.add(halo);
  SKILLS.forEach((s,i)=>{
    const a = i/K*Math.PI*2;
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(.26),
      new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true }));
    node.position.set(Math.cos(a)*RING_R, Math.sin(a)*RING_R, 0);
    node.userData.idx = i;
    ringGrp.add(node); skillNodes.push(node);
    // 3D emblem badge: glowing glyph + frame ring, billboarded to camera
    const badge = new THREE.Group();
    badge.position.copy(node.position);
    const glyph = new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),
      new THREE.MeshBasicMaterial({ map:glyphTexture(s.icon), transparent:true, depthWrite:false }));
    const frame = new THREE.Mesh(new THREE.TorusGeometry(.42,.018,6,32),
      new THREE.MeshBasicMaterial({ color:C.cyan, transparent:true, opacity:.6 }));
    badge.add(glyph); badge.add(frame);
    badge.userData = { glyph, frame, spin: .4 + (i%3)*.18 };
    ringGrp.add(badge); skillBadges.push(badge);
    node.visible = false;   // the emblem replaces the bare octahedron
    const t = textSprite(s.n, "#e8f2ff", 24);
    t.position.set(Math.cos(a)*(RING_R+1.3), Math.sin(a)*(RING_R+0.9), 0);
    t.scale.multiplyScalar(1.35);
    ringGrp.add(t);
    // the card — lives in world space, flies node → camera-front
    const card = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.8),
      new THREE.MeshBasicMaterial({ map:skillCardTexture(s), transparent:true, opacity:0, side:THREE.DoubleSide }));
    card.userData = { idx:i, node, b:0, hover:0, hoverBoost:0 };
    card.scale.setScalar(.001); card.visible = false;
    scene.add(card); skillCards.push(card);
  });
}
/* completion shockwave (reused mesh) */
const shock = new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,80),
  new THREE.MeshBasicMaterial({ color:C.green, transparent:true, opacity:0 }));
shock.position.copy(ringGrp.position); scene.add(shock);
let shockT0 = -99;
function ringComplete(){
  if(ringDone) return; ringDone = true;
  shockT0 = performance.now();
  showToast("ACHIEVEMENT — FULL SPECTRUM", `All ${K} capabilities reviewed. The ring returns to station.`);
  ping(880); setTimeout(()=>ping(660),140);
}

/* =====================================================
   SECTOR 5 — FIELD LOG  (z ≈ -91) — career helix
   ===================================================== */
const helix = new THREE.Group(); helix.position.set(3.2, 2, -91); scene.add(helix);
{
  const n = 90, ptsA = new Float32Array(n*3), ptsB = new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const u = i/(n-1), a = u*Math.PI*5, y = (u-.5)*4.4;
    ptsA[i*3]=Math.cos(a)*1.1;        ptsA[i*3+1]=y; ptsA[i*3+2]=Math.sin(a)*1.1;
    ptsB[i*3]=Math.cos(a+Math.PI)*1.1; ptsB[i*3+1]=y; ptsB[i*3+2]=Math.sin(a+Math.PI)*1.1;
  }
  const mk = (arr,col)=>{ const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.BufferAttribute(arr,3));
    return new THREE.Points(g,new THREE.PointsMaterial({ color:col, size:.07 })); };
  helix.add(mk(ptsA,C.cyan)); helix.add(mk(ptsB,C.green));
  // rungs
  for(let i=0;i<9;i++){
    const u = i/8, a = u*Math.PI*5, y=(u-.5)*4.4;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a)*1.1, y, Math.sin(a)*1.1),
      new THREE.Vector3(Math.cos(a+Math.PI)*1.1, y, Math.sin(a+Math.PI)*1.1)]);
    helix.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color:C.cyan, transparent:true, opacity:.4 })));
  }
  const lbl = textSprite("FIELD LOG", "#2dff9c", 24);
  lbl.position.set(0, 3.1, 0); helix.add(lbl);
}

/* ---- ticket queue minigame: live IAM tickets orbit the helix ---- */
const TICKET_TYPES = ["MFA FAILURE","ACCOUNT LOCKOUT","LOGIN ISSUE","ACCESS REQUEST","GROUP PROVISIONING","ENDPOINT ALERT"];
const tickets = [];
let resolvedCount = 0;
function ticketTexture(id, type, open){
  const cv=document.createElement("canvas"); cv.width=256; cv.height=150;
  const g=cv.getContext("2d");
  g.fillStyle="#070d1a"; g.fillRect(0,0,256,150);
  g.strokeStyle = open? "rgba(255,45,85,.8)" : "rgba(45,255,156,.9)";
  g.lineWidth=3; g.strokeRect(6,6,244,138);
  g.fillStyle="#93a3bf"; g.font='400 13px "JetBrains Mono", monospace';
  g.fillText(id, 18, 34);
  g.fillStyle="#e8f2ff"; g.font='600 17px "Space Grotesk", sans-serif';
  g.fillText(type, 18, 66);
  g.fillStyle = open? "#ff2d55" : "#2dff9c";
  g.font='700 14px "JetBrains Mono", monospace';
  g.fillText(open? "● OPEN — CLICK TO RESOLVE" : "✔ RESOLVED — WITHIN SLA", 18, 118);
  const tx=new THREE.CanvasTexture(cv); tx.minFilter=THREE.LinearFilter; return tx;
}
TICKET_TYPES.forEach((type,i)=>{
  const id = "TRIOS-10" + (41+i);
  const texOpen = ticketTexture(id, type, true);
  const texDone = ticketTexture(id, type, false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5,.88),
    new THREE.MeshBasicMaterial({ map:texOpen, transparent:true, side:THREE.DoubleSide }));
  m.userData = { open:true, cool:0, texOpen, texDone,
    a: i/TICKET_TYPES.length*Math.PI*2, r: 2.7 + (i%3)*.5, y: -1.6 + (i%4)*1.05,
    spd: .25 + (i%3)*.08, type };
  scene.add(m); tickets.push(m);
});
function resolveTicket(tk){
  const u = tk.userData;
  if(!u.open) return;
  u.open = false; u.cool = 8;
  tk.material.map = u.texDone; tk.material.needsUpdate = true;
  tk.scale.setScalar(1.45);
  resolvedCount++;
  const el = document.getElementById("xpStats");
  if(el) el.textContent = `[ queue ] ${u.type} closed within SLA. RESOLVED ${resolvedCount} · SLA 100% · CSAT 99%`;
  ping(740);
  if(resolvedCount === 3) showToast("ACHIEVEMENT — SLA CRUSHER", "Three tickets resolved. The queue fears you.");
}

/* =====================================================
   SECTOR 5 — PROJECT MONOLITH CORRIDOR  (z −100 … −150)
   ===================================================== */
const monoliths = [];
function monolithFace(i, title){
  const SC = 2;  // supersample
  const cv=document.createElement("canvas"); cv.width=256*SC; cv.height=512*SC;
  const g=cv.getContext("2d"); g.scale(SC,SC);
  g.fillStyle="#070d1a"; g.fillRect(0,0,256,512);
  g.strokeStyle="rgba(0,229,255,.5)"; g.lineWidth=3; g.strokeRect(8,8,240,496);
  g.strokeStyle="rgba(0,229,255,.16)"; g.lineWidth=1; g.strokeRect(15,15,226,482);
  g.fillStyle="#00e5ff"; g.font='800 110px "Syne", sans-serif';
  g.shadowColor="#00e5ff"; g.shadowBlur=18;
  g.fillText("0"+(i+1), 26, 132);
  g.shadowBlur=0;
  g.fillStyle="#e8f2ff"; g.font='600 24px "Space Grotesk", sans-serif';
  const words=title.split(" "); let line="", y=210;
  words.forEach(w=>{ if(g.measureText(line+w).width>200){ g.fillText(line,26,y); y+=32; line=w+" "; } else line+=w+" "; });
  g.fillText(line,26,y);
  g.fillStyle="#2dff9c"; g.font='400 16px "JetBrains Mono", monospace';
  g.fillText("» open case file", 26, 470);
  const tx=new THREE.CanvasTexture(cv);
  tx.minFilter=THREE.LinearMipmapLinearFilter; tx.magFilter=THREE.LinearFilter;
  tx.generateMipmaps=true;
  tx.anisotropy = maxAniso;
  return tx;
}
PROJECTS.forEach((p,i)=>{
  const grp = new THREE.Group();
  const x = i%2===0? -4.6: 4.6;
  grp.position.set(x, 1.6, -102 - i*9.5);
  grp.rotation.y = (i%2===0? 1:-1) * .45;
  const faceMat = new THREE.MeshBasicMaterial({ map:monolithFace(i, p.t) });
  const sideMat = new THREE.MeshBasicMaterial({ color:0x070d1a });
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.3, 4.6, .5),
    [sideMat,sideMat,sideMat,sideMat,faceMat,sideMat]);
  grp.add(box);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),
    new THREE.LineBasicMaterial({ color:C.cyan, transparent:true, opacity:.9 }));
  grp.add(edges);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.9,.12,.35,6),
    new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true, transparent:true, opacity:.4 }));
  base.position.y = -2.6; grp.add(base);
  grp.userData = { idx:i, box, edges, hover:0 };
  box.userData.monolith = grp;
  scene.add(grp); monoliths.push(grp);
});

// Floor-mounted light guides. Each sector uses one line mesh, with a shared
// clock moving highlights along the measured length of each circuit.
const signalTime = { value: 0 };
function circuitMesh(paths) {
  const vertices = [], distances = [];
  paths.forEach((points, lane) => {
    let distance = lane * 1.73;
    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1], end = points[i];
      vertices.push(...start, ...end);
      distances.push(distance);
      distance += Math.hypot(end[0]-start[0], end[1]-start[1], end[2]-start[2]);
      distances.push(distance);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('travel', new THREE.Float32BufferAttribute(distances, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { seconds: signalTime }, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float travel;
      varying float along;
      varying float depth;
      void main() {
        along = travel;
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        depth = -view.z;
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform float seconds;
      varying float along;
      varying float depth;
      void main() {
        float phase = fract((along - seconds * 1.8) / 9.0);
        float pulse = smoothstep(0.64, 0.96, phase) * (1.0 - smoothstep(0.96, 1.0, phase));
        vec3 color = mix(vec3(0.01, 0.42, 0.62), vec3(0.50, 1.0, 0.86), pulse);
        gl_FragColor = vec4(color, (0.40 + pulse * 0.50) * (1.0 - smoothstep(24.0, 72.0, depth)));
      }`
  });
  return new THREE.LineSegments(geometry, material);
}

// Etched radial traces sit underneath the entry core, clear of the nameplate.
const launchPaths = [];
for (let spoke = 0; spoke < (MOBILE ? 8 : 16); spoke++) {
  const angle = spoke * Math.PI * 2 / (MOBILE ? 8 : 16);
  const polar = (r, offset) => [Math.cos(angle + offset) * r, -2.05, Math.sin(angle + offset) * r];
  launchPaths.push([polar(1.2, 0), polar(2.3, 0), polar(3.1, .12), polar(4.8, .12)]);
}
const launchCircuit = circuitMesh(launchPaths);
scene.add(launchCircuit);

// Twin signal buses feed the six existing project plinths.
const busPaths = [];
monoliths.forEach((plinth, i) => {
  const { x, z } = plinth.position;
  const lane = Math.sign(x) * (1.8 + Math.floor(i / 2) * .2);
  busPaths.push([[lane, -2.08, -95], [lane, -2.08, z + 2.4],
    [x, -2.08, z + .6], [x, -2.08, z], [x, -1, z]]);
});
const projectBus = circuitMesh(busPaths);
scene.add(projectBus);

// A translucent scan sweeps the globe. Neutralizing a packet sends a ring
// across the globe from its actual interception point.
const radar = new THREE.Mesh(new THREE.SphereGeometry(4.26, MOBILE ? 32 : 56, MOBILE ? 20 : 36),
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { seconds: signalTime, hitTime: {value: -10}, hitDirection: {value: new THREE.Vector3(0,1,0)} },
    vertexShader: `
      varying vec3 direction;
      varying vec3 viewNormal;
      varying vec3 toEye;
      void main() {
        direction = normal;
        viewNormal = normalMatrix * normal;
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        toEye = -view.xyz;
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform float seconds;
      uniform float hitTime;
      uniform vec3 hitDirection;
      varying vec3 direction;
      varying vec3 viewNormal;
      varying vec3 toEye;
      void main() {
        vec3 n = normalize(direction);
        float sweep = fract((atan(n.z, n.x) - seconds * 0.42) / 6.2831853);
        float beam = smoothstep(.91, .999, sweep);
        float rim = pow(1.0 - clamp(dot(normalize(viewNormal), normalize(toEye)), 0.0, 1.0), 2.8);
        float age = seconds - hitTime;
        float angle = acos(clamp(dot(n, hitDirection), -1.0, 1.0));
        float wave = (1.0 - smoothstep(.015, .075, abs(angle - age * 1.7))) * (1.0 - smoothstep(.15, 1.7, age));
        vec3 color = mix(vec3(.035, .60, .86), vec3(.27, 1.0, .55), wave);
        gl_FragColor = vec4(color, min(.8, .32 * rim + .23 * beam + .62 * wave));
      }`
  }));
globe.add(radar);

/* =====================================================
   SECTOR 6 — CLEARANCE SHIELD  (z ≈ -170)
   ===================================================== */
const shield = new THREE.Group(); shield.position.set(3.6, 2, -170); scene.add(shield);
{
  shield.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.9,1),
    new THREE.MeshBasicMaterial({ color:C.green, wireframe:true, transparent:true, opacity:.85 })));
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.7,.02,8,90),
    new THREE.MeshBasicMaterial({ color:C.cyan, transparent:true, opacity:.6 }));
  r1.rotation.x = Math.PI/2.4; shield.add(r1); shield.userData.r1=r1;
  const n=240, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, r=2.4+Math.random()*1.6, y=(Math.random()-.5)*3;
    pos[i*3]=Math.cos(a)*r; pos[i*3+1]=y; pos[i*3+2]=Math.sin(a)*r;
  }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const halo = new THREE.Points(g,new THREE.PointsMaterial({ color:C.green,size:.05,transparent:true,opacity:.8 }));
  shield.add(halo); shield.userData.halo=halo;
}

/* ---- clearance verification: credential badges orbit the shield ---- */
const BADGES = [
  { t:"SEC+" }, { t:"SAULT 4.0" }, { t:"BCA" }, { t:"SOC LAB" },
];
const badgeNodes = [];
let verifyT0 = -99;
BADGES.forEach((bd,i)=>{
  const grp = new THREE.Group();
  const node = new THREE.Mesh(new THREE.OctahedronGeometry(.22),
    new THREE.MeshBasicMaterial({ color:C.cyan, wireframe:true }));
  grp.add(node);
  const t = textSprite(bd.t, "#e8f2ff", 22); t.position.y = .55; grp.add(t);
  grp.userData = { a: i/BADGES.length*Math.PI*2, node, i };
  shield.add(grp); badgeNodes.push(grp);
});
function runClearance(){
  if(performance.now() - verifyT0 < 3200) return;
  verifyT0 = performance.now();
  ping(520); setTimeout(()=>ping(620),300); setTimeout(()=>ping(740),600); setTimeout(()=>ping(880),900);
  setTimeout(()=>showToast("CLEARANCE VERIFIED — ANALYST LEVEL",
    "Security+ · Sault 4.0 GPA · BCA · SOC Lab — all credentials check out."), 2300);
}

/* =====================================================
   THE FINALE — every visit is an incident; close it.
   ===================================================== */
const visited = new Set([0]);
const skillsSeen = new Set();
const sessionT0 = performance.now();
let incidentClosed = false, shake = 0, warp = 1, flashUntil = 0;
const incId = "VISIT-" + Math.random().toString(16).slice(2,6).toUpperCase();
document.getElementById("incId").textContent = incId;
/* celebration burst */
const BURST_N = 90;
const burstGeo = new THREE.BufferGeometry();
const burstPos = new Float32Array(BURST_N*3), burstVel = [];
for(let i=0;i<BURST_N;i++){
  burstVel.push(new THREE.Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5)
    .normalize().multiplyScalar(1.6+Math.random()*2.6));
}
burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos,3));
const burst = new THREE.Points(burstGeo, new THREE.PointsMaterial({ color:C.green, size:.09, transparent:true, opacity:0 }));
burst.visible = false; scene.add(burst);
let burstT0 = -99;
function updateIncidentPanel(){
  document.getElementById("incSect").textContent = visited.size + "/8";
  document.getElementById("incKills").textContent = kills;
  document.getElementById("incSkills").textContent = skillsSeen.size + "/14";
  const sec = Math.floor((performance.now()-sessionT0)/1000);
  document.getElementById("incTime").textContent = Math.floor(sec/60) + ":" + String(sec%60).padStart(2,"0");
}
function closeIncident(){
  if(incidentClosed) return;
  incidentClosed = true;
  updateIncidentPanel();
  tline(`<span class="dim">$</span> close ${incId.toLowerCase()}`);
  setTimeout(()=>tline(`archiving evidence… <span class="ok">done</span>`), 350);
  setTimeout(()=>tline(`updating detections from lessons learned… <span class="ok">done</span>`), 800);
  setTimeout(()=>tline(`notifying stakeholders… <span class="ok">done</span>`), 1200);
  setTimeout(()=>tline(`<span class="ok">status → CLOSED. no further action required.</span>`), 1600);
  shake = .55; warp = 9; flashUntil = performance.now() + 2200;
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
  const origin = camera.position.clone().add(fwd.multiplyScalar(5));
  for(let i=0;i<BURST_N;i++){ burstPos[i*3]=origin.x; burstPos[i*3+1]=origin.y; burstPos[i*3+2]=origin.z; }
  burstGeo.attributes.position.needsUpdate = true;
  burst.visible = true; burst.material.opacity = 1; burstT0 = performance.now();
  setTimeout(()=>{
    document.getElementById("stamp").classList.add("slam");
    ping(660); setTimeout(()=>ping(880),120); setTimeout(()=>ping(1100),260);
    shake = .8;
  }, 900);
  setTimeout(()=>document.getElementById("stamp").classList.remove("slam"), 4600);
  const btn = document.getElementById("closeBtn");
  btn.disabled = true; btn.textContent = "✔ INCIDENT CLOSED — CASE SEALED";
  document.getElementById("incident").classList.add("closed");
  document.getElementById("incStatus").textContent = "CLOSED";
  setTimeout(()=>showToast("ACHIEVEMENT — CASE CLOSED",
    "Full flight, threats handled, report filed. Ranvir is ready for the next one."), 2600);
}
document.getElementById("closeBtn").addEventListener("click", closeIncident);

/* =====================================================
   CAMERA FLIGHT PATH — 8 stops, with a scroll "hold"
   at the skill ring where the carousel takes over
   ===================================================== */
const STOPS = [
  { p:[0, 1.7, 10.5],  l:[0, 1.5, 0]    },  // 0 entry
  { p:[3.6, 2.2, -4],  l:[0, 1.6, -10]  },  // 1 operator — lingers near the blooming core
  { p:[0, 2.5, -35.5], l:[0, 2,  -46]   },  // 2 threat globe
  { p:[0, 2,  -66.5],  l:[0, 2,  -79]   },  // 3 skill ring — carousel hold (whole ring in frame)
  { p:[-1.8, 2.2,-84.5],l:[3.2, 2, -91] },  // 4 field log (helix) — through the ring
  { p:[0, 2.1, -96],   l:[0, 1.8,-126]  },  // 5 corridor entrance
  { p:[-0.6, 2.2,-160], l:[3.6, 2, -170] },  // 6 shield (right side, fully in frame beside credentials)
  { p:[0, 3.4, -184],  l:[0, 6.5,-205]  },  // 7 uplink, tilt to the stars
];
const N = STOPS.length;
/* timeline: 7 travel units + a hold whose length scales with skill count */
const HOLD = K * .9;     // generous scroll runway per skill
const TOTAL = (N-1) + HOLD;
function mapScroll(p){
  const u = p * TOTAL;
  if(u <= 3)        return { seg:u,        c:-1 };               // before the ring
  if(u <= 3 + HOLD) return { seg:3,        c:(u-3)/HOLD * K };   // carousel hold
  return               { seg:u - HOLD, c:-1 };                   // after the ring
}
const stopToP = i => (i + (i>3? HOLD:0)) / TOTAL;

/* ---------------- scroll state ---------------- */
let target = 0, prog = 0;
const trackH = () => document.body.scrollHeight - innerHeight;
addEventListener("scroll", () => { target = Math.max(0, Math.min(1, scrollY / trackH())); }, { passive:true });

/* mouse parallax + raycast pointer */
const mouse = { x:0, y:0, sx:0, sy:0 };
const pointer = new THREE.Vector2(-9, -9);
addEventListener("pointermove", e=>{
  mouse.x = e.clientX/innerWidth*2-1; mouse.y = e.clientY/innerHeight*2-1;
  pointer.x = mouse.x; pointer.y = -mouse.y;
  if(drag.on){ globe.rotation.y += (e.clientX-drag.x)*.005; globe.rotation.x += (e.clientY-drag.y)*.003; drag.x=e.clientX; drag.y=e.clientY; }
});
const drag = { on:false, x:0, y:0, ox:0, oy:0 };
addEventListener("pointerdown", e=>{
  drag.ox=e.clientX; drag.oy=e.clientY;
  if(curSector===2){ drag.on=true; drag.x=e.clientX; drag.y=e.clientY; }
});
addEventListener("pointerup", ()=> drag.on=false);

/* ---------------- overlays / rail / HUD ---------------- */
const ovls = [...document.querySelectorAll(".ovl")];
const heroFly = document.getElementById("heroFly");
const railBtns = [...document.querySelectorAll(".rail button")];
const hudSection = document.getElementById("hudSection");
const hudCoord = document.getElementById("hudCoord");
const hint = document.getElementById("scrollHint");
let curSector = 0;

railBtns.forEach(b => b.addEventListener("click", () => {
  const i = +b.dataset.stop;
  scrollTo({ top: stopToP(i)*trackH(), behavior: motionOn? "smooth":"auto" });
}));

function setSector(i){
  if(i===curSector) return;
  curSector = i;
  visited.add(i);
  if(i === 7 && !incidentClosed) updateIncidentPanel();
  ovls.forEach(o => o.classList.toggle("on", +o.dataset.stop===i));
  railBtns.forEach(b => b.classList.toggle("active", +b.dataset.stop===i));
  hudSection.textContent = SECTOR_NAMES[i];
}
ovls[0].classList.add("on");

/* skill carousel progress dots */
const skillDots = document.getElementById("skillDots");
for(let i=0;i<K;i++){ const d=document.createElement("i"); skillDots.appendChild(d); }
const dotEls = [...skillDots.children];
function updateDots(active){
  dotEls.forEach((d,i)=>{
    d.classList.toggle("active", i===active);
    d.classList.toggle("seen", skillsSeen.has(i) && i!==active);
  });
}

/* ---------------- raycaster: hover/click systems ---------------- */
const ray = new THREE.Raycaster();
const tip = document.createElement("div"); tip.id="tip"; document.body.appendChild(tip);
let hovered = null, hoveredCard = null, lastActiveSkill = -1;
const vHome = new THREE.Vector3();

/* score + achievement toasts */
let kills = 0;
const hudScore = document.getElementById("hudScore");
const toast = document.getElementById("toast");
let toastT = null;
function showToast(title, body){
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = body;
  toast.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(()=>toast.classList.remove("show"), 3200);
}
function neutralize(pk){
  const u = pk.userData;
  if(!u.hostile) return;
  u.hostile = false; u.cool = 6;
  if (motionOn) {
    radar.material.uniforms.hitDirection.value.copy(pk.position).normalize();
    radar.material.uniforms.hitTime.value = signalTime.value;
  }
  pk.material.color.setHex(C.green); u.line.material.color.setHex(C.green);
  pk.scale.setScalar(2.6); // pop, eased back down in the loop
  kills++;
  hudScore.textContent = `THREATS NEUTRALIZED — ${kills}`;
  ping(660);
  if(kills===1) showToast("ACHIEVEMENT — FIRST BLOOD", "Hostile packet dropped before the perimeter.");
  if(kills===5) showToast("ACHIEVEMENT — SHIFT HANDLED", "5 threats neutralized. The SOC stays green.");
  if(kills===15) showToast("ACHIEVEMENT — APEX ANALYST", "15 takedowns. Hire this person.");
}

addEventListener("click", (e) => {
  if(document.getElementById("modal").classList.contains("open")) return;
  if(e.target.closest && e.target.closest(".modal,.rail,.term,.contact-row,.hero-tags,.hud-snd")) return;
  if(Math.hypot(e.clientX-drag.ox, e.clientY-drag.oy) > 7) return; // that was a globe drag
  // raycast at the actual click point — works for touch taps too
  pointer.x = e.clientX/innerWidth*2-1;
  pointer.y = -(e.clientY/innerHeight*2-1);
  ray.setFromCamera(pointer, camera);
  const { seg, c } = mapScroll(prog);
  if(c >= 0){                                      // skill carousel: open capability files
    const hit = ray.intersectObjects(skillCards.filter(cd=>cd.userData.b > .35))[0];
    if(hit) return openSkillModal(hit.object.userData.idx);
  }
  if(seg > 1.4 && seg < 2.6){                      // threat grid: hunt the red packets
    const hit = ray.intersectObjects(arcs.map(p=>p.userData.hit))[0];
    if(hit) neutralize(hit.object.userData.packet);
  }
  if(seg > 4.4 && seg < 6.4){                      // corridor: open case files
    const hit = ray.intersectObjects(monoliths.map(m=>m.userData.box))[0];
    if(hit) return openModal(hit.object.userData.monolith.userData.idx);
  }
  if(seg > 3.4 && seg < 4.6){                      // field log: resolve tickets
    const hit = ray.intersectObjects(tickets)[0];
    if(hit) return resolveTicket(hit.object);
  }
  if(seg > 5.4 && seg < 6.6){                      // clearance: verify credentials
    const hit = ray.intersectObjects(shield.children, true)[0];
    if(hit) runClearance();
  }
});
const mLink = document.getElementById("mLink");
let skillModalMode = false;
mLink.addEventListener("click", e=>{
  if(!skillModalMode) return;            // project mode: normal external link
  e.preventDefault();
  document.getElementById("modal").classList.remove("open");
  flyTo(5);                              // jump to the operations corridor
});
function openSkillModal(i){
  const s = SKILLS[i];
  skillModalMode = true;
  document.getElementById("statusLink").style.display = "none";
  document.getElementById("mTag").textContent = `// CAPABILITY FILE ${String(i+1).padStart(2,"0")} / ${K}`;
  document.getElementById("mTitle").textContent = s.n;
  document.getElementById("mDesc").textContent = s.d;
  document.getElementById("mStack").innerHTML = s.tags.map(x=>`<span>${x}</span>`).join("");
  mLink.removeAttribute("target"); mLink.href = "#";
  mLink.textContent = "SEE IT DEPLOYED → OPERATIONS";
  document.getElementById("modal").classList.add("open");
  ping(520);
}
function openModal(i){
  const p = PROJECTS[i];
  skillModalMode = false;
  document.getElementById("mTag").textContent = p.tag;
  document.getElementById("mTitle").textContent = p.t;
  document.getElementById("mDesc").textContent = (i === 0 ? "Build guide available. Validation pending. " : "Planned scope. ") + p.d;
  const statusLink = document.getElementById("statusLink");
  statusLink.style.display = "";
  statusLink.href = p.link;
  mLink.href = "https://github.com/RanvirSinghSaini/" + p.link.split("#")[1];
  mLink.setAttribute("target","_blank");
  mLink.textContent = "OPEN REPOSITORY ↗";
  document.getElementById("mStack").innerHTML = p.s.map(x=>`<span>${x}</span>`).join("");
  document.getElementById("modal").classList.add("open");
}
document.getElementById("modalX").addEventListener("click",()=>document.getElementById("modal").classList.remove("open"));
document.getElementById("modal").addEventListener("click",e=>{ if(e.target.id==="modal") e.currentTarget.classList.remove("open"); });
addEventListener("keydown",e=>{ if(e.key==="Escape") document.getElementById("modal").classList.remove("open"); });

/* ---------------- terminal ---------------- */
const termBody = document.getElementById("termBody");
const termInput = document.getElementById("termInput");
const tline = (html, cls="") => { const d=document.createElement("div"); if(cls)d.className=cls; d.innerHTML=html; termBody.appendChild(d); termBody.scrollTop=termBody.scrollHeight; };
tline(`<span class="ok">uplink established.</span> <span class="dim">type</span> help <span class="dim">for commands.</span>`);
const CMDS = {
  help: () => tline(`<span class="dim">commands:</span> whoami · skills · certs · experience · projects · contact · scan · fly &lt;sector&gt; · defcon 1 · close · hack · clear`),
  whoami: () => tline(`Ranvir Singh — Junior Cybersecurity & SOC Analyst, Mississauga ON. <span class="ok">status: monitoring</span>`),
  skills: () => tline(SKILLS.map(s=>s.n).join(" · ") + `<br/><span class="dim">fly skills</span> to review them as cards.`),
  certs: () => tline(`CompTIA Security+ <span class="dim">|</span> PG Cert. Cybersecurity, Sault College — 4.0 GPA <span class="dim">|</span> BCA, Punjabi University Patiala`),
  experience: () => tline(`IT Support Technician Intern — Trios College, Brampton ON (May–Aug 2025): IAM in Entra ID/AD, 95% SLA, 99% CSAT. <span class="ok">fly experience</span> <span class="dim">for the field log.</span>`),
  projects: () => tline(PROJECTS.map((p,i)=>`0${i+1} ${p.t}`).join("<br/>")),
  contact: () => tline(`email: <span class="ok">use the EMAIL link below</span> · response SLA: fast`),
  close: () => closeIncident(),
  clear: () => termBody.innerHTML = "",
  hack: () => { tline(`initiating intrusion…`,"err"); setTimeout(()=>tline(`ACCESS DENIED — this SOC watches its own perimeter. <span class="ok">incident logged.</span>`),700); },
  scan: () => { tline(`scanning perimeter…`,"dim"); setTimeout(()=>tline(`${arcs.filter(p=>p.userData.hostile).length} hostile packets inbound on the threat grid. <span class="ok">fly threat</span> <span class="dim">to engage.</span>`),600); },
};
/* terminal commands that steer the 3D world */
const FLY = { entry:0, operator:1, threat:2, skills:3, experience:4, xp:4, fieldlog:4,
  ops:5, operations:5, projects:5, clearance:6, certs:6, uplink:7, contact:7 };
function flyTo(i){ scrollTo({ top: stopToP(i)*trackH(), behavior: motionOn? "smooth":"auto" }); }
function handleCmd(v){
  if(CMDS[v]) return CMDS[v]();
  if(v.startsWith("fly")){
    const arg = v.split(/\s+/)[1] || "";
    const i = arg in FLY ? FLY[arg] : (parseInt(arg,10)>=1 && parseInt(arg,10)<=8 ? parseInt(arg,10)-1 : -1);
    if(i>=0){ tline(`<span class="ok">course set →</span> ${SECTOR_NAMES[i]}`); return flyTo(i); }
    return tline(`usage: fly entry|operator|threat|skills|experience|ops|clearance|uplink (or 1–8)`,"dim");
  }
  if(v==="defcon 1" || v==="defcon"){ tline(`<span class="err">DEFCON 1 — breach simulation engaged.</span>`); return defcon(); }
  tline(`command not found: ${v}`,"err");
}
termInput.addEventListener("keydown", e=>{
  if(e.key!=="Enter") return;
  const v = termInput.value.trim().toLowerCase(); termInput.value="";
  if(!v) return;
  tline(`<span class="dim">$</span> ${v}`);
  handleCmd(v);
});

/* ---------------- threat feed ticker ---------------- */
const feedEl = document.getElementById("threatFeed");
let feedI = 0;
setInterval(()=>{ if(curSector===2){ feedEl.textContent = FEED[feedI++ % FEED.length]; } }, 3200);

/* ---------------- ambient audio + sonar pings ---------------- */
let actx = null, master = null, sndOn = false;
const sndBtn = document.getElementById("sndBtn");
function buildAudio(){
  actx = new (window.AudioContext||window.webkitAudioContext)();
  master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
  const filt = actx.createBiquadFilter(); filt.type="lowpass"; filt.frequency.value = 420; filt.connect(master);
  [[55,"sawtooth",.5],[110.4,"sine",.8],[164.8,"sine",.25]].forEach(([f,type,g])=>{
    const o = actx.createOscillator(); o.type = type; o.frequency.value = f;
    const og = actx.createGain(); og.gain.value = g*.05;
    o.connect(og); og.connect(filt); o.start();
  });
  const lfo = actx.createOscillator(); lfo.frequency.value = .06;
  const lg = actx.createGain(); lg.gain.value = 180;
  lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
}
function ping(freq){
  if(!sndOn || !actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(freq, actx.currentTime);
  o.frequency.exponentialRampToValueAtTime(freq*.55, actx.currentTime+.22);
  g.gain.setValueAtTime(.12, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime+.25);
  o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime+.26);
}
sndBtn.addEventListener("click", ()=>{
  if(!actx) buildAudio();
  if(actx.state==="suspended") actx.resume();
  sndOn = !sndOn;
  master.gain.linearRampToValueAtTime(sndOn? .5: 0, actx.currentTime+.6);
  sndBtn.textContent = sndOn? "SND ON": "SND OFF";
  sndBtn.classList.toggle("on", sndOn);
});

/* ---------------- KONAMI → DEFCON 1 breach simulation ---------------- */
let defconUntil = 0;
const fogCool = new THREE.Color(0x04070f), fogHot = new THREE.Color(0x1a040a);
const KEY_COOL = new THREE.Color(C.cyan), KEY_HOT = new THREE.Color(C.red);
const KEY_FLASH = new THREE.Color(C.green);
function defcon(){
  defconUntil = performance.now() + 8000;
  document.body.classList.add("defcon");
  document.getElementById("hudThreat").innerHTML = "<i></i>DEFCON&nbsp;1&nbsp;—&nbsp;BREACH&nbsp;SIM";
  showToast("⚠ DEFCON 1", "Breach simulation engaged. Containment in 8s.");
  ping(180); setTimeout(()=>ping(180), 400);
  setTimeout(()=>{
    document.body.classList.remove("defcon");
    document.getElementById("hudThreat").innerHTML = "<i></i>LINK&nbsp;SECURE";
    showToast("CONTAINED", "Simulation complete. Link secure.");
  }, 8000);
}
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let kIdx = 0;
addEventListener("keydown", e=>{
  if(e.target === termInput) return;
  kIdx = (e.key === KONAMI[kIdx]) ? kIdx+1 : (e.key === KONAMI[0] ? 1 : 0);
  if(kIdx === KONAMI.length){ kIdx = 0; defcon(); }
});

/* ---------------- breach-alert boot sequence ---------------- */
const loader = document.getElementById("loader");
const fill = document.getElementById("loaderFill");
const lStatus = document.getElementById("loaderStatus");
const breachLog = document.getElementById("breachLog");
const breachTitle = document.getElementById("breachTitle");
const breachBtn = document.getElementById("breachBtn");
const breachSiren = document.getElementById("breachSiren");
const bSrc = document.getElementById("bSrc");

const BOOT_LINES = [
  { t:"detecting unauthorized session on RS-SOC-01…", c:"hit" },
  { t:"correlating 1,284 events across SIEM…", c:"" },
  { t:"mapping attack path to MITRE ATT&CK…", c:"" },
  { t:"isolating affected node…", c:"" },
  { t:"deploying countermeasures…", c:"" },
  { t:"perimeter restored — analyst on station.", c:"ok" },
];
const STATUS = ["initializing containment…","scanning…","correlating…","containing…","hardening…","SECURE."];
let bootStep = 0, bootDone = false;
// randomize the source IP for flavor
bSrc.textContent = [45,185,103,91][Math.floor(Math.random()*4)] + "." +
  (10+Math.floor(Math.random()*240)) + "." + Math.floor(Math.random()*256) + "." + Math.floor(Math.random()*256);

function bootTick(){
  if(bootStep < BOOT_LINES.length){
    const ln = BOOT_LINES[bootStep];
    const d = document.createElement("div");
    d.className = ln.c; d.textContent = "» " + ln.t;
    breachLog.appendChild(d); breachLog.scrollTop = breachLog.scrollHeight;
    fill.style.width = Math.round((bootStep+1)/BOOT_LINES.length*100) + "%";
    lStatus.textContent = STATUS[Math.min(STATUS.length-1, bootStep)];
    ping(bootStep < 3 ? 320 : 520 + bootStep*60);
    bootStep++;
    setTimeout(bootTick, bootStep === 1 ? 850 : 600 + Math.random()*250);
  } else if(!bootDone){
    bootDone = true;
    // flip from CRITICAL red to SECURED green
    loader.classList.add("secured");
    breachTitle.innerHTML = "<span>THREAT</span><span>CONTAINED</span>";
    breachSiren.textContent = "✓";
    document.querySelector(".breach-level").innerHTML = 'STATUS — <span>SECURE</span>';
    breachBtn.classList.add("ready");
    breachBtn.textContent = "▣ ENTER SECURE SPACE";
  }
}
function revealWorld(){
  if(loader.classList.contains("warp")) return;
  loader.classList.add("warp");
  ping(660); setTimeout(()=>ping(990),120);
  // the 3D world lunges forward to meet you as the panel flies past
  window.__RS_WARP_IN = performance.now();
  setTimeout(()=>loader.classList.add("done"), 900);
}
breachBtn.addEventListener("click", revealWorld);
// auto-reveal if they don't click (so it's never a dead end)
setTimeout(()=>{ if(bootDone && !loader.classList.contains("warp")) revealWorld(); }, 9000);
setTimeout(bootTick, 700);

/* ---------------- motion chip: visible when the OS asks for reduced motion ---------------- */
const motBtn = document.getElementById("motBtn");
function refreshMotBtn(){
  motBtn.style.display = "block";
  motBtn.textContent = motionOn ? "MOTION ON" : "MOTION REDUCED — TAP TO ENABLE";
  motBtn.classList.toggle("dim", motionOn);
}
if(PRM) refreshMotBtn();          // only surfaced when the OS preference froze things
motBtn.addEventListener("click", ()=>{ motionOn = !motionOn; refreshMotBtn(); });

/* ---------------- resize ---------------- */
function applyFov(){
  // widen the vertical FOV on portrait / narrow screens so the ring + cards always fit
  const a = innerWidth/innerHeight;
  camera.fov = a < 1 ? Math.min(86, 62 + (1/a - 1)*30) : 62;
  camera.aspect = a;
  camera.updateProjectionMatrix();
}
applyFov();
addEventListener("resize", ()=>{
  applyFov();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  if(composer) composer.setSize(innerWidth, innerHeight);
});
addEventListener("orientationchange", ()=> setTimeout(()=>{ applyFov(); renderer.setSize(innerWidth,innerHeight); if(composer) composer.setSize(innerWidth,innerHeight); }, 200));

/* =====================================================
   RENDER LOOP
   ===================================================== */
const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), look = new THREE.Vector3();
const ONE = new THREE.Vector3(1,1,1);
const clock = new THREE.Clock();
let lastT = 0, bank = 0;

let tipPk = false;
function tipPacket(hit){
  const on = !!hit;
  if(on !== tipPk){ tipPk = on; tip.style.opacity = on? 1: 0; if(on) tip.textContent = "NEUTRALIZE THREAT"; }
  if(on){ tip.style.left = (pointer.x*.5+.5)*innerWidth+"px"; tip.style.top = (-pointer.y*.5+.5)*innerHeight+"px"; }
}

function frame(){
  requestAnimationFrame(frame);
  try{ frameBody(); }catch(e){
    if(!window.__RS_FRAME_ERR){ window.__RS_FRAME_ERR = e.message; console.error("frame error:", e); }
  }
}
function frameBody(){
  window.__RS_FRAMES = (window.__RS_FRAMES||0) + 1;
  const t = clock.getElapsedTime();
  const dt = Math.min(Math.max(t - lastT, .001), .1); lastT = t;

  // eased scroll
  prog += (target - prog) * (motionOn? damp(4.5, dt): 1);
  if(Math.abs(target-prog) < .0004) prog = target;

  // camera along path (weighted timeline: ring sector holds for the carousel)
  const m = mapScroll(prog);
  const seg = m.seg, c = m.c, inHold = c >= 0;
  launchCircuit.visible = seg < 1.5;
  radar.visible = seg > 1.2 && seg < 2.9;
  projectBus.visible = seg > 4.25 && seg < 6.25;
  if (motionOn) signalTime.value += dt;
  const i = Math.min(N-2, Math.floor(seg));
  const f = smooth(seg - i);
  v0.fromArray(STOPS[i].p);   v1.fromArray(STOPS[i+1].p);   v0.lerp(v1, f);
  look.fromArray(STOPS[i].l); v1.fromArray(STOPS[i+1].l);   look.lerp(v1, f);

  // mouse parallax
  const dm = damp(6, dt);
  mouse.sx += (mouse.x - mouse.sx)*dm; mouse.sy += (mouse.y - mouse.sy)*dm;
  const pk = inHold ? .18 : 1;                 // cards park dead-center: calm the parallax
  v0.x += mouse.sx*.7*pk; v0.y -= mouse.sy*.45*pk;
  // entry lunge: start pulled back, rush forward to meet the hero as the panel flies past
  if(window.__RS_WARP_IN){
    const wt = (performance.now() - window.__RS_WARP_IN) / 1100;
    if(wt < 1){ v0.z += (1 - smooth(wt)) * 9; }   // +9 units back, eased to 0
    else window.__RS_WARP_IN = 0;
  }
  camera.position.copy(v0);
  camera.lookAt(look);
  // bank into the turn: roll from scroll velocity + lateral mouse
  bank = lerp(bank, (Math.max(-.14, Math.min(.14, (target-prog)*2.2)) + mouse.sx*.04) * (inHold? .25:1), damp(5, dt));
  camera.rotation.z += bank;

  // sector + hint + hud
  setSector(Math.round(seg));

  // hero fly-through: the name + description fly out FIRST, then as they're
  // about to exit, the cyber-core dramatically expands (staged, not simultaneous)
  if(heroFly){
    const raw = Math.max(0, Math.min(1, seg));        // 0 at entry → 1 by sector 1
    // name/description: fly out over the first 45% of the transition (quicker exit)
    const nameP = Math.max(0, Math.min(1, raw / 0.45));
    // core expansion: begins at 35% (name nearly gone) and peaks by 75%,
    // while the camera is still close enough to witness the bloom
    const expandP = Math.max(0, Math.min(1, (raw - 0.35) / 0.40));
    core.userData.expand = smooth(expandP);
    if(raw > 0.001){
      const e = smooth(nameP);
      const ovlHero = ovls[0];
      ovlHero.classList.add("flying");
      heroFly.style.transform = `scale(${1 + e*5.5}) translateZ(${e*460}px)`;
      heroFly.style.filter = `blur(${e*12}px)`;
      heroFly.style.opacity = String(Math.max(0, 1 - e*1.15));
    } else {
      heroFly.style.transform = "";
      heroFly.style.filter = "";
      heroFly.style.opacity = "";
      ovls[0].classList.remove("flying");
    }
  }
  if(inHold){
    const ai = Math.max(0, Math.min(K-1, Math.floor(c)));
    hudSection.textContent = `SKILL ${String(ai+1).padStart(2,"0")}/${K} — ${SKILLS[ai].n.toUpperCase()}`;
    if(ai !== lastActiveSkill){ lastActiveSkill = ai; ping(440 + ai*22); }
    updateDots(ai);
  } else if(lastActiveSkill !== -1){ lastActiveSkill = -1; hudSection.textContent = SECTOR_NAMES[curSector]; updateDots(-1); }
  hint.classList.toggle("gone", prog > .015);
  hudCoord.textContent = `CAM ${v0.x.toFixed(2)} / ${v0.y.toFixed(2)} / ${v0.z.toFixed(2)}`;

  if(motionOn){
    // hero core — base animation
    core.rotation.y = t*.25; core.rotation.x = Math.sin(t*.3)*.15;
    core.userData.r1.rotation.z = t*.4; core.userData.r2.rotation.z = -t*.3;
    core.userData.r3.rotation.z = t*.22;
    core.position.y = 1.5 + Math.sin(t*.8)*.12;

    // expansion driver (0 compact → 1 fully blown open)
    const ex = core.userData.expand || 0;
    const sh = core.userData.shells;
    // nested shells drift apart and the whole core swells
    core.scale.setScalar(1 + ex*0.6);
    sh.shellDodeca.scale.setScalar(1 + ex*1.4);
    sh.shellDodeca.material.opacity = .18 + ex*.4;
    sh.shellDodeca.rotation.y = -t*.18;
    sh.shellMid.scale.setScalar(1 + ex*0.5);
    sh.shellCoreSolid.rotation.y = t*.6; sh.shellCoreSolid.rotation.x = t*.4;
    sh.shellCoreSolid.material.color.setHex(ex>.5? C.red: C.green);
    // plain rings expand outward
    [core.userData.r1, core.userData.r2, core.userData.r3].forEach((rg,i)=>{
      rg.scale.setScalar(1 + ex*(0.6+i*0.3));
      rg.material.opacity = (i===2? .3: .5) * (1 - ex*.3);
    });
    // orbiting sentinels fling wider as it expands
    core.userData.orbs.forEach((o,k)=>{
      const a = o.userData.a + t*.7;
      const rr = o.userData.r * (1 + ex*1.3);
      o.position.set(Math.cos(a)*rr, Math.sin(a*1.3)*.8*(1+ex), Math.sin(a)*rr);
      o.scale.setScalar(1 + ex*.8);
    });
    // particle halo bursts outward
    if(core.userData.halo){
      const hp = core.userData.halo.geometry.attributes.position;
      const dirs = core.userData.haloDir;
      for(let i=0;i<dirs.length;i++){
        const rr = 2 + ex*4.5 + Math.sin(t*1.5 + i)*.15;
        hp.array[i*3]=dirs[i].x*rr; hp.array[i*3+1]=dirs[i].y*rr; hp.array[i*3+2]=dirs[i].z*rr;
      }
      hp.needsUpdate = true;
      core.userData.halo.material.opacity = .25 + ex*.55;
      core.userData.halo.material.color.setHex(ex>.6? C.green: C.cyan);
    }
    // attack-technique rings spin in, fade up, and expand
    core.userData.ttpRings.forEach((band,i)=>{
      band.visible = ex > 0.02;
      band.rotation.z = t * band.userData.spin;
      const bs = 0.3 + ex*0.9;       // grow from small to full
      band.scale.setScalar(bs);
      band.traverse(o=>{ if(o.material){ o.material.transparent = true; o.material.opacity = Math.min(1, ex*1.4) * (o.type==="Sprite"? 1: .55); } });
    });

    // globe spin + attack packets
    if(!drag.on) globe.rotation.y += dt*.12;
    arcs.forEach(pk=>{
      const ud = pk.userData;
      const u = (t*ud.speed + ud.off) % 1;
      pk.position.copy(ud.curve.getPoint(u));
      pk.scale.lerp(ONE, damp(5, dt));                       // ease back after neutralize pop
      if(!ud.hostile && ud.cool > 0){                // cooldown, then re-arm hostile
        ud.cool -= dt;
        if(ud.cool <= 0){
          ud.hostile = true;
          pk.material.color.setHex(C.red); ud.line.material.color.setHex(C.red);
        }
      }
    });
    const mk = globe.userData.marker; mk.scale.setScalar(1 + Math.sin(t*4)*.25);

    // monoliths idle + hover ease
    monoliths.forEach((mm,k)=>{
      mm.position.y = 1.6 + Math.sin(t*.9 + k)*.1;
      const want = mm.userData.hover? 1: 0;
      mm.userData.h = lerp(mm.userData.h||0, want, damp(8, dt));
      mm.userData.edges.material.color.setHex(mm.userData.h>.5? C.green: C.cyan);
      mm.scale.setScalar(1 + mm.userData.h*.06);
    });

    // shield
    shield.rotation.y = t*.35;
    shield.userData.r1.rotation.z = t*.5;
    shield.userData.halo.rotation.y = -t*.2;

    // career helix
    helix.rotation.y = t*.4;

    // streaks fly forward
    streaks.forEach(s=>{
      s.visible = true;
      s.position.z += s.userData.v * warp;
      if(s.position.z > camera.position.z + 6) s.position.z -= 250;
    });
  } else streaks.forEach(s=>{ s.visible = false; });

  /* ---- SKILL RING CAROUSEL (scroll-driven, runs even with reduced motion) ---- */
  if(inHold && !wasHold) holdBase = ringRot - c*STEP;   // seamless takeover
  if(inHold) ringRot = holdBase + c*STEP;               // scroll spins the ring
  else if(motionOn) ringRot += dt*.1;                       // idle station-keeping
  wasHold = inHold;
  ringGrp.rotation.z = ringRot;

  skillCards.forEach((card,k)=>{
    const ud = card.userData;
    // plateau profile: fly in (22%), DWELL at center (56%), fly back (22%)
    let want = 0;
    if(inHold){
      const lc = c - k;
      if(lc >= 0 && lc < 1){
        if(lc < .15)      want = smooth(lc/.15);       // ~1 scroll: card flies in
        else if(lc < .60) want = 1;                    // ~3 scrolls: card holds dead-center
        else              want = smooth((1-lc)/.40);   // ~2 scrolls: card recedes into the ring
      }
    }
    ud.b = lerp(ud.b, want, damp(9, dt));
    ud.hoverBoost = lerp(ud.hoverBoost, ud.hover? 1: 0, damp(10, dt));
    if(ud.b < .012){ card.visible = false; }
    else {
      card.visible = true;
      ud.node.getWorldPosition(vHome);                  // detach point rides the spinning ring
      card.position.copy(vHome).lerp(CARD_FRONT, ud.b);
      card.scale.setScalar(.001 + ud.b*(1 + ud.hoverBoost*.06));
      card.material.opacity = ud.b;
      card.lookAt(camera.position);
    }
    ud.node.material.color.setHex(ud.b > .5 ? C.green : C.cyan);
    ud.node.scale.setScalar(1 + ud.b*.6);
    // emblem badge: billboard to camera, spin frame, pulse + go green when active
    const bg = skillBadges[k];
    if(bg){
      bg.quaternion.copy(camera.quaternion);
      bg.userData.frame.rotation.z = t * bg.userData.spin;
      const lit = ud.b > .5 || ud.hover;
      bg.userData.frame.material.color.setHex(lit ? C.green : C.cyan);
      bg.userData.frame.material.opacity = .35 + ud.b*.5;
      const sc = 1 + ud.b*.9 + ud.hoverBoost*.25;
      bg.scale.setScalar(sc);
      bg.userData.glyph.material.opacity = .55 + ud.b*.45;
    }
    if(ud.b > .9) skillsSeen.add(k);
  });
  if(inHold) lastC = Math.max(lastC, c);
  if((inHold && c >= K - .15) || (!inHold && wasHoldPrev && seg > 3 && lastC >= K - 1.2)) ringComplete();
  wasHoldPrev = inHold;
  // fade the skills heading out of the way once a card is forward (keeps cards clean on mobile)
  {
    let maxB = 0; for(const cd of skillCards) if(cd.userData.b > maxB) maxB = cd.userData.b;
    const ov = ovls[3];
    if(ov){
      const op = inHold ? (1 - maxB*0.92) : 1;
      ov.style.opacity = inHold ? String(op.toFixed(3)) : "";
      // dots ride above the fade so you always see your place in the ring
      skillDots.style.opacity = inHold ? String(Math.max(op, 0.85)) : "";
      skillDots.style.transform = inHold ? "translateZ(0)" : "";
    }
  }
  // halo breathes while the carousel is live
  halo.material.opacity = inHold ? .55 + Math.sin(t*3)*.2 : .55;
  // completion shockwave
  const sw = (performance.now() - shockT0)/1200;
  if(sw >= 0 && sw <= 1){
    shock.visible = true;
    shock.scale.setScalar(1 + sw*9);
    shock.material.opacity = .9*(1-sw);
  } else shock.visible = false;

  /* ---- ticket queue: orbit, bob, cooldown re-open ---- */
  tickets.forEach(tk=>{
    const u = tk.userData;
    if(motionOn) u.a += dt*u.spd;
    tk.position.set(helix.position.x + Math.cos(u.a)*u.r, helix.position.y + u.y + Math.sin(t*1.2+u.a)*.12,
                    helix.position.z + Math.sin(u.a)*u.r);
    tk.lookAt(camera.position);
    tk.scale.lerp(ONE, damp(5, dt));
    if(!u.open){ u.cool -= dt; if(u.cool<=0){ u.open=true; tk.material.map=u.texOpen; tk.material.needsUpdate=true; } }
  });

  /* ---- clearance badges orbit + verify flash ---- */
  const vT = performance.now() - verifyT0;
  badgeNodes.forEach((bg,i)=>{
    const a = bg.userData.a + (motionOn? t*.5 : 0);
    bg.position.set(Math.cos(a)*3.1, Math.sin(a*1.4)*.9, Math.sin(a)*3.1);
    const lit = vT > 250 + i*480 && vT < 60000;
    bg.userData.node.material.color.setHex(lit? C.green : C.cyan);
    bg.userData.node.scale.setScalar(lit && vT < 2400 ? 1.7 : 1);
  });

  /* ---- closure drama: shake, warp decay, green flash, burst ---- */
  if(shake > 0){
    camera.position.x += (Math.random()-.5)*shake;
    camera.position.y += (Math.random()-.5)*shake*.6;
    shake = Math.max(0, shake - dt*1.1);
  }
  warp = 1 + (warp-1)*Math.exp(-dt*1.3);
  const bu = (performance.now()-burstT0)/1600;
  if(bu >= 0 && bu <= 1){
    for(let i=0;i<BURST_N;i++){
      burstPos[i*3]   += burstVel[i].x*dt*3;
      burstPos[i*3+1] += burstVel[i].y*dt*3;
      burstPos[i*3+2] += burstVel[i].z*dt*3;
    }
    burstGeo.attributes.position.needsUpdate = true;
    burst.material.opacity = 1-bu;
  } else burst.visible = burstT0 < 0 ? false : (bu <= 1);
  if(curSector === 7 && (window.__RS_FRAMES % 12 === 0) && !incidentClosed) updateIncidentPanel();

  // DEFCON 1 world tint
  const hot = performance.now() < defconUntil;
  scene.fog.color.lerp(hot? fogHot: fogCool, damp(4, dt));
  scene.background.copy(scene.fog.color);
  const gflash = performance.now() < flashUntil;
  key.color.lerp(hot? KEY_HOT: (gflash? KEY_FLASH: KEY_COOL), damp(4, dt));
  if(bloomPass) bloomPass.strength = lerp(bloomPass.strength, hot? 1.5: (gflash? 1.35: .85), damp(4, dt));

  // skill card hover (during the carousel hold)
  if(inHold && !hovered){
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(skillCards.filter(cd=>cd.userData.b > .35))[0];
    const card = hit? hit.object: null;
    if(card !== hoveredCard){
      if(hoveredCard) hoveredCard.userData.hover = 0;
      hoveredCard = card;
      if(card){
        card.userData.hover = 1;
        tip.textContent = "OPEN: " + SKILLS[card.userData.idx].n.toUpperCase();
        tip.style.opacity = 1; document.body.style.cursor="pointer";
      } else { tip.style.opacity = 0; document.body.style.cursor=""; }
    }
    if(hoveredCard){ tip.style.left = (pointer.x*.5+.5)*innerWidth+"px"; tip.style.top = (-pointer.y*.5+.5)*innerHeight+"px"; }
  } else if(hoveredCard){ hoveredCard.userData.hover=0; hoveredCard=null; tip.style.opacity=0; document.body.style.cursor=""; }

  // ticket hover (field log)
  if(seg > 3.4 && seg < 4.6 && !hovered){
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(tickets.filter(tk=>tk.userData.open))[0];
    document.body.style.cursor = hit? "pointer": "";
    if(hit){ tip.textContent = "RESOLVE: " + hit.object.userData.type;
      tip.style.opacity = 1;
      tip.style.left = (pointer.x*.5+.5)*innerWidth+"px"; tip.style.top = (-pointer.y*.5+.5)*innerHeight+"px";
    } else if(!hoveredCard) tip.style.opacity = 0;
  }
  // shield hover (clearance)
  if(seg > 5.4 && seg < 6.6){
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(shield.children, true)[0];
    document.body.style.cursor = hit? "pointer": "";
    if(hit){ tip.textContent = "RUN CLEARANCE VERIFICATION";
      tip.style.opacity = 1;
      tip.style.left = (pointer.x*.5+.5)*innerWidth+"px"; tip.style.top = (-pointer.y*.5+.5)*innerHeight+"px";
    } else tip.style.opacity = 0;
  }

  // packet hover cursor on the threat grid
  if(seg > 1.4 && seg < 2.6 && !drag.on){
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(arcs.filter(p=>p.userData.hostile).map(p=>p.userData.hit))[0];
    document.body.style.cursor = hit? "pointer": "";
    tipPacket(hit);
  } else if(tipPk){ tipPacket(null); }

  // raycast monoliths only near corridor
  if(seg > 4.4 && seg < 6.4){
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(monoliths.map(m=>m.userData.box))[0];
    const grp = hit? hit.object.userData.monolith: null;
    if(grp !== hovered){
      if(hovered) hovered.userData.hover = 0;
      hovered = grp;
      if(hovered){ hovered.userData.hover = 1; document.body.style.cursor="pointer"; }
      else document.body.style.cursor="";
      tip.style.opacity = hovered? 1: 0;
      if(hovered) tip.textContent = "OPEN: " + PROJECTS[hovered.userData.idx].t.toUpperCase();
    }
    if(hovered){ tip.style.left = (pointer.x*.5+.5)*innerWidth+"px"; tip.style.top = (-pointer.y*.5+.5)*innerHeight+"px"; }
  } else if(hovered){ hovered.userData.hover=0; hovered=null; tip.style.opacity=0; document.body.style.cursor=""; }

  if(composer) composer.render(); else renderer.render(scene, camera);
}
window.__RS_BOOTED = true;
frame();

})();
