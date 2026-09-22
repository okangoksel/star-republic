import {item} from "./items.js";
export const RECIPES=[
 {id:"crude_tool",name:"İlk Yontu",description:"Taşı şekillendirip lifle bağla. Basit kaynakları daha verimli toplar.",ingredients:{stone:2,fiber:2,branch:2},result:"crude_tool",amount:1},
 {id:"hand_axe",name:"Lif Bağlı Keski",description:"Odunsu kaynaklardan daha fazla malzeme çıkarır.",ingredients:{stone:1,fiber:3,branch:3},result:"hand_axe",amount:1},
 {id:"stone_club",name:"Yontma Sopa",description:"Savunmasız gecelere karşı ilk gerçek silahın.",ingredients:{stone:1,branch:4,fiber:1},result:"stone_club",amount:1},
 {id:"reed_seed",name:"Tohum Ayıklama",description:"Yabani saplardan ekilebilir bir çekirdek ayır.",ingredients:{reed:3,fiber:1},result:"reed_seed",amount:1}
];
export function canCraft(inv,r){return Object.entries(r.ingredients).every(([id,n])=>inv.has(id,n))}
export function craft(game,r){
 const inv=game.inventory;
 if(!canCraft(inv,r)){game.ui.toast("Eksik malzeme.");return false}
 for(const [id,n] of Object.entries(r.ingredients))inv.remove(id,n);
 inv.add(r.result,r.amount);
 if(r.result==="crude_tool")game.player.equipment.tool="crude_tool";
 if(r.result==="hand_axe")game.player.equipment.tool="hand_axe";
 if(r.result==="stone_club")game.player.equipment.weapon="stone_club";
 game.ui.toast(r.name+" üretildi.");
 game.save();
 return true;
}
