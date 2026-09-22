export class UI{
 constructor(game){this.game=game;this.$=id=>document.getElementById(id);this.hotbarItems=["wheat_seed","wood","stone","wheat","iron","sword","potion","",""];this.bind()}
 bind(){this.$("resume").onclick=()=>{this.game.paused=false;this.setMenu(false)};this.$("save").onclick=()=>this.game.save();this.$("reset").onclick=()=>this.game.reset()}
 toast(t){const el=this.$("toast");el.textContent=t;el.style.opacity=1;clearTimeout(this.tt);this.tt=setTimeout(()=>el.style.opacity=0,1300)}
 update(){
  const p=this.game.player,w=this.game.world;
  this.$("hp").textContent=Math.ceil(p.hp)+"/"+p.maxHp;this.$("energy").textContent=Math.ceil(p.energy)+"/"+p.maxEnergy;this.$("level").textContent=p.level;this.$("xp").textContent=Math.floor(p.xp)+"/"+p.level*100;this.$("day").textContent=w.day;this.$("time").textContent=this.clock(w.time);this.$("gold").textContent=p.gold;this.renderHotbar();
  if(this.game.debug)this.updateDebug();
 }
 clock(m){const h=Math.floor(m/60)%24,mm=Math.floor(m%60);return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")}
 renderHotbar(){const el=this.$("hotbar");el.innerHTML="";for(let i=0;i<9;i++){const id=this.hotbarItems[i],q=id?(this.game.player.inventory[id]||0):0;const s=document.createElement("div");s.className="slot"+(i===this.game.player.hotbar?" selected":"");s.innerHTML='<span class="num">'+(i+1)+'</span><span>'+this.icon(id)+'</span><span class="qty">'+(q||"")+'</span>';el.appendChild(s)}}
 icon(id){return {wheat_seed:"🌱",wood:"🪵",stone:"🪨",wheat:"🌾",iron:"⬜",sword:"⚔️",potion:"🧪"}[id]||""}
 toggleInventory(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");el.innerHTML='<div class="modal-card"><div class="inv-title"><h2>Envanter</h2><span class="close">I / Kapat</span></div><div class="inventory-grid">'+Object.entries(this.game.player.inventory).map(([id,q])=>'<div class="inv-slot"><b>'+this.icon(id)+' '+id+'</b><span class="qty">x'+q+'</span></div>').join("")+'</div><p>Gold: '+this.game.player.gold+'</p></div>';el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 setMenu(show){this.$("menu").classList.toggle("hidden",!show)}
 updateDebug(){this.$("debug").classList.toggle("hidden",!this.game.debug)}
 renderDebug(){this.$("debug").innerHTML="FPS: "+Math.round(this.game.fps)+"<br>POS: "+Math.round(this.game.player.x)+", "+Math.round(this.game.player.y)+"<br>TIME: "+this.clock(this.game.world.time)+"<br>DAY: "+this.game.world.day+"<br>ENEMIES: "+this.game.systems.enemies.length+"<br>HP: "+Math.ceil(this.game.player.hp)+"<br>ENERGY: "+Math.ceil(this.game.player.energy)+"<br>GOLD: "+this.game.player.gold}
}