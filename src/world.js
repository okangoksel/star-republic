export class World{
 constructor(){this.width=1800;this.height=1100;this.time=6*60;this.day=1;this.screenOffsetX=0;this.screenOffsetY=0;this.farm={x:120,y:170,w:520,h:390};this.resources=[];this.makeWorld()}
 makeWorld(){
  const types=["branch","fiber","rock","reed"];
  for(let i=0;i<100;i++){const x=60+Math.random()*(this.width-120),y=60+Math.random()*(this.height-120);if(this.inFarm(x,y))continue;this.resources.push({type:types[Math.floor(Math.random()*types.length)],x,y,hp:2+Math.floor(Math.random()*2)})}
 }
 inFarm(x,y){return x>this.farm.x&&x<this.farm.x+this.farm.w&&y>this.farm.y&&y<this.farm.y+this.farm.h}
 isNight(){return this.time>=20*60||this.time<6*60}
 update(dt){this.time+=dt*3;if(this.time>=24*60){this.time-=24*60;this.day++}}
 render(c,w,h,p){
  this.screenOffsetX=w/2-p.x;this.screenOffsetY=h/2-p.y;c.save();c.translate(this.screenOffsetX,this.screenOffsetY);
  c.fillStyle="#3e7145";c.fillRect(0,0,this.width,this.height);c.fillStyle="#547e48";c.fillRect(0,0,this.width,90);c.fillStyle="#344d3a";c.fillRect(0,90,this.width,8);
  c.fillStyle="#86a65c";c.fillRect(70,120,700,560);c.fillStyle="#6d4d35";c.fillRect(this.farm.x,this.farm.y,this.farm.w,this.farm.h);c.fillStyle="#9b7349";c.fillRect(150,210,430,300);
  c.fillStyle="#6a8d9e";c.fillRect(680,110,380,150);c.fillStyle="#b0a18a";c.fillRect(1080,90,580,300);c.fillStyle="#5d4332";c.fillRect(1210,120,240,210);c.fillStyle="#2d5234";c.fillRect(1225,140,210,170);
  c.fillStyle="#77756f";c.fillRect(1500,420,220,500);c.fillStyle="#22262a";c.fillRect(1530,450,160,440);
  c.fillStyle="#d7c18d";c.font="bold 18px system-ui";c.fillText("FARM",180,190);c.fillText("VILLAGE",1160,112);c.fillText("FOREST",1280,160);c.fillText("MINE",1575,445);
  for(const r of this.resources){if(r.type==="branch"){c.fillStyle="#76502f";c.fillRect(r.x-10,r.y-3,20,6);c.fillRect(r.x-3,r.y-12,6,18)}else if(r.type==="fiber"){c.fillStyle="#6c9d4e";c.fillRect(r.x-3,r.y-15,6,25);c.fillRect(r.x-11,r.y-7,22,5)}else if(r.type==="reed"){c.fillStyle="#9b9b58";c.fillRect(r.x-2,r.y-16,4,24);c.fillRect(r.x+3,r.y-12,8,3)}else{c.fillStyle="#70777b";c.fillRect(r.x-10,r.y-9,20,16)}}
  c.restore();if(this.isNight()){c.fillStyle="rgba(8,12,30,.58)";c.fillRect(0,0,w,h)}
 }
 serialize(){return {time:this.time,day:this.day,resources:this.resources}}
 restore(s){if(s){this.time=s.time??this.time;this.day=s.day??1;this.resources=s.resources??this.resources}}
}
