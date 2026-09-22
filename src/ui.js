import {item} from "./items.js";
import {RECIPES,canCraft,craft} from "./crafting.js";
export class UI{
 constructor(game){this.game=game;this.$=id=>document.getElementById(id);this.bind()}
 bind(){
  this.$("resume").onclick=()=>{this.game.paused=false;this.setMenu(false)};
  this.$("save").onclick=()=>this.game.save();this.$("reset").onclick=()=>this.game.reset();
 }
 toast(t){const el=this.$("toast");el.textContent=t;el.style.opacity=1;clearTimeout(this.tt);this.tt=setTimeout(()=>el.style.opacity=0,1500)}
 update(){
  const p=this.game.player,w=this.game.world;
  this.$("hp").textContent=Math.ceil(p.hp)+"/"+p.maxHp;this.$("energy").textContent=Math.ceil(p.energy)+"/"+p.maxEnergy;
  this.$("level").textContent=p.level;this.$("xp").textContent=Math.floor(p.xp)+"/"+p.level*100;
  this.$("day").textContent=w.day;this.$("time").textContent=this.clock(w.time);this.$("gold").textContent=p.gold;
  this.renderHotbar();if(this.game.debug)this.updateDebug();
 }
 clock(m){const h=Math.floor(m/60)%24,mm=Math.floor(m%60);return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")}
 renderHotbar(){
  const el=this.$("hotbar");el.innerHTML="";
  const entries=this.game.player.inventoryApi.entries();
  const ids=entries.map(x=>x.id).slice(0,9);
  for(let i=0;i<9;i++){const id=ids[i]||"",q=id?this.game.player.inventory[id]:0,s=document.createElement("div");
   s.className="slot"+(i===this.game.player.hotbar?" selected":"");s.innerHTML='<span class="num">'+(i+1)+'</span><span>'+this.icon(id)+'</span><span class="qty">'+(q||"")+'</span>';
   if(id)s.title=item(id).name;s.onclick=()=>{this.game.player.hotbar=i};el.appendChild(s)}
 }
 icon(id){return item(id).icon||""}
 toggleInventory(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderInventory()}
 renderInventory(){
  const el=this.$("inventory"),p=this.game.player,entries=p.inventoryApi.entries();
  el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Çanta</h2><span class="close">I / Kapat</span></div><p class="muted">Ellerin boş başladı. Buradaki her şey senin keşfin.</p><div class="inventory-grid">'+Array.from({length:24},(_,i)=>{const e=entries[i];return '<div class="inv-slot">'+(e?'<b>'+e.data.icon+' '+e.data.name+'</b><span class="qty">x'+e.qty+'</span>':'')+'</div>'}).join("")+'</div><p>💰 '+p.gold+' · Elindeki alet: '+(p.equipment.tool?item(p.equipment.tool).name:"Yok")+' · Silah: '+(p.equipment.weapon?item(p.equipment.weapon).name:"Yok")+'</p></div>';
  el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}
 }
 toggleCrafting(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderCrafting()}
 renderCrafting(){
  const el=this.$("inventory"),inv=this.game.player.inventoryApi;
  el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Üretim & Keşif</h2><span class="close">C / Kapat</span></div><p class="muted">Tarifler hazır verilmez. İlk tarifler, malzemeleri elinde tutunca görünür.</p><div class="recipe-list">'+RECIPES.map(r=>'<button class="recipe" data-recipe="'+r.id+'" '+(canCraft(inv,r)?"":"disabled")+'><b>'+r.name+'</b><span>'+Object.entries(r.ingredients).map(([id,n])=>item(id).name+' ×'+n).join(" · ")+'</span><small>'+r.description+'</small></button>').join("")+'</div></div>';
  el.querySelectorAll(".recipe").forEach(b=>b.onclick=()=>{const r=RECIPES.find(x=>x.id===b.dataset.recipe);craft(this.game,r);this.renderCrafting()});
  el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}
 }
 setMenu(show){this.$("menu").classList.toggle("hidden",!show)}
 updateDebug(){this.$("debug").classList.toggle("hidden",!this.game.debug)}
 renderDebug(){this.$("debug").innerHTML="FPS: "+Math.round(this.game.fps)+"<br>POS: "+Math.round(this.game.player.x)+", "+Math.round(this.game.player.y)+"<br>TIME: "+this.clock(this.game.world.time)+"<br>DAY: "+this.game.world.day+"<br>ENEMIES: "+this.game.systems.enemies.length+"<br>HP: "+Math.ceil(this.game.player.hp)+"<br>ENERGY: "+Math.ceil(this.game.player.energy)+"<br>GOLD: "+this.game.player.gold}
}
