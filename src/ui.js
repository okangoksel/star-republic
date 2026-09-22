import {item} from "./items.js";
import {RECIPES,canCraft,craft} from "./crafting.js";import {QUESTS} from "./quests.js";
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
  this.$("day").textContent=w.day;this.$("time").textContent=this.clock(w.time);this.$("gold").textContent=p.gold;this.$("weather").textContent=this.weatherName(w.weather);this.$("resonance").textContent=Math.floor(p.resonance);
  this.renderHotbar();if(this.game.debug)this.updateDebug();
 }
 clock(m){const h=Math.floor(m/60)%24,mm=Math.floor(m%60);return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")} weatherName(w){return ({clear:"Açık",rain:"Yağmur",wind:"Rüzgâr",veil:"Yankı Sisi"}[w]||"Açık")}
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
 toggleQuests(){const el=this.$("inventory");el.classList.remove("hidden");const qs=this.game.quests;el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Görevler</h2><span class="close">J / Kapat</span></div>${QUESTS.map(q=>{const done=!!qs.done[q.id],ready=qs.progress(q);return `<button class="recipe" data-quest="${q.id}" ${done||!ready?"disabled":""}><b>${done?"✓ ":""}${q.name}</b><span>${q.text}</span><small>${done?"Tamamlandı":"Ödül: "+q.reward+" altın · "+(ready?"Hazır":"Henüz hazır değil")}</small></button>`}).join("")}</div>`;el.querySelectorAll("[data-quest]").forEach(b=>b.onclick=()=>{const q=QUESTS.find(x=>x.id===b.dataset.quest);qs.claim(q);this.toggleQuests()});el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleMap(){const el=this.$("inventory");el.classList.remove("hidden");el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Dünya Haritası</h2><span class="close">M / Kapat</span></div><div class="map-card"><div>🏡 <b>Ev / Tarla</b> · başlangıç bölgesi</div><div>🏘️ <b>Köy</b> · NPC ve pazar</div><div>🌲 <b>Woodland</b> · lif ve yabani kaynaklar</div><div>⛏️ <b>Deep Mine</b> · ileride derinleşecek keşif alanı</div><div>✦ <b>Astral Bloom</b> · ilk büyük gizem</div></div></div>`;el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleMarketplace(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderMarketplace()}
 npc(n){const el=this.$("inventory");el.classList.remove("hidden");el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>${n.name}</h2><span class="close">Kapat</span></div><p class="muted">${n.role}</p><p>${n.text}</p><p>Yakınındaki kaynakları ve Astral Bloom keşfini ilerletirsen yeni konuşmalar açılacak.</p></div>`;el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 renderMarketplace(){const el=this.$("inventory"),m=this.game.systems.market;m.refresh();const offers=m.offers;el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Köy Pazarı</h2><span class="close">M / Kapat</span></div><p class="muted">Günlük teklifler değişir. Satın almak için altın gerekir.</p><div class="recipe-list">${offers.map((o,i)=>`<button class="recipe" data-buy="${i}" ${o.qty<=0?"disabled":""}><b>${item(o.id).icon} ${item(o.id).name}</b><span>${o.seller} · ${o.rarity} · ${o.price} altın · stok ${o.qty}</span></button>`).join("")}</div><h3>Çantadan Sat</h3><div class="recipe-list">${this.game.player.inventoryApi.entries().filter(e=>item(e.id).sellPrice).map(e=>`<button class="recipe" data-sell="${e.id}"><b>${e.data.icon} ${e.data.name} ×${e.qty}</b><span>+${e.data.sellPrice} altın</span></button>`).join("")||"<p>Satılabilir eşyan yok.</p>"}</div></div>`;el.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{m.buy(Number(b.dataset.buy));this.renderMarketplace()});el.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>{m.sell(b.dataset.sell);this.renderMarketplace()});el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleDiscoveries(){const el=this.$("inventory");el.classList.remove("hidden");const p=this.game.player,w=this.game.world;const d=[["Boş Eller","Oyuna hiçbir ekipman olmadan başlamak",true],["İlk Hasat","Yabani sapları ekilebilir ürüne dönüştürmek",!!p.inventory.reed_seed],["Astral Bloom","İlk Bloom'u bulmak",!!p.discoveries.bloom],["Yankı Duyusu","25 Yankı biriktirmek",!!p.discoveries.resonanceSense],["Yankı Haritası","60 Yankı biriktirmek",!!p.discoveries.echoMap],["Yağmur Döngüsü","Yağmurda tarlanın kendi kendine sulandığını görmek",w.weather==="rain"]];el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Keşif Günlüğü</h2><span class="close">K / Kapat</span></div><p class="muted">Star Republic sana her şeyi anlatmaz. Bazı sistemler gözlemle ortaya çıkar.</p><div class="recipe-list">'+d.map(x=>'<div class="recipe"><b>'+(x[2]?"✓ ":"○ ")+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div></div>';el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}toggleCrafting(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderCrafting()}
 renderCrafting(){
  const el=this.$("inventory"),inv=this.game.player.inventoryApi;
  el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Üretim & Keşif</h2><span class="close">C / Kapat</span></div><p class="muted">Tarifler hazır verilmez. İlk tarifler, malzemeleri elinde tutunca görünür.</p><div class="recipe-list">'+RECIPES.filter(r=>r.id!=="astral_compass"||this.game.player.discoveries.bloom).map(r=>'<button class="recipe" data-recipe="'+r.id+'" '+(canCraft(inv,r)?"":"disabled")+'><b>'+r.name+'</b><span>'+Object.entries(r.ingredients).map(([id,n])=>item(id).name+' ×'+n).join(" · ")+'</span><small>'+r.description+'</small></button>').join("")+'</div></div>';
  el.querySelectorAll(".recipe").forEach(b=>b.onclick=()=>{const r=RECIPES.find(x=>x.id===b.dataset.recipe);craft(this.game,r);this.renderCrafting()});
  el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}
 }
 setMenu(show){this.$("menu").classList.toggle("hidden",!show)}
 updateDebug(){this.$("debug").classList.toggle("hidden",!this.game.debug)}
 renderDebug(){this.$("debug").innerHTML="FPS: "+Math.round(this.game.fps)+"<br>POS: "+Math.round(this.game.player.x)+", "+Math.round(this.game.player.y)+"<br>TIME: "+this.clock(this.game.world.time)+"<br>DAY: "+this.game.world.day+"<br>ENEMIES: "+this.game.systems.enemies.length+"<br>HP: "+Math.ceil(this.game.player.hp)+"<br>ENERGY: "+Math.ceil(this.game.player.energy)+"<br>GOLD: "+this.game.player.gold}
}
