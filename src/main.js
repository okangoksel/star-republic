const boot=document.getElementById("boot-error");
const canvas=document.getElementById("game");

function showBootError(err){
  const msg=err?.stack||err?.message||String(err);
  if(boot){
    boot.style.display="block";
    boot.textContent="STAR REPUBLIC YUKLEME HATASI:\n\n"+msg;
  }
  console.error("Star Republic boot error:",err);
}

window.addEventListener("error",e=>{
  showBootError(e.error||e.message||"Bilinmeyen JavaScript hatasi");
});

window.addEventListener("unhandledrejection",e=>{
  showBootError(e.reason||"Bilinmeyen Promise hatasi");
});

if(canvas){
  const c=canvas.getContext("2d");
  canvas.width=innerWidth;
  canvas.height=innerHeight;
  c.fillStyle="#466f47";
  c.fillRect(0,0,canvas.width,canvas.height);
  c.fillStyle="#fff";
  c.font="bold 20px system-ui";
  c.textAlign="center";
  c.fillText("STAR REPUBLIC yukleniyor...",canvas.width/2,canvas.height/2);
}

(async()=>{
  try{
    const mod=await import("./game.js?v=0.3.1");
    const Game=mod.Game;
    const game=new Game(canvas);
    window.starRepublic=game;
    game.start();
  }catch(err){
    showBootError(err);
  }
})();