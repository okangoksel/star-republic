import {Player} from "./player.js";
import {World} from "./world.js";
import {Systems} from "./systems.js";
import {UI} from "./ui.js";
import {QuestSystem} from "./quests.js";

export class Game{
 constructor(canvas){
  this.canvas=canvas;
  this.ctx=canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled=false;
  this.keys=new Set();
  this.mouse={x:0,y:0,down:false};
  this.touchMove={x:0,y:0};
  this.mobile={};
  this.paused=false;
  this.debug=false;
  this.last=performance.now();
  this.fps=60;
  this.runtimeError=null;

  this.resize=()=>{this.canvas.width=innerWidth;this.canvas.height=innerHeight};
  addEventListener("resize",this.resize);
  this.resize();

  addEventListener("keydown",e=>this.onKey(e));
  addEventListener("keyup",e=>this.keys.delete(e.key.toLowerCase()));
  canvas.addEventListener("mousemove",e=>{this.mouse.x=e.clientX;this.mouse.y=e.clientY});
  canvas.addEventListener("mousedown",e=>{if(e.button===0){this.mouse.down=true;this.player.attack()}});
  addEventListener("mouseup",e=>{if(e.button===0)this.mouse.down=false});

  this.world=new World();
  this.player=new Player(this);
  canvas.addEventListener("wheel",e=>{
   this.player.hotbar=(this.player.hotbar+(e.deltaY>0?1:-1)+9)%9;
  },{passive:true});
  this.systems=new Systems(this);
  this.quests=new QuestSystem(this);
  this.ui=new UI(this);
  this.setupMobileControls();
  this.load();
 }

 setupMobileControls(){
  const joystick=document.getElementById("joystick");
  const stick=document.getElementById("stick");
  const actions=document.getElementById("mobile-actions");
  if(!joystick||!stick||!actions)return;

  const state={active:false,id:null,cx:0,cy:0,max:42};

  const reset=()=>{
   state.active=false;
   state.id=null;
   this.touchMove.x=0;
   this.touchMove.y=0;
   this.keys.delete("w");this.keys.delete("a");this.keys.delete("s");this.keys.delete("d");
   stick.style.transform="translate(0px,0px)";
  };

  const update=(clientX,clientY)=>{
   let dx=clientX-state.cx;
   let dy=clientY-state.cy;
   const len=Math.hypot(dx,dy);
   if(len>state.max){
    dx=dx/len*state.max;
    dy=dy/len*state.max;
   }
   this.touchMove.x=dx/state.max;
   this.touchMove.y=dy/state.max;
   stick.style.transform=`translate(${dx}px,${dy}px)`;
  };

  joystick.addEventListener("pointerdown",e=>{
   e.preventDefault();
   state.active=true;
   state.id=e.pointerId;
   const r=joystick.getBoundingClientRect();
   state.cx=r.left+r.width/2;
   state.cy=r.top+r.height/2;
   try{joystick.setPointerCapture(e.pointerId)}catch(_){}
   update(e.clientX,e.clientY);
  });

  joystick.addEventListener("pointermove",e=>{
   if(!state.active||e.pointerId!==state.id)return;
   e.preventDefault();
   update(e.clientX,e.clientY);
  });

  const end=e=>{
   if(state.id!==null&&e.pointerId!==state.id)return;
   reset();
  };
  joystick.addEventListener("pointerup",end);
  joystick.addEventListener("pointercancel",end);
  joystick.addEventListener("lostpointercapture",reset);

  actions.querySelectorAll("button").forEach(btn=>{
   const action=btn.dataset.action;
   const press=e=>{
    e.preventDefault();
    if(action==="attack")this.player.attack();
    if(action==="interact")this.systems.interact();
    if(action==="inventory")this.ui.toggleInventory();
    if(action==="craft")this.ui.toggleCrafting();
    if(action==="map")this.ui.toggleMap();
   };
   btn.addEventListener("pointerdown",press);
   btn.addEventListener("contextmenu",e=>e.preventDefault());
  });
 }

