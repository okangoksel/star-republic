import {item} from "./items.js";
export class Inventory{
  constructor(player){this.player=player}
  count(id){return this.player.inventory[id]||0}
  has(id,n=1){return this.count(id)>=n}
  add(id,n=1){if(n<=0)return;this.player.inventory[id]=this.count(id)+n}
  remove(id,n=1){if(!this.has(id,n))return false;this.player.inventory[id]-=n;if(this.player.inventory[id]<=0)delete this.player.inventory[id];return true}
  entries(){return Object.entries(this.player.inventory).map(([id,qty])=>({id,qty,data:item(id)}))}
  move(fromId,toId){if(fromId===toId)return;const a=this.count(fromId),b=this.count(toId);if(!a)return false;this.player.inventory[toId]=a; if(b)this.player.inventory[fromId]=b;else delete this.player.inventory[fromId];return true}
  split(id,n){n=Math.max(1,Math.min(this.count(id),Math.floor(n)));if(!this.has(id,n)||n>=this.count(id))return false;this.remove(id,n);return n}
}
