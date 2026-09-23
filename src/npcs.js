export const NPCS=[
 {id:"mira",name:"Mira",role:"Köy Kâtibi",x:1020,y:375,color:"#d8a85f",text:"Köyün kayıtlarını tutuyorum. Yeni kaynaklar buldukça buranın haritası değişecek."},
 {id:"oren",name:"Oren",role:"Tohumcu",x:1160,y:270,color:"#79b56a",text:"Yabani sapları dikkatle incele. Bazıları toprağa geri dönebilir."},
 {id:"sela",name:"Sela",role:"Gezgin Tüccar",x:1320,y:420,color:"#b879b8",text:"Her gün aynı malları getirmem. Piyasa biraz da senin keşiflerine göre hareket eder."},
 {id:"elara",name:"Elara",role:"Yankı Araştırmacısı",x:1305,y:300,color:"#8f78d8",text:"Astral Bloom'u gördüysen, Yankı Ormanı'nın kapısı sana cevap verebilir. Önce 25 Yankı topla."},
 {id:"darin",name:"Darin",role:"Maden Ustası",x:1510,y:400,color:"#b88962",text:"Üçüncü derinlikte duyduğun yankı tesadüf değil. Kristal Mağara'nın kapısı eski bir işaret taşıyor."},
 {id:"lyra",name:"Lyra",role:"Çayır Bekçisi",x:1120,y:690,color:"#d9c56e",text:"Yıldız Çayırı'na giden yol ancak Gökyüzü Bahçesi tamamlandığında açılacak. Orada gökyüzünden düşen taşların izleri var."}
];
export function nearestNPC(player){let best=null,bd=55;for(const n of NPCS){const d=Math.hypot(player.x-n.x,player.y-n.y);if(d<bd){best=n;bd=d}}return best}
export function drawNPC(c,n){c.fillStyle="rgba(0,0,0,.22)";c.fillRect(n.x-10,n.y+18,20,4);c.fillStyle=n.color;c.fillRect(n.x-10,n.y-8,20,24);c.fillStyle="#e7c28f";c.fillRect(n.x-8,n.y-24,16,16);c.fillStyle="#27303a";c.fillRect(n.x-9,n.y-27,18,6);}