 onKey(e){
  const k=e.key.toLowerCase();
  this.keys.add(k);
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
  try{
   if(k==="f3"){this.debug=!this.debug;this.ui.updateDebug();return}
   if(k==="escape"){this.paused=!this.paused;this.ui.setMenu(this.paused);return}
   if(k==="i"){this.ui.toggleInventory();return}
   if(k==="c"){this.ui.toggleCrafting();return}
   if(k==="m"){this.ui.toggleMap();return}
   if(k==="j"){this.ui.toggleQuests();return}
   if(k==="p"){this.ui.toggleMarketplace();return}
   if(k==="k"){this.ui.toggleDiscoveries();return}
   if(k==="l"){this.ui.toggleGuide();return}
   if(k>="1"&&k<="9")this.player.hotbar=Number(k)-1;
   if(k==="e")this.systems.interact();
  }catch(err){this.reportError(err)}
 }

 start(){requestAnimationFrame(t=>this.loop(t))}

 loop(t){
  const dt=Math.min((t-this.last)/1000,.05);
  this.last=t;
  this.fps=1/Math.max(dt,.001);

  if(!this.paused){
   try{this.systems.update(dt)}catch(err){this.reportError(err);this.paused=true}
   try{this.player.update(dt)}catch(err){this.reportError(err)}
  }

  try{this.render()}catch(err){this.reportError(err);this.renderFallback()}
  try{this.ui.update()}catch(err){this.reportError(err)}

  requestAnimationFrame(x=>this.loop(x));
 }

 render(){
  const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
  c.clearRect(0,0,w,h);
  this.world.render(c,w,h,this.player);
  this.systems.render(c,w,h);
  this.player.render(c,w,h);
  if(this.debug)this.ui.renderDebug(c,w,h);
 }

 renderFallback(){
  const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
  c.clearRect(0,0,w,h);
  c.fillStyle="#466f47";c.fillRect(0,0,w,h);
  c.fillStyle="#6b4b33";c.fillRect(w/2-260,h/2-195,520,390);
  c.fillStyle="#9a7249";c.fillRect(w/2-215,h/2-145,430,290);
  c.fillStyle="#e8c08a";c.fillRect(w/2-10,h/2-25,20,20);
  c.fillStyle="#fff";c.font="bold 18px system-ui";
  c.fillText("STAR REPUBLIC",w/2-75,h/2+55);
 }

 reportError(err){
  const msg=err?.message||String(err);
  if(this.runtimeError===msg)return;
  this.runtimeError=msg;
  console.error("Star Republic runtime error:",err);
  const el=document.getElementById("toast");
  if(el){
   el.textContent="Oyun hatası: "+msg;
   el.style.opacity=1;
   el.style.background="rgba(90,20,20,.92)";
  }
 }

 save(){
  try{
   localStorage.setItem("starRepublicSaveV2",JSON.stringify({
    player:this.player.serialize(),
    world:this.world.serialize(),
    farm:this.systems.farmSlots,
    quests:this.quests.serialize()
   }));
   this.ui.toast("Oyun kaydedildi");
  }catch(err){this.reportError(err)}
 }

 load(){
  try{
   const raw=localStorage.getItem("starRepublicSaveV2");
   if(!raw)return;
   const s=JSON.parse(raw);
   if(!s||typeof s!=="object")throw new Error("Kayıt verisi bozuk");
   this.player.restore(s.player);
   this.world.restore(s.world);
   if(Array.isArray(s.farm)&&s.farm.length===this.systems.farmSlots.length)this.systems.farmSlots=s.farm;
   if(s.quests)this.quests.restore(s.quests);
  }catch(err){
   console.warn("save load",err);
   localStorage.removeItem("starRepublicSaveV2");
   this.runtimeError=null;
  }
 }

 reset(){
  localStorage.removeItem("starRepublicSaveV2");
  location.reload();
 }
}
