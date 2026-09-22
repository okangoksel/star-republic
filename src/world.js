export class World{
 constructor(){this.width=1800;this.height=1100;this.time=6*60;this.day=1;this.screenOffsetX=0;this.screenOffsetY=0;this.tiles=[];this.farm={x:120,y:170,w:520,h:390};this.resources=[];this.makeWorld()}
 makeWorld(){
  for(let i=0;i<70;i++){const x=60+Math.random()*(this.width-120),y=60+Math.random()*(this.height-120);if(this.inFarm(x,y))continue;this.resources.push({type:Math.random()<.55?"tree":"rock",x,y,hp:3})}
 }
 inFarm(x,y){return x>this.farm.x&&x<this.farm.x+this.farm.w&&y>this.farm.y&&y<this.farm.y+this.farm.h}
 isNight(){return this.time>=20*60||this.time<6*60}
 update(dt){this.time+=dt*3;if(this.time>=24*60){this.time-=24*60;this.day++}}
 render(c,w,h,p){
  this.screenOffsetX=w/2-p.x;this.screenOffsetY=h/2-p.y;
  c.save();c.translate(this.screenOffsetX,this.screenOffsetY);
  c.fillStyle="#3e7145";c.fillRect(0,0,this.width,this.height);
  c.fillStyle="#547e48";c.fillRect(0,0,this.width,90);
  c.fillStyle="#344d3a";c.fillRect(0,90,this.width,8);
  c.fillStyle="#86a65c";c.fillRect(70,120,700,560);
  c.fillStyle="#6d4d35";c.fillRect(this.farm.x,this.farm.y,this.farm.w,this.farm.h);
  c.fillStyle="#9b7349";c.fillRect(150,210,430,300);
  c.fillStyle="#6a8d9e";c.fillRect(680,110,380,150);
  c.fillStyle="#b0a18a";c.fillRect(1080,90,580,300);
  c.fillStyle="#5d4332";c.fillRect(1210,120,240,210);
  c.fillStyle="#2d5234";c.fillRect(1225,140,210,170);
  c.fillStyle="#77756f";c.fillRect(1500,420,220,500);
  c.fillStyle="#22262a";c.fillRect(1530,450,160,440);
  for(let x=1535;x<1690;x+=34){c.fillStyle="#6e6a61";c.fillRect(x,460,18,18)}
  c.fillStyle="#d7c18d";c.font="bold 18px system-ui";c.fillText("FARM",180,190);c.fillText("VILLAGE",1160,112);c.fillText("FOREST",1280,160);c.fillText("MINE",1575,445);
  for(const r of this.resources){c.fillStyle=r.type==="tree"?"#285b36":"#70777b";c.fillRect(r.x-9,r.y-12,18,24);if(r.type==="tree"){c.fillStyle="#173d27";c.fillRect(r.x-17,r.y-28,34,25)}}
  c.restore();
  if(this.isNight()){c.fillStyle="rgba(8,12,30,.58)";c.fillRect(0,0,w,h)}
 }
 serialize(){return {time:this.time,day:this.day,resources:this.resources}}
 restore(s){if(s){this.time=s.time??this.time;this.day=s.day??1;this.resources=s.resources??this.resources}}
}