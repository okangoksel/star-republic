import {item} from "./items.js";import {NPCS,nearestNPC,drawNPC} from "./npcs.js";import {Marketplace} from "./marketplace.js";
const ENEMIES=["zombie","fast_zombie","miner_zombie"];
export class Systems{
 constructor(game){this.game=game;this.enemies=[];this.particles=[];this.lastSpawn=0;this.gatherCd=0;this.lastDay=game.world.day;this.lastWeather=game.world.weather;this.farmSlots=[];this.market=new Marketplace(game);this.initFarm()}
 initFarm(){for(let y=250;y<490;y+=48)for(let x=185;x<570;x+=48)this.farmSlots.push({x,y,state:"empty",growth:0,watered:false})}
 update(dt){this.market.refresh();this.gatherCd=Math.max(0,this.gatherCd-dt);
  const beforeDay=this.game.world.day,beforeWeather=this.game.world.weather;this.game.world.update(dt);
  if(this.game.world.day!==beforeDay){this.lastDay=this.game.world.day;this.game.player.energy=this.game.player.maxEnergy;this.game.ui.toast("Yeni gün başladı. Enerjin yenilendi.");this.game.save(true)}
  if(!this.game.world.isNight()&&this.enemies.length)this.enemies.length=0;
  if(this.game.world.weather!==beforeWeather){this.lastWeather=this.game.world.weather;this.game.ui.toast("Hava değişti: "+this.game.ui.weatherName(this.game.world.weather));}this.lastSpawn+=dt;
  if(!this.game.world.isNight())this.game.player.energy=Math.min(this.game.player.maxEnergy,this.game.player.energy+dt*1.2);
  for(const crop of this.farmSlots){
    if(crop.state==="growing"){
      if(this.game.world.weather==="rain")crop.watered=true;
      if(crop.watered){crop.growth+=dt*(this.game.world.weather==="rain"?1.35:1);if(crop.growth>=15){crop.state="ready";crop.watered=false}}
    }
  }
  if(this.game.world.isNight()&&this.lastSpawn>6&&this.enemies.length<7){this.spawnZombie();this.lastSpawn=0}
  for(const e of this.enemies){const p=this.game.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;if(d<500){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}if(d<28&&e.cd<=0){p.hp=Math.max(0,p.hp-e.damage);e.cd=1;this.game.ui.toast("Dikkat!");if(p.hp<=0){p.hp=p.maxHp;p.energy=Math.max(0,p.energy-25);p.x=390;p.y=360;this.game.ui.toast("Bayıldın! Eve döndün.")}}e.cd=Math.max(0,e.cd-dt)}
  this.particles=this.particles.filter(x=>(x.life-=dt)>0);
 }
 spawnZombie(){const p=this.game.player,a=Math.random()*Math.PI*2,d=280+Math.random()*250;this.enemies.push({type:ENEMIES[Math.floor(Math.random()*ENEMIES.length)],x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,hp:20,speed:Math.random()<.2?88:60,damage:5,cd:0})}
 spawnDawnWave(){const n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++)this.spawnZombie();this.game.ui.toast("Şafak baskını! Gece kalan zombiler geri döndü.");}
 handStrike(){this.attackAt(this.game.mouse.x-this.game.world.screenOffsetX,this.game.mouse.y-this.game.world.screenOffsetY,3,"Tokat");}
 hit(x,y,dmg){
  this.attackAt(x,y,dmg,"Vuruş");
 }
 attackAt(x,y,dmg,label){
  let best=null,bd=48;for(const e of this.enemies){const d=Math.hypot(e.x-x,e.y-y);if(d<bd){best=e;bd=d}}
  if(best){best.hp-=dmg;this.particles.push({x:best.x,y:best.y,text:"-"+dmg,life:.6});if(best.hp<=0){this.game.player.addItem("stone",1+Math.floor(Math.random()*2));this.game.player.gainXp(25);this.particles.push({x:best.x,y:best.y,text:"+Taş",life:1});this.enemies.splice(this.enemies.indexOf(best),1);this.game.ui.toast("Tehdit dağıldı. Bir şeyler topladın.")}}
 }
 sleepOrInstallBed(){
  const p=this.game.player,w=this.game.world;
  const nearBed=Math.hypot(p.x-390,p.y-168)<75;
  if(!nearBed)return false;
  if(!w.bedInstalled){
   if((p.inventory.bed||0)<1){this.game.ui.toast("Önce C ile Yatak üretmelisin.");return true}
   if(w.isNight()){p.removeItem("bed",1);w.bedInstalled=true;this.game.ui.toast("Yatak kuruldu. E ile uyuyabilirsin.");this.game.save();this.sleepAtBed();return true}
   p.removeItem("bed",1);w.bedInstalled=true;this.game.ui.toast("Yatak eve yerleştirildi.");this.game.save();return true;
  }
  if(w.isNight()){this.sleepAtBed();return true}
  this.game.ui.toast("Yatak gece kullanılabilir.");
  return true;
 }
 sleepAtBed(){
  const w=this.game.world,p=this.game.player;
  w.time=6*60;w.day++;w.regrowResources();w.rollWeather();this.enemies.length=0;w.dawnWavePending=false;
  p.energy=p.maxEnergy;p.hp=p.maxHp;p.x=390;p.y=360;this.game.ui.toast("İyi dinlendin. Gün "+w.day+" başladı.");this.game.save(true);
 }
 tryHiddenDiscovery(){
  const p=this.game.player,w=this.game.world;
  const checks=[
    {key:"groveShrine",x:1360,y:475,name:"Korunun Gizli Sunağı",reward:"ancient_relic",amount:1,xp:30,msg:"Gizli keşif: Eski Korunun sunağını buldun."},
    {key:"meteorCrater",x:1010,y:375,name:"Göktaşı Krateri",reward:"star_fragment",amount:1,xp:40,msg:"Gizli keşif: Göktaşı Krateri bulundu."},
    {key:"oldCabin",x:1190,y:205,name:"Eski Kulübe",reward:"wood",amount:3,xp:20,msg:"Gizli keşif: Eski Kulübenin izlerini buldun."}
  ];
  for(const d of checks){
    if(w.hiddenDiscoveries?.[d.key])continue;
    if(Math.hypot(p.x-d.x,p.y-d.y)<70){
      if(!w.hiddenDiscoveries)w.hiddenDiscoveries={groveShrine:false,meteorCrater:false,oldCabin:false};
      w.hiddenDiscoveries[d.key]=true;
      p.addItem(d.reward,d.amount);
      p.gainXp(d.xp);
      this.game.ui.toast(d.msg+" +"+d.amount+" "+item(d.reward).name);
      this.game.save();
      return true;
    }
  }
  return false;
 }
 interact(){
  if(this.sleepOrInstallBed())return;
  const p=this.game.player;const npc=nearestNPC(p);if(npc){if(npc.id==="mira")this.settlementInteract();else this.game.ui.npc(npc);return}
  if(this.tryHiddenDiscovery())return;
  let near=null,dist=999;
  for(const r of this.game.world.resources){const d=Math.hypot(p.x-r.x,p.y-r.y);if(d<45&&d<dist){near=r;dist=d}}
  if(near){this.gather(near);return}
  if(Math.hypot(p.x-1610,p.y-650)<75){this.exploreMine();return}
  if(Math.hypot(p.x-1400,p.y-500)<75){this.exploreGrove();return}
  if(this.game.world.inFarm(p.x,p.y)){const slot=this.farmSlots.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<30);if(!slot)return;
   if(slot.state==="ready"){
     const out={wheat:"wheat",carrot:"carrot",potato:"potato",tomato:"tomato",corn:"corn",starfruit:"starfruit",moonberry:"moonberry"}[slot.crop]||"wheat";
     p.addItem(out,2);p.gainXp(18);slot.state="empty";slot.growth=0;slot.watered=false;slot.seed=null;slot.crop=null;this.game.ui.toast(item(out).name+" hasat edildi.");
   }else if(slot.state==="growing"&&!slot.watered&&p.energy>=2){slot.watered=true;p.energy-=2;this.game.ui.toast("Toprak canlandı.")}
   else if(slot.state==="empty"){
     if(p.energy<2){this.game.ui.toast("Ekim için en az 2 enerji gerekiyor.");return}
     const seeds=["wheat_seed","carrot_seed","potato_seed","tomato_seed","corn_seed","starfruit_seed","moonberry_seed","reed_seed"].filter(id=>(p.inventory[id]||0)>0);
     if(!seeds.length){this.game.ui.toast("Önce bir tohum bul veya üret. Çantayı I ile aç.");return}
     const hotId=p.inventoryOrder?.[p.hotbar];const seed=hotId&&seeds.includes(hotId)?hotId:seeds[0];if(p.removeItem(seed,1)){slot.state="growing";slot.growth=0;slot.watered=true;slot.seed=seed;slot.crop={wheat_seed:"wheat",reed_seed:"wheat",carrot_seed:"carrot",potato_seed:"potato",tomato_seed:"tomato",corn_seed:"corn",starfruit_seed:"starfruit",moonberry_seed:"moonberry"}[seed];p.energy-=2;p.gainXp(5);this.game.ui.toast(item(seed).name+" ekildi.");}
   }else this.game.ui.toast("Bu tarla karesi hazır değil.")
  }
 }
 exploreMine(){
  const p=this.game.player,w=this.game.world;if(p.energy<8){this.game.ui.toast("Madene girmek için daha fazla enerji gerekiyor.");return}
  const depth=Math.min(3,(w.mineDepth||0)+1);w.mineDepth=depth;p.energy-=8;
  const stone=2+depth;p.addItem("stone",stone);if(Math.random()<0.35+depth*.1)p.addItem("iron",1);if(Math.random()<0.25)p.addItem("flint",1);
  p.gainXp(12+depth*3);this.game.ui.toast("Maden yankısı: "+stone+" taş topladın. Derinlik "+depth+"/3");
  if(depth===3&&!p.discoveries.deepMine){p.discoveries.deepMine=true;this.game.ui.toast("Keşif: Madenin altında daha eski bir damar var.")}this.game.save();
}
exploreGrove(){
  const p=this.game.player;if(p.energy<5){this.game.ui.toast("Koruyu incelemek için enerji gerekiyor.");return}
  p.energy-=5;p.addItem("wood",1+Math.floor(Math.random()*2));p.addItem("fiber",1);if(Math.random()<.25)p.addItem("reed",1);p.gainXp(8);
  if(!p.discoveries.grove){p.discoveries.grove=true;this.game.ui.toast("Keşif: Eski Korunun içinde düzenli büyüyen yabani bitkiler var.")}else this.game.ui.toast("Korudan kullanılabilir malzeme buldun.");this.game.save();
}
gather(r){
  if(this.gatherCd>0)return;
  const p=this.game.player;this.gatherCd=.18;const tool=p.equipment.tool;const cost=tool==="crude_tool"?1.5:tool==="hand_axe"?1.25:tool==="iron_tool"||tool==="iron_axe"?1:2;if(p.energy<cost){this.game.ui.toast("Enerjin az.");return}
  let id="stone",gain=1;
  if(r.type==="branch"){id="branch";gain=1+(Math.random()<.35?1:0)+(tool==="hand_axe"||tool==="iron_axe"?1:0)+(tool==="iron_axe"&&Math.random()<.3?1:0)}
  if(r.type==="fiber"){id="fiber";gain=1}
  if(r.type==="reed"){id="reed";gain=1}
  if(r.type==="bloom"){id="astral_dust";gain=tool==="astral_compass"?2:1}
  if(r.type==="rock"){id=Math.random()<.18?"flint":"stone";gain=tool==="crude_tool"||tool==="iron_tool"?2:1;if(tool==="iron_tool"&&Math.random()<.35)gain++}
  if(r.type==="crystal"){id=Math.random()<.22?"echo_shard":"crystal";gain=1+(this.game.world.echoLevel>=2?1:0)+(tool==="resonance_lens"?1:0)}
  if(r.type==="moonstone"){id="moonstone";gain=tool==="resonance_lens"?2:1}
  if(r.type==="ancient_relic"){id="ancient_relic";gain=1}
  if(r.type==="glow_mushroom"){id="glow_mushroom";gain=1+(Math.random()<.25?1:0)}
  if(r.type==="star_fragment"){id="star_fragment";gain=tool==="resonance_lens"?2:1}
  p.addItem(id,gain);
  const resonanceGain=r.type==="bloom"?12:(r.type==="crystal"?5:(r.type==="star_fragment"?15:(r.type==="moonstone"?7:(r.type==="ancient_relic"?9:(r.type==="rock"?2:1)))));
  p.resonance=Math.min(100,p.resonance+resonanceGain);
  if(r.type==="bloom"){p.discoveries.bloom=true;this.game.world.echoLevel=Math.max(this.game.world.echoLevel,1);this.game.ui.toast("Astral Bloom keşfedildi: dünya senden bir şey saklıyor.")}
  if(p.resonance>=25&&!p.discoveries.resonanceSense){p.discoveries.resonanceSense=true;this.game.ui.toast("Yeni keşif: Yankı Duyusu. Bazı kaynaklar artık farklı davranabilir.")}
  if(p.resonance>=60&&!p.discoveries.echoMap){p.discoveries.echoMap=true;this.game.world.echoLevel=2;this.game.ui.toast("Yeni keşif: Yankı Haritası. Dünyanın izleri güçleniyor.")}
  p.energy=Math.max(0,p.energy-cost);p.gainXp(r.type==="star_fragment"?30:(tool?5:4));
  r.hp--;if(r.hp<=0)this.game.world.resources.splice(this.game.world.resources.indexOf(r),1);
  this.game.ui.toast(item(id).name+" topladın.");
 }
 render(c){
  c.save();c.translate(this.game.world.screenOffsetX,this.game.world.screenOffsetY);for(const n of NPCS)drawNPC(c,n);c.fillStyle="#f6d36b";c.font="bold 12px system-ui";for(const n of NPCS)c.fillText(n.name,n.x-22,n.y-34);
  for(const s of this.farmSlots){c.fillStyle="#765337";c.fillRect(s.x-18,s.y-18,36,36);if(s.state==="growing"){c.fillStyle="#5fae52";const h=8+Math.min(18,s.growth);c.fillRect(s.x-3,s.y+7-h,6,h)}if(s.state==="ready"){c.fillStyle="#d8b94e";c.fillRect(s.x-7,s.y-13,14,22)}}
  for(const e of this.enemies){c.fillStyle="#4a8a52";c.fillRect(e.x-12,e.y-12,24,24);c.fillStyle="#111";c.fillRect(e.x-7,e.y-4,4,4);c.fillRect(e.x+3,e.y-4,4,4);c.fillStyle="#8b2d2d";c.fillRect(e.x-12,e.y-19,24,4)}
  for(const q of this.particles){c.fillStyle="#fff";c.font="bold 14px system-ui";c.fillText(q.text,q.x,q.y-(1-q.life)*35)}
  if(this.game.world.bedInstalled){c.fillStyle="#6b4b33";c.fillRect(372,150,36,12);c.fillStyle="#d9c6a5";c.fillRect(378,143,24,12);c.fillStyle="#8aa4c4";c.fillRect(378,143,24,5);}
  const p=this.game.player;let hint="";let hd=60;
  for(const r of this.game.world.resources){const d=Math.hypot(p.x-r.x,p.y-r.y);if(d<hd){hd=d;hint=r.type==="bloom"?"✦ Astral Bloom · E keşfet":"E · Kaynak topla"}}
  const npc=nearestNPC(p);if(npc){hint="E · "+npc.name+" ile konuş";hd=0}
  if(Math.hypot(p.x-1610,p.y-650)<75)hint="E · Madeni keşfet";
  if(Math.hypot(p.x-1400,p.y-500)<75)hint="E · Eski Koruyu incele";
  if(Math.hypot(p.x-390,p.y-168)<75)hint=this.game.world.bedInstalled?(this.game.world.isNight()?"E · Uyu ve sabaha geç":"Yatak · Gece kullanılabilir"):"E · Yatağı yerleştir";
  if(hint){c.setTransform(1,0,0,1,0,0);c.fillStyle="rgba(10,14,20,.82)";c.fillRect(c.canvas.width/2-150,c.canvas.height-92,300,34);c.fillStyle="#fff";c.font="bold 14px system-ui";c.textAlign="center";c.fillText(hint,c.canvas.width/2,c.canvas.height-70);c.textAlign="left"}
  c.restore();
 }
}
