import {Player} from "./player.js";
import {World} from "./world.js";
import {Systems} from "./systems.js";
import {UI} from "./ui.js";
export class Game{
 constructor(canvas){
  this.canvas=canvas;this.ctx=canvas.getContext("2d");this.ctx.imageSmoothingEnabled=false;
  this.keys=new Set();this.mouse={x:0,y:0,down:false};this.paused=false;this.debug=false;this.last=performance.now();this.fps=60;
  this.resize=()=>{this.canvas.width=innerWidth;this.canvas.height=innerHeight};addEventListener("resize",this.resize);this.resize();
  addEventListener("keydown",e=>this.onKey(e));addEventListener("keyup",e=>this.keys.delete(e.key.toLowerCase()));
  canvas.addEventListener("mousemove",e=>{this.mouse.x=e.clientX;this.mouse.y=e.clientY});
  canvas.addEventListener("mousedown",e=>{if(e.button===0)this.mouse.down=true});addEventListener("mouseup",e=>{if(e.button===0)this.mouse.down=false});
  canvas.addEventListener("wheel",e=>this.player.hotbar=(this.player.hotbar+(e.deltaY>0?1:-1)+9)%9);
  this.world=new World();this.player=new Player(this);this.systems=new Systems(this);this.ui=new UI(this);this.load();
 }
 onKey(e){
  const k=e.key.toLowerCase();this.keys.add(k);
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
  if(k==="f3"){this.debug=!this.debug;this.ui.updateDebug();return}
  if(k==="escape"){this.paused=!this.paused;this.ui.setMenu(this.paused);return}
  if(k==="i"){this.ui.toggleInventory();return}
  if(k==="c"){this.ui.toggleCrafting();return}
  if(k>="1"&&k<="9")this.player.hotbar=Number(k)-1;
  if(k==="e")this.systems.interact();
 }
 start(){requestAnimationFrame(t=>this.loop(t))}
 loop(t){const dt=Math.min((t-this.last)/1000,.05);this.last=t;this.fps=1/Math.max(dt,.001);if(!this.paused){this.systems.update(dt);this.player.update(dt)}this.render();this.ui.update();requestAnimationFrame(x=>this.loop(x))}
 render(){const c=this.ctx,w=this.canvas.width,h=this.canvas.height;c.clearRect(0,0,w,h);this.world.render(c,w,h,this.player);this.systems.render(c,w,h);this.player.render(c,w,h);if(this.debug)this.ui.renderDebug(c,w,h)}
 save(){localStorage.setItem("starRepublicSaveV2",JSON.stringify({player:this.player.serialize(),world:this.world.serialize()}));this.ui.toast("Oyun kaydedildi")}
 load(){try{const raw=localStorage.getItem("starRepublicSaveV2");if(!raw)return;const s=JSON.parse(raw);this.player.restore(s.player);this.world.restore(s.world)}catch(e){console.warn("save load",e)}}
 reset(){localStorage.removeItem("starRepublicSaveV2");location.reload()}
}
