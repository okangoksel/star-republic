const ENEMIES=["zombie","fast_zombie","miner_zombie"];
export class Systems{
 constructor(game){this.game=game;this.enemies=[];this.particles=[];this.lastSpawn=0;this.crops=[];this.farmSlots=[];this.initFarm()}
 initFarm(){for(let y=250;y<490;y+=48)for(let x=185;x<570;x+=48)this.farmSlots.push({x,y,state:"empty",growth:0,watered:false})}
 update(dt){
  this.game.world.update(dt);this.lastSpawn+=dt;
  if(!this.game.world.isNight())this.game.player.energy=Math.min(this.game.player.maxEnergy,this.game.player.energy+dt*1.2);
  for(const crop of this.farmSlots)if(crop.state==="growing"&&crop.watered){crop.growth+=dt;if(crop.growth>=15){crop.state="ready";crop.watered=false}}
  if(this.game.world.isNight()&&this.lastSpawn>3.8&&this.enemies.length<12){this.spawnZombie();this.lastSpawn=0}
  for(const e of this.enemies){const p=this.game.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;if(d<500){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}if(d<28&&e.cd<=0){p.hp=Math.max(0,p.hp-e.damage);e.cd=1;this.game.ui.toast("Bir düşman sana ulaştı!");if(p.hp<=0){p.hp=p.maxHp;p.energy=Math.max(0,p.energy-25);p.x=390;p.y=360;this.game.ui.toast("Bayıldın! Eve döndün.")}}e.cd=Math.max(0,e.cd-dt)}
  this.particles=this.particles.filter(x=>(x.life-=dt)>0);
 }
 spawnZombie(){const p=this.game.player,a=Math.random()*Math.PI*2,d=280+Math.random()*250;this.enemies.push({type:ENEMIES[Math.floor(Math.random()*ENEMIES.length)],x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,hp:35,speed:Math.random()<.25?95:65,damage:7,cd:0})}
 hit(x,y,dmg){
  let best=null,bd=48;for(const e of this.enemies){const d=Math.hypot(e.x-x,e.y-y);if(d<bd){best=e;bd=d}}
  if(best){best.hp-=dmg;this.particles.push({x:best.x,y:best.y,text:"-"+dmg,life:.6});if(best.hp<=0){const drop=Math.random()<.22?"wheat_seed":"stone";this.game.player.addItem(drop,1+Math.floor(Math.random()*2));this.game.player.gold+=5;this.game.player.gainXp(25);this.particles.push({x:best.x,y:best.y,text:"+5 G",life:1});this.enemies.splice(this.enemies.indexOf(best),1);this.game.ui.toast("Düşman yenildi! Loot aldın.")}}
 }
 interact(){
  const p=this.game.player;let near=null,dist=999;
  for(const r of this.game.world.resources){const d=Math.hypot(p.x-r.x,p.y-r.y);if(d<45&&d<dist){near=r;dist=d}}
  if(near){if(p.energy<4){this.game.ui.toast("Enerjin az!");return}near.hp--;const gain=near.type==="tree"?"wood":"stone";p.addItem(gain,1);p.energy=Math.max(0,p.energy-4);p.gainXp(8);this.game.ui.toast(near.type==="tree"?"Odun topladın":"Taş topladın");if(near.hp<=0)this.game.world.resources.splice(this.game.world.resources.indexOf(near),1);return}
  if(this.game.world.inFarm(p.x,p.y)){const slot=this.farmSlots.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<30);
   if(!slot)return;
   if(slot.state==="ready"){p.addItem("wheat",2);p.gainXp(18);slot.state="empty";slot.growth=0;this.game.ui.toast("Buğday hasat edildi! +2")}
   else if(slot.state==="growing"&&!slot.watered){slot.watered=true;p.energy=Math.max(0,p.energy-2);this.game.ui.toast("Ekin sulandı")}
   else if(slot.state==="empty"&&p.removeItem("wheat_seed",1)){slot.state="growing";slot.growth=0;slot.watered=true;p.energy=Math.max(0,p.energy-2);p.gainXp(5);this.game.ui.toast("Buğday ekildi!")}
   else this.game.ui.toast("Burada ekin yetişiyor.")
  }
 }
 render(c){
  c.save();c.translate(this.game.world.screenOffsetX,this.game.world.screenOffsetY);
  for(const s of this.farmSlots){c.fillStyle="#765337";c.fillRect(s.x-18,s.y-18,36,36);if(s.state==="growing"){c.fillStyle="#5fae52";const h=8+Math.min(18,s.growth);c.fillRect(s.x-3,s.y+7-h,6,h)}if(s.state==="ready"){c.fillStyle="#e5c85d";c.fillRect(s.x-9,s.y-12,18,24);c.fillStyle="#7e5d2d";c.fillRect(s.x-13,s.y+8,26,4)}}
  for(const e of this.enemies){c.fillStyle="#4a8a52";c.fillRect(e.x-12,e.y-12,24,24);c.fillStyle="#111";c.fillRect(e.x-7,e.y-4,4,4);c.fillRect(e.x+3,e.y-4,4,4);c.fillStyle="#8b2d2d";c.fillRect(e.x-12,e.y-19,24,4)}
  for(const q of this.particles){c.fillStyle="#fff";c.font="bold 14px system-ui";c.fillText(q.text,q.x,q.y-(1-q.life)*35)}
  c.restore();
 }
}