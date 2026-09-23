import {item} from "./items.js";
export class Inventory{
  constructor(player){this.player=player}
  normalizeOrder(){
    if(!Array.isArray(this.player.inventoryOrder))this.player.inventoryOrder=[];
    this.player.inventoryOrder=this.player.inventoryOrder.filter(id=>this.count(id)>0);
    Object.keys(this.player.inventory).forEach(id=>{if(!this.player.inventoryOrder.includes(id))this.player.inventoryOrder.push(id)});
    return this.player.inventoryOrder;
  }
  count(id){return this.player.inventory[id]||0}
  has(id,n=1){return this.count(id)>=n}
  add(id,n=1){if(n<=0)return;this.player.inventory[id]=this.count(id)+n;this.normalizeOrder()}
  remove(id,n=1){
    if(!this.has(id,n))return false;
    this.player.inventory[id]-=n;
    if(this.player.inventory[id]<=0){
      delete this.player.inventory[id];
      this.player.inventoryOrder=(this.player.inventoryOrder||[]).filter(x=>x!==id);
    }
    return true;
  }
  entries(){
    return this.normalizeOrder().map(id=>({id,qty:this.count(id),data:item(id)})).filter(x=>x.qty>0);
  }
  slotEntries(size=24){
    const entries=this.entries(),slots=Array(size).fill(null);
    entries.forEach((e,i)=>{if(i<size)slots[i]=e});
    return slots;
  }
  move(fromId,toId){
    if(fromId===toId)return;
    const a=this.count(fromId),b=this.count(toId);
    if(!a)return false;
    this.player.inventory[toId]=a;
    if(b)this.player.inventory[fromId]=b;else delete this.player.inventory[fromId];
    const order=this.normalizeOrder(),aIndex=order.indexOf(fromId),bIndex=order.indexOf(toId);
    if(aIndex>=0){
      if(bIndex>=0){order[aIndex]=toId;order[bIndex]=fromId}
      else order[aIndex]=toId;
    }
    this.normalizeOrder();
    return true;
  }
  moveSlots(fromSlot,toSlot,size=24){
    if(fromSlot===toSlot)return false;
    const slots=this.slotEntries(size),from=slots[fromSlot],to=slots[toSlot];
    if(!from)return false;
    const order=this.normalizeOrder(),fromId=from.id;
    if(to){
      const a=order.indexOf(fromId),b=order.indexOf(to.id);
      if(a<0||b<0)return false;
      [order[a],order[b]]=[order[b],order[a]];
    }else{
      const a=order.indexOf(fromId);
      if(a<0)return false;
      order.splice(a,1);
      const next=this.normalizeOrder();
      const target=Math.min(toSlot,next.length);
      next.splice(target,0,fromId);
      this.player.inventoryOrder=next;
    }
    return true;
  }
  split(id,n){
    n=Math.max(1,Math.min(this.count(id),Math.floor(n)));
    if(!this.has(id,n)||n>=this.count(id))return false;
    this.remove(id,n);return n
  }
}
