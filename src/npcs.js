export const NPCS=[
 {id:"mira",name:"Mira",role:"Köy Kâtibi",x:1020,y:375,color:"#d8a85f",text:"Köyün kayıtlarını tutuyorum. Yeni kaynaklar buldukça buranın haritası değişecek."},
 {id:"oren",name:"Oren",role:"Tohumcu",x:1160,y:270,color:"#79b56a",text:"Yabani sapları dikkatle incele. Bazıları toprağa geri dönebilir."},
 {id:"sela",name:"Sela",role:"Gezgin Tüccar",x:1320,y:420,color:"#b879b8",text:"Her gün aynı malları getirmem. Piyasa biraz da senin keşiflerine göre hareket eder."}
];
export function nearestNPC(player){let best=null,bd=55;for(const n of NPCS){const d=Math.hypot(player.x-n.x,player.y-n.y);if(d<bd){best=n;bd=d}}return best}
export function drawNPC(c,n){c.fillStyle="rgba(0,0,0,.22)";c.fillRect(n.x-10,n.y+18,20,4);c.fillStyle=n.color;c.fillRect(n.x-10,n.y-8,20,24);c.fillStyle="#e7c28f";c.fillRect(n.x-8,n.y-24,16,16);c.fillStyle="#27303a";c.fillRect(n.x-9,n.y-27,18,6);}
