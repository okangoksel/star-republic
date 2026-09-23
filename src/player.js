import {Inventory} from "./inventory.js";
import {item} from "./items.js";

export class Player{
 constructor(game){
  this.game=game;this.x=390;this.y=360;this.r=14;this.speed=150;
  this.maxHp=100;this.hp=100;this.maxEnergy=100;this.energy=100;
  this.level=1;this.xp=0;this.gold=0;this.attackPower=3;this.defense=0;
  this.hotbar=0;this.attackCd=0;this.attackAnim=0;this.attackAngle=0;
  this.inventory={field_book:1};this.inventoryOrder=["field_book"];this.equipment={weapon:null,tool:null,armor:null};
  this.discoveries={hands:true};this.resonance=0;this.tutorialStep=0;this.tutorialRewards={};this.walkTime=0;this.facing=1;this.inventoryApi=new Inventory(this);
 }
 update(dt){
  const k=this.game.keys,t=this.game.touchMove||{x:0,y:0};
  let dx=(k.has("d")?1:0)-(k.has("a")?1:0)+t.x;
  let dy=(k.has("s")?1:0)-(k.has("w")?1:0)+t.y;
  if(dx||dy){
   const l=Math.hypot(dx,dy);dx/=l;dy/=l;
   this.x+=dx*this.speed*dt;this.y+=dy*this.speed*dt;this.walkTime+=dt*9;
   if(Math.abs(dx)>.15)this.facing=dx>0?1:-1;
   else if(this.game.mouse){const worldMouseX=this.game.mouse.x-this.game.world.screenOffsetX;if(Math.abs(worldMouseX-this.x)>8)this.facing=worldMouseX>this.x?1:-1;}
  }else this.walkTime=0;
  // Region progression: complete the chain to permanently unlock each gate.
  const q=this.game.quests?.done||{};
  const gates=[
   {key:"echoWood",x1:1235,x2:1395,y1:325,y2:390,ok:!!q.echo_gate,msg:"Yankı Ormanı: Ormanın Yankısı görevini tamamla."},
   {key:"crystalCave",x1:1430,x2:1490,y1:370,y2:530,ok:!!q.crystal_gate,msg:"Kristal Mağara: Kristal Kapı görevini tamamla."},
   {key:"starMeadow",x1:1180,x2:1350,y1:690,y2:755,ok:!!q.star_gate,msg:"Yıldız Çayırı: Çayıra Açılan Yol görevini tamamla."}
  ];
  if(this.game.world){
   this.game.world.unlockedRegions=this.game.world.unlockedRegions||{};
   for(const g of gates)if(g.ok)this.game.world.unlockedRegions[g.key]=true;
  }
  for(const g of gates){
   if(!g.ok&&this.x>g.x1&&this.x<g.x2&&this.y>g.y1&&this.y<g.y2){
    this.x=Math.max(g.x1-8,Math.min(g.x2+8,this.x));this.y=g.y1<380?Math.min(g.y2+8,this.y):Math.max(g.y1-8,this.y);
    if(Math.random()<dt*2)this.game.ui.toast(g.msg);
   }
  }
  this.x=Math.max(34,Math.min(this.game.world.width-34,this.x));
  this.y=Math.max(34,Math.min(this.game.world.height-34,this.y));
  this.attackCd=Math.max(0,this.attackCd-dt);
  this.attackAnim=Math.max(0,this.attackAnim-dt);
  if(!this.game.world.isNight()&&this.hp>0)this.hp=Math.min(this.maxHp,this.hp+dt*.04);
 }
 attack(dirX=null,dirY=null){
  if(this.attackCd>0||!this.game.systems)return;
  this.attackAnim=.22;
  const m=this.game.mouse;
  const mobileDir=dirX!==null&&dirY!==null&&Math.hypot(dirX,dirY)>.01;
  const wx=mobileDir?this.x+dirX*70:m.x-this.game.world.screenOffsetX;
  const wy=mobileDir?this.y+dirY*70:m.y-this.game.world.screenOffsetY;
  this.attackAngle=Math.atan2(wy-this.y,wx-this.x);
  const weapon=this.equipment.weapon?item(this.equipment.weapon):null;
  if(!weapon){this.attackCd=.75;this.game.systems.handStrike(wx,wy);return}
  this.attackCd=.48;this.game.systems.hit(wx,wy,weapon.damage??this.attackPower);
 }
 gainXp(n){
  this.xp+=n;
  while(this.xp>=this.level*100){
   this.xp-=this.level*100;this.level++;this.maxHp+=8;this.maxEnergy+=5;
   this.hp=this.maxHp;this.energy=this.maxEnergy;this.attackPower+=2;
   this.game.ui.toast("Yeni seviye! Lv."+this.level);
  }
 }
 addItem(id,n=1){this.inventoryApi.add(id,n)}
 removeItem(id,n=1){return this.inventoryApi.remove(id,n)}
 render(c){
  const sx=this.x+this.game.world.screenOffsetX,sy=this.y+this.game.world.screenOffsetY;
  const step=this.walkTime?Math.sin(this.walkTime)*3:0;
  c.save();c.translate(sx,sy);c.scale(this.facing,1);
  c.fillStyle="rgba(0,0,0,.25)";c.fillRect(-10,26,20,5);
  c.fillStyle="#202733";c.fillRect(-8,18+step,6,10);c.fillRect(2,18-step,6,10);
  c.fillStyle="#294c7a";c.fillRect(-11,4,22,16);
  c.fillStyle="#e8c08a";c.fillRect(-10,-15,20,20);
  c.fillStyle="#6b3e2e";c.fillRect(-12,-17,24,6);c.fillRect(-8,-22,16,6);
  c.fillStyle="#1d2634";c.fillRect(-6,-7,3,3);c.fillRect(3,-7,3,3);
  if(this.attackAnim>0){
   c.save();c.rotate(this.attackAngle*this.facing);
   c.globalAlpha=Math.min(1,this.attackAnim/.22);
   c.fillStyle="#d95a5a";c.fillRect(13,-2,22,4);
   c.restore();
  }
  c.restore();
 }
 serialize(){
  return {x:this.x,y:this.y,maxHp:this.maxHp,hp:this.hp,maxEnergy:this.maxEnergy,energy:this.energy,level:this.level,xp:this.xp,gold:this.gold,attackPower:this.attackPower,defense:this.defense,hotbar:this.hotbar,inventory:this.inventory,inventoryOrder:this.inventoryOrder,equipment:this.equipment,discoveries:this.discoveries,resonance:this.resonance,tutorialStep:this.tutorialStep,tutorialRewards:this.tutorialRewards};
 }
 restore(s){
  if(!s)return;
  this.x=s.x??this.x;this.y=s.y??this.y;this.maxHp=s.maxHp??this.maxHp;this.hp=s.hp??this.hp;
  this.maxEnergy=s.maxEnergy??this.maxEnergy;this.energy=s.energy??this.energy;
  this.level=s.level??this.level;this.xp=s.xp??this.xp;this.gold=s.gold??this.gold;
  this.attackPower=s.attackPower??s.attack??this.attackPower;this.defense=s.defense??this.defense;
  this.hotbar=s.hotbar??this.hotbar;this.inventory=s.inventory||{};
  this.inventoryOrder=Array.isArray(s.inventoryOrder)?s.inventoryOrder.filter(id=>this.inventory[id]>0):[];
  Object.keys(this.inventory).forEach(id=>{if(!this.inventoryOrder.includes(id))this.inventoryOrder.push(id)});
  if(!this.inventory.field_book){this.inventory.field_book=1;this.inventoryOrder.push("field_book");}
  this.equipment=s.equipment||{weapon:null,tool:null,armor:null};
  this.discoveries=s.discoveries||{hands:true};this.resonance=s.resonance??0;this.tutorialStep=s.tutorialStep??0;this.tutorialRewards=s.tutorialRewards||{};
  this.inventoryApi=new Inventory(this);
 }
}