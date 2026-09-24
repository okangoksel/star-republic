import {Player} from "./player.js?v=0.4.7";
import {World} from "./world.js?v=0.4.7";
import {Systems} from "./systems.js?v=0.4.7";
import {UI} from "./ui.js?v=0.4.5";
import {QuestSystem} from "./quests.js?v=0.4.7";

export const GAME_VERSION="0.4.7";

export class Game{
 constructor(canvas){
  this.canvas=canvas;
  this.ctx=canvas.getContext("2d");
  if(!this.ctx)throw new Error("Canvas 2D desteği bulunamadı.");
  this.ctx.imageSmoothingEnabled=false;
  this.keys=new Set();
  this.mouse={x:innerWidth/2,y:innerHeight/2,down:false};
  this.touchMove={x:0,y:0};this.attackTouch={x:0,y:0,active:false};
  this.mobile={};
  this.paused=false;
  this.debug=false;
  this.last=performance.now();
  this.fps=60;
  this.runtimeError=null;
  this.lastAutoSave=0;

  this.resize=()=>{this.canvas.width=Math.max(320,innerWidth);this.canvas.height=Math.max(240,innerHeight)};
  addEventListener("resize",this.resize);
  this.resize();

  addEventListener("keydown",e=>this.onKey(e));
  addEventListener("keyup",e=>this.keys.delete(e.key.toLowerCase()));
  canvas.addEventListener("mousemove",e=>{this.mouse.x=e.clientX;this.mouse.y=e.clientY});
  canvas.addEventListener("mousedown",e=>{if(e.button===0){this.mouse.down=true;if(this.player)this.player.attack()}});
  addEventListener("mouseup",e=>{if(e.button===0)this.mouse.down=false});
  addEventListener("blur",()=>{this.keys.clear();this.mouse.down=false;this.touchMove.x=0;this.touchMove.y=0});

  this.world=new World();
  this.player=new Player(this);
  canvas.addEventListener("wheel",e=>{
   if(!this.player)return;
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
   state.active=false;state.id=null;this.touchMove.x=0;this.touchMove.y=0;
   ["w","a","s","d"].forEach(k=>this.keys.delete(k));
   stick.style.transform="translate(0px,0px)";
  };
  const update=(clientX,clientY)=>{
   let dx=clientX-state.cx,dy=clientY-state.cy,len=Math.hypot(dx,dy);
   if(len>state.max){dx=dx/len*state.max;dy=dy/len*state.max}
   this.touchMove.x=dx/state.max;this.touchMove.y=dy/state.max;
   stick.style.transform=`translate(${dx}px,${dy}px)`;
  };

  joystick.addEventListener("pointerdown",e=>{
   e.preventDefault();state.active=true;state.id=e.pointerId;
   const r=joystick.getBoundingClientRect();state.cx=r.left+r.width/2;state.cy=r.top+r.height/2;
   try{joystick.setPointerCapture(e.pointerId)}catch(_){}
   update(e.clientX,e.clientY);
  });
  joystick.addEventListener("pointermove",e=>{
   if(!state.active||e.pointerId!==state.id)return;e.preventDefault();update(e.clientX,e.clientY);
  });
  const end=e=>{if(state.id!==null&&e.pointerId!==state.id)return;reset()};
  joystick.addEventListener("pointerup",end);
  joystick.addEventListener("pointercancel",end);
  joystick.addEventListener("lostpointercapture",reset);

  const attackBtn=actions.querySelector('[data-action="attack"]');
  if(attackBtn){
   const attackStick=attackBtn.querySelector(".attack-stick");
   const astate={active:false,id:null,cx:0,cy:0,max:32};
   const resetAttack=()=>{astate.active=false;astate.id=null;this.attackTouch.x=0;this.attackTouch.y=0;this.attackTouch.active=false;if(attackStick)attackStick.style.transform="translate(0,0)"};
   const updateAttack=(x,y)=>{let dx=x-astate.cx,dy=y-astate.cy,len=Math.hypot(dx,dy);if(len>astate.max){dx=dx/len*astate.max;dy=dy/len*astate.max}this.attackTouch.x=dx/astate.max;this.attackTouch.y=dy/astate.max;this.attackTouch.active=true;if(attackStick)attackStick.style.transform=`translate(${dx}px,${dy}px)`};
   attackBtn.addEventListener("pointerdown",e=>{e.preventDefault();astate.active=true;astate.id=e.pointerId;const r=attackBtn.getBoundingClientRect();astate.cx=r.left+r.width/2;astate.cy=r.top+r.height/2;try{attackBtn.setPointerCapture(e.pointerId)}catch(_){}updateAttack(e.clientX,e.clientY)});
   attackBtn.addEventListener("pointermove",e=>{if(!astate.active||e.pointerId!==astate.id)return;e.preventDefault();updateAttack(e.clientX,e.clientY)});
   const endAttack=e=>{if(astate.id!==null&&e.pointerId!==astate.id)return;if(astate.active&&Math.hypot(this.attackTouch.x,this.attackTouch.y)>.18)this.player.attack(this.attackTouch.x,this.attackTouch.y);resetAttack()};
   attackBtn.addEventListener("pointerup",endAttack);attackBtn.addEventListener("pointercancel",endAttack);attackBtn.addEventListener("lostpointercapture",resetAttack);
  }
  actions.querySelectorAll("button").forEach(btn=>{
   const action=btn.dataset.action;if(action==="attack")return;
   const press=e=>{
    e.preventDefault();if(!this.player||!this.systems||!this.ui)return;
    if(action==="interact")this.systems.interact();if(action==="inventory")this.ui.toggleInventory();if(action==="craft")this.ui.toggleCrafting();if(action==="map")this.ui.toggleMap();if(action==="quests")this.ui.toggleQuests();if(action==="market")this.ui.toggleMarketplace();if(action==="discoveries")this.ui.toggleDiscoveries();if(action==="guide")this.ui.toggleGuide();
   };
   btn.addEventListener("pointerdown",press);btn.addEventListener("contextmenu",e=>e.preventDefault());
  });
 }

 onKey(e){
  const k=e.key.toLowerCase();
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
  if(e.repeat&&["i","c","m","j","p","k","l","e","escape","f3"].includes(k))return;
  this.keys.add(k);
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

 start(){
  this.last=performance.now();
  requestAnimationFrame(t=>this.loop(t));
 }

 loop(t){
  const dt=Math.min(Math.max((t-this.last)/1000,0),.05);
  this.last=t;this.fps=1/Math.max(dt,.001);this.lastAutoSave+=dt;
  if(!this.paused){
   try{this.systems.update(dt)}catch(err){this.reportError(err);this.paused=true}
   try{this.player.update(dt)}catch(err){this.reportError(err)}
   if(this.lastAutoSave>=30){this.lastAutoSave=0;this.save(true)}
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
  c.clearRect(0,0,w,h);c.fillStyle="#466f47";c.fillRect(0,0,w,h);
  c.fillStyle="#6b4b33";c.fillRect(w/2-260,h/2-195,520,390);
  c.fillStyle="#9a7249";c.fillRect(w/2-215,h/2-145,430,290);
  c.fillStyle="#e8c08a";c.fillRect(w/2-10,h/2-25,20,20);
  c.fillStyle="#fff";c.font="bold 18px system-ui";c.textAlign="center";c.fillText("STAR REPUBLIC",w/2,h/2+55);c.textAlign="left";
 }

 reportError(err){
  const msg=err?.stack||err?.message||String(err);
  if(this.runtimeError===msg)return;
  this.runtimeError=msg;
  console.error("Star Republic runtime error:",err);
  const el=document.getElementById("toast");
  if(el){
   el.textContent="OYUN HATASI: "+(err?.message||String(err));
   el.style.opacity=1;el.style.background="rgba(90,20,20,.94)";el.style.pointerEvents="auto";
  }
 }

 save(silent=false){
  try{
   localStorage.setItem("starRepublicSaveV3",JSON.stringify({
    version:3,player:this.player.serialize(),world:this.world.serialize(),
    farm:this.systems.farmSlots,quests:this.quests.serialize(),savedAt:Date.now()
   }));
   if(!silent)this.ui.toast("Oyun kaydedildi");
  }catch(err){this.reportError(err)}
 }

 load(){
  try{
   const raw=localStorage.getItem("starRepublicSaveV3")||localStorage.getItem("starRepublicSaveV2");
   if(!raw)return;
   const s=JSON.parse(raw);
   if(!s||typeof s!=="object")throw new Error("Kayıt verisi bozuk");
   this.player.restore(s.player);
   this.world.restore(s.world);
   if(Array.isArray(s.farm)&&s.farm.length===this.systems.farmSlots.length)this.systems.farmSlots=s.farm;
   if(s.quests)this.quests.restore(s.quests);
   if(!s.version)localStorage.setItem("starRepublicSaveV3",JSON.stringify({...s,version:3}));
  }catch(err){
   console.warn("save load",err);
   localStorage.removeItem("starRepublicSaveV3");localStorage.removeItem("starRepublicSaveV2");
  }
 }

 reset(){
  localStorage.removeItem("starRepublicSaveV3");localStorage.removeItem("starRepublicSaveV2");location.reload();
 }
}