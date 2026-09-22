import {item} from "./items.js";
export class Inventory{
  constructor(player){this.player=player}
  count(id){return this.player.inventory[id]||0}
  has(id,n=1){return this.count(id)>=n}
  add(id,n=1){if(n<=0)return;this.player.inventory[id]=this.count(id)+n}
  remove(id,n=1){if(!this.has(id,n))return false;this.player.inventory[id]-=n;if(this.player.inventory[id]<=0)delete this.player.inventory[id];return true}
  entries(){return Object.entries(this.player.inventory).map(([id,qty])=>({id,qty,data:item(id)}))}
}
