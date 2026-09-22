import {item} from "./items.js";
export const RECIPES=[
{id:"crude_tool",name:"İlk Yontu",description:"Taşı şekillendirip lifle bağla. Basit kaynakları daha verimli toplar.",ingredients:{stone:2,fiber:2,branch:2},result:"crude_tool",amount:1},
{id:"hand_axe",name:"Lif Bağlı Keski",description:"Odunsu kaynaklardan daha fazla malzeme çıkarır.",ingredients:{stone:1,fiber:3,branch:3},result:"hand_axe",amount:1},
{id:"reed_seed",name:"Tohum Ayıklama",description:"Yabani saplardan ekilebilir bir çekirdek ayır.",ingredients:{reed:3,fiber:1},result:"reed_seed",amount:1},
{id:"astral_compass",name:"Astral Pusula",description:"Astral Tozu ve çakmaktaşını birleştirerek gizli yankıları fark etmeye başla.",ingredients:{astral_dust:2,flint:1,fiber:2},result:"astral_compass",amount:1}
];
export function canCraft(inv,r){return Object.entries(r.ingredients).every(([id,n])=>inv.has(id,n))}
export function craft(game,r){const inv=game.player.inventoryApi;if(!canCraft(inv,r)){game.ui.toast("Eksik malzeme.");return false}for(const [id,n] of Object.entries(r.ingredients))inv.remove(id,n);inv.add(r.result,r.amount);if(r.result==="crude_tool"||r.result==="hand_axe")game.player.equipment.tool=r.result;if(r.result==="astral_compass")game.player.discoveries.compass=true;game.ui.toast(r.name+" üretildi.");game.save();return true}