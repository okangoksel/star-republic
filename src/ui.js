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
  this.$("hp").textContent=Math.ceil(p.hp)+"/"+p.maxHp;this.$("energy").textContent=Math.ceil(p.energy)+"/"+p.maxEnergy;const hpFill=this.$("hp-fill");if(hpFill)hpFill.style.width=Math.max(0,Math.min(100,p.hp/p.maxHp*100))
  this.$("level").textContent=p.level;this.$("xp").textContent=Math.floor(p.xp)+"/"+p.level*100;
  this.$("day").textContent=w.day;this.$("time").textContent=this.clock(w.time);this.$("gold").textContent=p.gold;this.$("weather").textContent=this.weatherName(w.weather);this.$("resonance").textContent=Math.floor(p.resonance);
  this.renderHotbar();this.renderMinimap();if(this.game.debug)this.updateDebug();
 }
 clock(m){const h=Math.floor(m/60)%24,mm=Math.floor(m%60);return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")} weatherName(w){return ({clear:"Açık",rain:"Yağmur",wind:"Rüzgâr",veil:"Yankı Sisi"}[w]||"Açık")}
 renderMinimap(){
  const m=this.$("minimap");if(!m)return;
  const c=m.getContext("2d");if(!c)return;
  const w=this.game.world,p=this.game.player,sx=m.width/w.width,sy=m.height/w.height;
  c.clearRect(0,0,m.width,m.height);
  c.fillStyle="#263d2b";c.fillRect(0,0,m.width,m.height);
  c.fillStyle="#5d8b5b";c.fillRect(70*sx,120*sy,700*sx,560*sy);
  c.fillStyle="#4d7d8e";c.fillRect(690*sx,110*sy,380*sx,150*sy);
  c.fillStyle="#b59a62";c.fillRect(760*sx,420*sy,430*sx,90*sy);
  c.fillStyle="#45484a";c.fillRect(1500*sx,420*sy,220*sx,500*sy);
  c.fillStyle="#8b6547";c.fillRect(120*sx,170*sy,520*sx,390*sy);
  c.fillStyle="#d7b7ff";c.fillRect(610*sx-2,410*sy-2,4,4);
  c.fillStyle="#f6d36b";c.fillRect(p.x*sx-2,p.y*sy-2,5,5);
  c.strokeStyle="rgba(255,255,255,.2)";c.strokeRect(1,1,m.width-2,m.height-2);
}
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
  const el=this.$("inventory"),p=this.game.player,inv=p.inventoryApi,slots=inv.slotEntries(24);
  el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Çanta</h2><span class="close">I / Kapat</span></div><p class="muted">Eşyayı basılı tutup sürükleyerek başka bir slota bırakabilirsin. Mobilde uzun basma veya bir slota dokunup başka slota dokunma da çalışır.</p><div class="inventory-tools"><button id="sort-inventory">↕ Düzeni Yenile</button></div><div class="inventory-grid">'+slots.map((e,i)=>'<button class="inv-slot" data-slot="'+i+'" data-item="'+(e?e.id:"")+'" '+(e?'draggable="true"':'disabled')+'>'+(e?'<b>'+e.data.icon+' '+e.data.name+'</b><span class="qty">x'+e.qty+'</span>':'')+'</button>').join("")+'</div><p>💰 '+p.gold+' · Alet: '+(p.equipment.tool?item(p.equipment.tool).name:"Yok")+' · Seçili yuva: '+(p.hotbar+1)+'</p></div>';
  const sortBtn=el.querySelector("#sort-inventory");
  if(sortBtn)sortBtn.onclick=()=>{p.inventoryOrder=Object.keys(p.inventory);this.renderInventory()};
  let dragSlot=null,longPressTimer=null,longPressSlot=null,moved=false;
  const clearLong=()=>{if(longPressTimer){clearTimeout(longPressTimer);longPressTimer=null}longPressSlot=null};
  el.querySelectorAll(".inv-slot").forEach(b=>{
    const slot=Number(b.dataset.slot);
    b.addEventListener("dragstart",e=>{dragSlot=slot;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(slot))});
    b.addEventListener("dragover",e=>{if(b.dataset.item){e.preventDefault();b.classList.add("drag-over")}});
    b.addEventListener("dragleave",()=>b.classList.remove("drag-over"));
    b.addEventListener("drop",e=>{
      e.preventDefault();b.classList.remove("drag-over");
      const from=dragSlot??Number(e.dataTransfer.getData("text/plain"));
      if(Number.isInteger(from)&&inv.moveSlots(from,slot)){this.toast("Eşyanın yeri değiştirildi.");this.renderInventory()}
      dragSlot=null;
    });
    b.addEventListener("dragend",()=>{dragSlot=null;b.classList.remove("drag-over")});
    b.addEventListener("pointerdown",e=>{
      if(!b.dataset.item)return;
      moved=false;
      const sx=e.clientX,sy=e.clientY;
      longPressSlot=slot;
      longPressTimer=setTimeout(()=>{dragSlot=slot;this.toast("Taşıma modu: hedef slota dokun.");longPressTimer=null},450);
      const move=ev=>{if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>10){moved=true;clearLong();b.removeEventListener("pointermove",move)}};
      b.addEventListener("pointermove",move);
    });
    b.addEventListener("pointerup",e=>{
      clearLong();
      if(dragSlot!==null&&dragSlot!==slot){
        if(inv.moveSlots(dragSlot,slot)){this.toast("Eşyanın yeri değiştirildi.");this.renderInventory()}
        dragSlot=null;return;
      }
      if(dragSlot===slot){dragSlot=null;return}
      if(moved)return;
      this.useInventoryItem(b.dataset.item);
    });
    b.addEventListener("pointercancel",clearLong);
    b.addEventListener("click",e=>{
      if(e.detail>1)return;
      if(dragSlot!==null&&dragSlot!==slot){
        if(inv.moveSlots(dragSlot,slot)){this.toast("Eşyanın yeri değiştirildi.");this.renderInventory()}
        dragSlot=null;
      }
    });
  });
  el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}
}
 useInventoryItem(id){
  if(!id)return;
  const p=this.game.player,info=item(id);
  if(info.type==="tool"){p.equipment.tool=id;this.toast(info.name+" kuşanıldı.");this.renderInventory();return}
  if(info.type==="food"){
   const before=p.energy;
   p.energy=Math.min(p.maxEnergy,p.energy+25);
   if(p.energy>before){p.removeItem(id,1);this.toast(info.name+" kullandın. +"+Math.round(p.energy-before)+" enerji.");this.renderInventory()}
   return;
  }
  p.addItem(id,0);this.toast(info.name+" seçildi.");
 }
 toggleQuests(){const el=this.$("inventory");el.classList.remove("hidden");const qs=this.game.quests;el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Görevler</h2><span class="close">J / Kapat</span></div>${QUESTS.map(q=>{const done=!!qs.done[q.id],ready=qs.progress(q);return `<button class="recipe" data-quest="${q.id}" ${done||!ready?"disabled":""}><b>${done?"✓ ":""}${q.name}</b><span>${q.text}</span><small>${done?"Tamamlandı":"Ödül: "+q.reward+" altın · "+(ready?"Hazır":"Henüz hazır değil")}</small></button>`}).join("")}</div>`;el.querySelectorAll("[data-quest]").forEach(b=>b.onclick=()=>{const q=QUESTS.find(x=>x.id===b.dataset.quest);qs.claim(q);this.toggleQuests()});el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleMap(){const el=this.$("inventory");el.classList.remove("hidden");el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Dünya Haritası</h2><span class="close">M / Kapat</span></div><div class="map-card"><div>🏡 <b>Ev / Tarla</b> · başlangıç bölgesi</div><div>🏘️ <b>Köy</b> · NPC ve pazar</div><div>🌲 <b>Woodland</b> · lif ve yabani kaynaklar</div><div>⛏️ <b>Deep Mine</b> · ileride derinleşecek keşif alanı</div><div>✦ <b>Astral Bloom</b> · ilk büyük gizem</div></div></div>`;el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleMarketplace(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderMarketplace()}
 npc(n){const el=this.$("inventory");el.classList.remove("hidden");el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>${n.name}</h2><span class="close">Kapat</span></div><p class="muted">${n.role}</p><p>${n.text}</p><p>Yakınındaki kaynakları ve Astral Bloom keşfini ilerletirsen yeni konuşmalar açılacak.</p></div>`;el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 renderMarketplace(){const el=this.$("inventory"),m=this.game.systems.market;m.refresh();const offers=m.offers;el.innerHTML=`<div class="modal-card inventory-card"><div class="inv-title"><h2>Köy Pazarı</h2><span class="close">M / Kapat</span></div><p class="muted">Günlük teklifler değişir. Satın almak için altın gerekir.</p><div class="recipe-list">${offers.map((o,i)=>`<button class="recipe" data-buy="${i}" ${o.qty<=0?"disabled":""}><b>${item(o.id).icon} ${item(o.id).name}</b><span>${o.seller} · ${o.rarity} · ${o.price} altın · stok ${o.qty}</span></button>`).join("")}</div><h3>Çantadan Sat</h3><div class="recipe-list">${this.game.player.inventoryApi.entries().filter(e=>item(e.id).sellPrice).map(e=>`<button class="recipe" data-sell="${e.id}"><b>${e.data.icon} ${e.data.name} ×${e.qty}</b><span>+${e.data.sellPrice} altın</span></button>`).join("")||"<p>Satılabilir eşyan yok.</p>"}</div></div>`;el.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{m.buy(Number(b.dataset.buy));this.renderMarketplace()});el.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>{m.sell(b.dataset.sell);this.renderMarketplace()});el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}
 toggleGuide(){const el=this.$("inventory");el.classList.remove("hidden");el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>📘 Gezginin Başlangıç Kitapçığı</h2><span class="close">L / Kapat</span></div><p><b>Hoş geldin.</b> Star Republic sana hazır ekipman vermiyor. İlk ilerlemen dünyayı gözlemlemekten geliyor.</p><div class="map-card"><div>🌿 <b>Yabani Sap → Buğday</b><br>Yabani sapları ve lifi topla. C ile üretim ekranından <b>Buğday Tohumu Ayırma</b> tarifini yap.</div><div>🌱 <b>Tohum ekme</b><br>Buğday Tohumunu çantanda tut. Tarladaki boş kareye yaklaş ve <b>E</b> bas. İlk tohum otomatik seçilir.</div><div>💧 <b>Sulama</b><br>Büyüyen ürüne yaklaşınca <b>E</b> bas. Yağmur yağarsa tarla kendiliğinden sulanır.</div><div>🌾 <b>Hasat</b><br>Ürün büyüyüp hazır olduğunda aynı kareye tekrar <b>E</b> bas.</div><div>🛠️ <b>Üretim</b><br>C ile tarifleri gör. İlk Yontu kaynak toplamayı kolaylaştırır; Lif İpi, Sandık ve Sulama Kabı gibi araçlar ileride yeni sistemlere temel olur.</div><div>✦ <b>Astral Bloom</b><br>Parlayan gizemli çiçeği keşfet. Astral Tozu ve Yankı sistemi yeni keşifler açar. Madenin derin kısmındaki kristaller daha nadir malzemeler verebilir.</div><div>📖 <b>Kontroller</b><br>WASD hareket · E etkileşim · I çanta · C üretim · M harita · J görev · K keşif · L kitapçık · P pazar</div></div></div>';el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}toggleDiscoveries(){const el=this.$("inventory");el.classList.remove("hidden");const p=this.game.player,w=this.game.world;const d=[["Boş Eller","Oyuna hiçbir ekipman olmadan başlamak",true],["İlk Hasat","Yabani sapları ekilebilir ürüne dönüştürmek",!!p.inventory.reed_seed],["Astral Bloom","İlk Bloom'u bulmak",!!p.discoveries.bloom],["Yankı Duyusu","25 Yankı biriktirmek",!!p.discoveries.resonanceSense],["Yankı Haritası","60 Yankı biriktirmek",!!p.discoveries.echoMap],["Eski Korunun İzleri","Old Grove'u keşfetmek",!!p.discoveries.grove],["Maden Yankısı","Madenin üçüncü derinliğine ulaşmak",!!p.discoveries.deepMine],["Yağmur Döngüsü","Yağmurda tarlanın kendi kendine sulandığını görmek",w.weather==="rain"],["Kristal Yankısı","Kristalden Yankı Parçası elde etmek",!!p.inventory.echo_shard],["Yıldız Bahçesi","Yıldız Meyvesi yetiştirmek",!!p.inventory.starfruit],["Yankı Merceği","Yankı Merceğini üretmek",!!p.discoveries.resonanceLens]];el.innerHTML='<div class="modal-card inventory-card"><div class="inv-title"><h2>Keşif Günlüğü</h2><span class="close">K / Kapat</span></div><p class="muted">Star Republic sana her şeyi anlatmaz. Bazı sistemler gözlemle ortaya çıkar.</p><div class="recipe-list">'+d.map(x=>'<div class="recipe"><b>'+(x[2]?"✓ ":"○ ")+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div></div>';el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}}toggleCrafting(){const el=this.$("inventory");if(!el.classList.contains("hidden")){el.classList.add("hidden");return}el.classList.remove("hidden");this.renderCrafting()}
 renderCrafting(){
  const el=this.$("inventory"),inv=this.game.player.inventoryApi;const visible=RECIPES.filter(r=>r.id!=="astral_compass"||this.game.player.discoveries.bloom);let selected=visible[0];
  el.innerHTML='<div class="modal-card inventory-card crafting-card"><div class="inv-title"><h2>🛠️ Üretim Masası</h2><span class="close">C / Kapat</span></div><p class="muted">3×3 üretim ızgarasında tarifi gör, malzemeleri kontrol et ve ürünü üret.</p><div class="craft-layout"><div class="craft-recipes"><div class="craft-section-title">Tarifler</div>'+visible.map(r=>'<button class="craft-recipe '+(canCraft(inv,r)?"ready":"")+'" data-recipe="'+r.id+'"><span>'+this.icon(r.result)+'</span><b>'+r.name+'</b><small>'+Object.entries(r.ingredients).map(([id,n])=>item(id).name+" ×"+n).join(" · ")+'</small></button>').join("")+'</div><div class="craft-workbench"><div id="craft-selected"></div><div class="craft-board-wrap"><div class="craft-grid" id="craft-grid"></div><div class="craft-arrow">➜</div><div class="craft-output" id="craft-output"></div></div><div id="craft-materials"></div><button id="craft-button" class="craft-button">ÜRET</button></div></div></div>';
  const draw=()=>{const p=selected.pattern||[];el.querySelector("#craft-grid").innerHTML=Array.from({length:9},(_,i)=>{const id=p[i]||"";return '<div class="craft-cell">'+(id?'<span>'+this.icon(id)+'</span><small>'+item(id).name+'</small>':"")+'</div>'}).join("");el.querySelector("#craft-output").innerHTML='<span>'+this.icon(selected.result)+'</span><b>'+item(selected.result).name+'</b><small>×'+selected.amount+'</small>';el.querySelector("#craft-selected").innerHTML='<h3>'+this.icon(selected.result)+' '+selected.name+'</h3><p>'+selected.description+'</p>';el.querySelector("#craft-materials").innerHTML=Object.entries(selected.ingredients).map(([id,n])=>'<span class="'+(inv.has(id,n)?"have":"missing")+'">'+this.icon(id)+' '+item(id).name+': '+inv.count(id)+'/'+n+'</span>').join("");const btn=el.querySelector("#craft-button");btn.disabled=!canCraft(inv,selected);btn.textContent=btn.disabled?"MALZEME EKSİK":"ÜRET"};
  el.querySelectorAll(".craft-recipe").forEach(x=>x.onclick=()=>{selected=visible.find(r=>r.id===x.dataset.recipe);draw()});el.querySelector("#craft-button").onclick=()=>{if(craft(this.game,selected))this.renderCrafting()};draw();el.onclick=e=>{if(e.target.classList.contains("close")||e.target===el)el.classList.add("hidden")}
 }
 setMenu(show){this.$("menu").classList.toggle("hidden",!show)}
 updateDebug(){this.$("debug").classList.toggle("hidden",!this.game.debug)}
 renderDebug(){this.$("debug").innerHTML="FPS: "+Math.round(this.game.fps)+"<br>POS: "+Math.round(this.game.player.x)+", "+Math.round(this.game.player.y)+"<br>TIME: "+this.clock(this.game.world.time)+"<br>DAY: "+this.game.world.day+"<br>ENEMIES: "+this.game.systems.enemies.length+"<br>HP: "+Math.ceil(this.game.player.hp)+"<br>ENERGY: "+Math.ceil(this.game.player.energy)+"<br>GOLD: "+this.game.player.gold}
}
