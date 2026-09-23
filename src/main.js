import { Game } from "./game.js";

window.addEventListener("error",e=>{
  const msg=e?.error?.message||e?.message||"Bilinmeyen JavaScript hatası";
  const box=document.getElementById("boot-error");
  if(box){box.style.display="block";box.textContent="STAR REPUBLIC HATASI: "+msg;}
  console.error("Star Republic boot error:",e.error||e.message);
});

window.addEventListener("unhandledrejection",e=>{
  const msg=e?.reason?.message||String(e?.reason||"Bilinmeyen Promise hatası");
  const box=document.getElementById("boot-error");
  if(box){box.style.display="block";box.textContent="STAR REPUBLIC HATASI: "+msg;}
  console.error("Star Republic promise error:",e.reason);
});

const canvas=document.getElementById("game");

try{
  const game=new Game(canvas);
  game.start();
  window.starRepublic=game;
}catch(err){
  const box=document.getElementById("boot-error");
  if(box){
    box.style.display="block";
    box.textContent="STAR REPUBLIC HATASI: "+(err?.message||String(err));
  }
  console.error("Star Republic failed to start:",err);
}