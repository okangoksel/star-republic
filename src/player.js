import {Inventory} from "./inventory.js";
import {item} from "./items.js";
export class Player{
 constructor(game){
  this.game=game;this.x=390;this.y=360;this.r=14;this.speed=150;
  this.maxHp=100;this.hp=100;this.maxEnergy=100;this.energy=100;
  this.level=1;this.xp=0;this.gold=0;this.attack=3;this.defense=0;this.hotbar=0;
  this.attackCd=0;this.inventory={};this.equipment={weapon:null,tool:null,armor:null};
  this.discoveries={hands:true};
  this.inventoryApi=new Inventory(this);
 }
 update(dt){
  const k=this.game.keys;let dx=(k.has("d")?1:0)-(k.has("a")?1:0),dy=(k.has("s")?1:0)-(k.has("w")?1:0);
  if(dx||dy){const l=Math.hypot(dx,dy);dx/=l;dy/=l;this.x+=dx*this.speed*dt;this.y+=dy*this.speed*dt}
  this.x=Math.max(34,Math.min(this.game.world.width-34,this.x));this.y=Math.max(34,Math.min(this.game.world.height-34,this.y));
  this.attackCd=Math.max(0,this.attackCd-dt);if(this.game.mouse.down)this.attack();
 }
 attack(){
  if(this.attackCd>0)return;
  const weapon=this.equipment.weapon?item(this.equipment.weapon):null;
  if(!weapon){this.attackCd=.75;this.game.systems.handStrike();return}
  this.attackCd=.48;const m=this.game.mouse,wx=m.x-this.game.world.screenOffsetX,wy=m.y-this.game.world.screenOffsetY;
  this.game.systems.hit(wx,wy,weapon.damage??this.attack);
 }
 gainXp(n){this.xp+=n;while(this.xp>=this.level*100){this.xp-=this.level*100;this.level++;this.maxHp+=8;this.maxEnergy+=5;this.hp=this.maxHp;this.energy=this.maxEnergy;this.attack+=2;this.game.ui.toast("Yeni seviye! Lv."+this.level)}}
 addItem(id,n=1){this.inventoryApi.add(id,n)}
 removeItem(id,n=1){return this.inventoryApi.remove(id,n)}
 render(c){
  const sx=this.x+this.game.world.screenOffsetX,sy=this.y+this.game.world.screenOffsetY;
  c.fillStyle="#e8c08a";c.fillRect(sx-10,sy-14,20,20);c.fillStyle="#294c7a";c.fillRect(sx-11,sy+6,22,15);
  c.fillStyle="#202733";c.fillRect(sx-8,sy+20,6,8);c.fillRect(sx+2,sy+20,6,8);
  if(this.equipment.weapon){c.fillStyle="#d8d0bd";c.fillRect(sx+10,sy-3,15,4)}
 }
 serialize(){return {x:this.x,y:this.y,maxHp:this.maxHp,hp:this.hp,maxEnergy:this.maxEnergy,energy:this.energy,level:this.level,xp:this.xp,gold:this.gold,attack:this.attack,defense:this.defense,hotbar:this.hotbar,inventory:this.inventory,equipment:this.equipment,discoveries:this.discoveries}}
 restore(s){if(!s)return;Object.assign(this,s);this.inventory=s.inventory||{};this.equipment=s.equipment||{weapon:null,tool:null,armor:null};this.inventoryApi=new Inventory(this)}
}
