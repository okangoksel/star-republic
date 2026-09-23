export class World{
 constructor(){this.width=1800;this.height=1100;this.time=6*60;this.day=1;this.screenOffsetX=0;this.screenOffsetY=0;this.farm={x:120,y:170,w:520,h:390};this.resources=[];this.weather="clear";this.weatherTimer=0;this.echoLevel=0;this.mineDepth=0;this.makeWorld()}
 makeWorld(){
  const types=["branch","fiber","rock","reed"];
  const starter=[["branch",335,315],["branch",465,320],["fiber",300,365],["fiber",500,365],["rock",350,425],["rock",455,430],["reed",280,470],["reed",525,465]];
  for(const [type,x,y] of starter)this.resources.push({type,x,y,hp:2});
  for(let i=0;i<92;i++){const x=60+Math.random()*(this.width-120),y=60+Math.random()*(this.height-120);if(this.inFarm(x,y)||Math.hypot(x-390,y-390)<170)continue;this.resources.push({type:types[Math.floor(Math.random()*types.length)],x,y,hp:2+Math.floor(Math.random()*2)})}
  this.resources.push({type:"bloom",x:610,y:410,hp:3,rare:true});
  this.resources.push({type:"crystal",x:1580,y:560,hp:2,rare:true},{type:"crystal",x:1660,y:735,hp:2,rare:true},{type:"star_fragment",x:1490,y:820,hp:1,rare:true});
 }
 inFarm(x,y){return x>this.farm.x&&x<this.farm.x+this.farm.w&&y>this.farm.y&&y<this.farm.y+this.farm.h}
 isNight(){return this.time>=20*60||this.time<6*60}
 update(dt){
  this.time+=dt*3;this.weatherTimer+=dt;
  if(this.weatherTimer>18){this.weatherTimer=0;this.rollWeather()}
  if(this.time>=24*60){this.time-=24*60;this.day++;this.regrowResources();this.rollWeather()}
}
rollWeather(){const pool=["clear","rain","wind","veil"];this.weather=pool[(this.day*7+Math.floor(this.time/60))%pool.length]}
regrowResources(){
  const count=Math.min(18,4+Math.floor(this.day/2));
  const types=["branch","fiber","rock","reed"];
  for(let i=0;i<count;i++){const x=80+Math.random()*(this.width-160),y=100+Math.random()*(this.height-200);if(this.inFarm(x,y)||Math.hypot(x-390,y-390)<140||this.resources.some(r=>Math.hypot(r.x-x,r.y-y)<42))continue;this.resources.push({type:types[(i+this.day)%types.length],x,y,hp:2+Math.floor(Math.random()*2)})}
}
 drawTree(c,x,y,s=1){c.fillStyle="#5a3b29";c.fillRect(x-4*s,y+8*s,8*s,20*s);c.fillStyle="#28533a";c.fillRect(x-22*s,y-15*s,44*s,28*s);c.fillStyle="#356b45";c.fillRect(x-15*s,y-27*s,30*s,22*s);c.fillStyle="#438052";c.fillRect(x-8*s,y-33*s,16*s,14*s)}
 render(c,w,h,p){
  this.screenOffsetX=w/2-p.x;this.screenOffsetY=h/2-p.y;c.save();c.translate(this.screenOffsetX,this.screenOffsetY);
  c.fillStyle="#466f47";c.fillRect(0,0,this.width,this.height);
  // original region palette and landmarks
  c.fillStyle="#709b61";c.fillRect(70,120,700,560);
  c.fillStyle="#638c57";c.fillRect(0,0,this.width,90);
  c.fillStyle="#5b7f50";c.fillRect(0,90,this.width,8);
  // river / ponds
  c.fillStyle="#568da0";c.fillRect(690,110,380,150);c.fillRect(720,260,38,420);
  for(let x=705;x<1050;x+=46){c.fillStyle="#78adba";c.fillRect(x,155+(x%3)*8,22,3)}
  // village plaza and roads
  c.fillStyle="#c7a66e";c.fillRect(760,420,430,90);c.fillRect(920,300,90,310);
  c.fillStyle="#d6bc83";c.fillRect(1080,90,580,300);
  // mine region
  c.fillStyle="#686866";c.fillRect(1500,420,220,500);c.fillStyle="#25292e";c.fillRect(1530,450,160,440);c.fillStyle="#3a302b";c.fillRect(1570,625,80,55);c.fillStyle="#1c2025";c.fillRect(1582,637,56,43);
  // farm
  c.fillStyle="#6b4b33";c.fillRect(this.farm.x,this.farm.y,this.farm.w,this.farm.h);
  c.fillStyle="#9a7249";c.fillRect(150,210,430,300);
  c.fillStyle="#806040";c.fillRect(160,520,410,18);
  // paths + simple original buildings
  c.fillStyle="#8b6547";c.fillRect(300,170,170,34);
  c.fillStyle="#b26d4c";c.fillRect(330,135,110,65);c.fillStyle="#5b3940";c.fillRect(320,128,130,18);c.fillStyle="#e6cf9d";c.fillRect(370,166,28,34);
  c.fillStyle="#6d8a4f";c.fillRect(1360,475,90,55);c.fillStyle="#5a3b29";c.fillRect(1400,470,10,55);c.fillStyle="#83a75a";c.fillRect(1370,450,70,30);c.fillStyle="#8c5b3e";c.fillRect(1130,150,120,90);c.fillStyle="#5d3e35";c.fillRect(1120,140,140,20);c.fillStyle="#d5bb7b";c.fillRect(1175,190,28,50);
  c.fillStyle="#7b523b";c.fillRect(940,340,120,72);c.fillStyle="#4e3840";c.fillRect(930,330,140,18);
  // trees framing the wilderness
  for(let x=1260;x<1480;x+=55)for(let y=130;y<360;y+=62)this.drawTree(c,x+(y%3)*7,y,0.85);
  for(let x=100;x<680;x+=75)this.drawTree(c,x,760+(x%4)*15,0.8);
  c.fillStyle="#ead39a";c.font="bold 18px system-ui";c.fillText("HOME FIELD",180,190);c.fillText("VILLAGE",1085,112);c.fillText("WOODLAND",1300,155);c.fillText("DEEP MINE",1540,445);c.fillText("MINE ECHO",1565,675);c.fillText("OLD GROVE",1350,510);
  // resource sprites
  for(const r of this.resources){
   if(r.type==="branch"){c.fillStyle="#76502f";c.fillRect(r.x-10,r.y-3,20,6);c.fillRect(r.x-3,r.y-12,6,18)}
   else if(r.type==="fiber"){c.fillStyle="#6c9d4e";c.fillRect(r.x-3,r.y-15,6,25);c.fillRect(r.x-11,r.y-7,22,5)}
   else if(r.type==="reed"){c.fillStyle="#9b9b58";c.fillRect(r.x-2,r.y-16,4,24);c.fillRect(r.x+3,r.y-12,8,3)}
   else if(r.type==="bloom"){c.fillStyle="rgba(210,170,255,.25)";c.fillRect(r.x-18,r.y-18,36,36);c.fillStyle="#d7b7ff";c.fillRect(r.x-7,r.y-7,14,14);c.fillStyle="#fff2a8";c.fillRect(r.x-3,r.y-3,6,6)}
   else if(r.type==="crystal"){c.fillStyle="#5c9fb3";c.fillRect(r.x-6,r.y-14,12,24);c.fillStyle="#b7f0ff";c.fillRect(r.x-3,r.y-17,6,10);c.fillStyle="rgba(170,235,255,.25)";c.fillRect(r.x-13,r.y-18,26,30)}
   else if(r.type==="star_fragment"){c.fillStyle="#e8d38c";c.fillRect(r.x-5,r.y-12,10,24);c.fillStyle="#fff6bf";c.fillRect(r.x-2,r.y-16,4,8);c.fillStyle="rgba(255,230,130,.22)";c.fillRect(r.x-16,r.y-16,32,32)}
   else{c.fillStyle="#70777b";c.fillRect(r.x-10,r.y-9,20,16);c.fillStyle="#8d9599";c.fillRect(r.x-5,r.y-12,10,4)}
  }
  c.restore();
  if(this.weather==="rain"){c.fillStyle="rgba(70,100,130,.10)";c.fillRect(0,0,w,h);c.strokeStyle="rgba(170,210,235,.35)";for(let i=0;i<90;i++){const x=(i*83+this.time*2)%w,y=(i*47+this.time*4)%h;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+14);c.stroke()}}
  if(this.weather==="veil"){c.fillStyle="rgba(130,100,180,.10)";c.fillRect(0,0,w,h)}
  if(this.isNight()){c.fillStyle="rgba(8,12,30,.58)";c.fillRect(0,0,w,h)}
  if(this.weather==="wind"){c.strokeStyle="rgba(220,235,210,.18)";for(let i=0;i<12;i++){const y=(i*73+this.time*8)%h;c.beginPath();c.moveTo(0,y);c.lineTo(w,y+8);c.stroke()}}
 }
 serialize(){return {time:this.time,day:this.day,resources:this.resources,weather:this.weather,weatherTimer:this.weatherTimer,echoLevel:this.echoLevel,mineDepth:this.mineDepth}}
 restore(s){if(s){this.time=s.time??this.time;this.day=s.day??1;this.resources=s.resources??this.resources;this.weather=s.weather??this.weather;this.weatherTimer=s.weatherTimer??0;this.echoLevel=s.echoLevel??0;this.mineDepth=s.mineDepth??0}}
}