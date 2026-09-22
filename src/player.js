import {Inventory} from "./inventory.js";
import {item} from "./items.js";
export class Player{
 constructor(game){this.game=game;this.x=390;this.y=360;this.r=14;this.speed=150;this.maxHp=100;this.hp=100;this.maxEnergy=100;this.energy=100;this.level=1;this.xp=0;this.gold=0;this.attack=3;this.defense=0;this.hotbar=0;this.attackCd=0;this.attackAnim=0;this.attackAngle=0;this.inventory={field_book:1};this.equipment={weapon:null,tool:null,armor:null};this.discoveries={hands:true};this.resonance=0;this.walkTime=0;this.facing=1;this.inventoryApi=new Inventory(this)}
 update(dt){const k=this.game.keys;let dx=(k.has("d")?1:0)-(k.has("a")?1:0),dy=(k.has("s")?1:0)-(k.has("w")?1:0);if(dx||dy){const l=Math.hypot(dx,dy);dx/=l;dy/=l;this.x+=dx*this.speed*dt;this.y+=dy*this.speed*dt;this.walkTime+=dt*9;if(dx)this.facing=dx>0?1:-1}else this.walkTime=0;this.x=Math.max(34,Math.min(this.game.world.width-34,this.x));this.y=Math.max(34,Math.min(this.game.world.height-34,this.y));this.attackCd=Math.max(0,this.attackCd-dt);this.attackAnim=Math.max(0,this.attackAnim-dt);}
 attack(){if(this.attackCd>0)return;this.attackAnim=.22;const m=this.game.mouse;const wx=m.x-this.game.world.screenOffsetX,wy=m.y-this.game.world.screenOffsetY;this.attackAngle=Math.atan2(wy-this.y,wx-this.x);const weapon=this.equipment.weapon?item(this.equipment.weapon):null;if(!weapon){this.attackCd=.75;this.game.systems.handStrike();return}this.attackCd=.48;this.game.systems.hit(wx,wy,weapon.damage??this.attack)}
 gainXp(n){this.xp+=n;while(this.xp>=this.level*100){this.xp-=this.level*100;this.level++;this.maxHp+=8;this.maxEnergy+=5;this.hp=this.maxHp;this.energy=this.maxEnergy;this.attack+=2;this.game.ui.toast("Yeni seviye! Lv."+this.level)}}
 addItem(id,n=1){this.inventoryApi.add(id,n)}
 removeItem(id,n=1){return this.inventoryApi.remove(id,n)}
 render(c){const sx=this.x+this.game.world.screenOffsetX,sy=this.y+this.game.world.screenOffsetY,step=this.walkTime?Math.sin(this.walkTime)*3:0; c.save();c.translate(sx,sy);c.scale(this.facing,1);
  c.fillStyle="rgba(0,0,0,.25)";c.fillRect(-10,26,20,5);
  c.fillStyle="#202733";c.fillRect(-8,18+step,6,10);c.fillRect(2,18-step,6,10);
  c.fillStyle="#294c7a";c.fillRect(-11,4,22,16);
  c.fillStyle="#e8c08a";c.fillRect(-10,-15,20,20);
  c.fillStyle="#6b3e2e";c.fillRect(-12,-17,24,6);c.fillRect(-8,-22,16,6);
  c.fillStyle="#1d2634";c.fillRect(-6,-7,3,3);c.fillRect(3,-7,3,3);
  c.restore()}
 serialize(){return {x:this.x,y:this.y,maxHp:this.maxHp,hp:this.hp,maxEnergy:this.maxEnergy,energy:this.energy,level:this.level,xp:this.xp,gold:this.gold,attack:this.attack,defense:this.defense,hotbar:this.hotbar,inventory:this.inventory,equipment:this.equipment,discoveries:this.discoveries,resonance:this.resonance}}
 restore(s){if(!s)return;Object.assign(this,s);this.inventory=s.inventory||{};if(!this.inventory.field_book)this.inventory.field_book=1;this.equipment=s.equipment||{weapon:null,tool:null,armor:null};this.discoveries=s.discoveries||{hands:true};this.resonance=s.resonance??0;this.inventoryApi=new Inventory(this)}
}