import {item} from "./items.js";
export const RECIPES=[
{id:"rope",name:"Lif İpi",description:"Lifleri bükerek bağlama ipi.",ingredients:{fiber:3},pattern:["fiber","fiber","fiber"],result:"rope",amount:1},
{id:"wheat_seed",name:"Buğday Tohumu",description:"Yabani sap ve liften tohum ayır.",ingredients:{reed:2,fiber:1},pattern:["reed","fiber","reed"],result:"wheat_seed",amount:2},
{id:"watering_can",name:"Sulama Kabı",description:"İlk tarlaların için basit sulama kabı.",ingredients:{stone:2,branch:2,fiber:2},pattern:["stone","branch","stone","fiber","fiber","fiber"],result:"watering_can",amount:1},
{id:"storage_chest",name:"Tahta Sandık",description:"Kalıcı depolama için sandık.",ingredients:{wood:6,branch:4,rope:1},pattern:["wood","wood","wood","branch","rope","branch","branch","branch","branch"],result:"storage_chest",amount:1},
{id:"dried_herb",name:"Kurutulmuş Ot",description:"Otları saklanabilir yiyeceğe dönüştür.",ingredients:{fiber:3,reed:2},pattern:["fiber","fiber","fiber","reed","","reed"],result:"dried_herb",amount:1},
{id:"energy_potion",name:"Yankı Tonici",description:"Astral Toz ile enerji taşıyan içecek.",ingredients:{astral_dust:1,reed:2},pattern:["reed","astral_dust","reed"],result:"potion",amount:1},
{id:"crude_tool",name:"İlk Yontu",description:"Taş ve lifle ilk toplama aletini üret.",ingredients:{stone:2,fiber:2,branch:2},pattern:["stone","stone","stone","fiber","branch","fiber","","branch",""],result:"crude_tool",amount:1},
{id:"hand_axe",name:"Lif Bağlı Keski",description:"Odunsu kaynaklardan daha fazla malzeme çıkarır.",ingredients:{stone:1,fiber:3,branch:3},pattern:["stone","fiber","fiber","fiber","branch","branch","branch"],result:"hand_axe",amount:1},
{id:"iron_tool",name:"Demir Kazma",description:"Demirle daha verimli taş ve maden toplama.",ingredients:{iron:3,wood:2,rope:1},pattern:["iron","iron","iron","","wood","wood","","rope",""],result:"iron_tool",amount:1},
{id:"iron_axe",name:"Demir Balta",description:"Odun ve dallardan daha fazla kaynak çıkarır.",ingredients:{iron:3,wood:3,rope:1},pattern:["iron","iron","","iron","wood","","rope","wood",""],result:"iron_axe",amount:1},
{id:"reed_seed",name:"Tohum Ayıklama",description:"Yabani saplardan ekilebilir çekirdek ayır.",ingredients:{reed:3,fiber:1},pattern:["reed","fiber","reed","reed","",""],result:"reed_seed",amount:1},
{id:"astral_compass",name:"Astral Pusula",description:"Gizli yankıları fark etmeye başla.",ingredients:{astral_dust:2,flint:1,fiber:2},pattern:["fiber","flint","fiber","astral_dust","astral_dust",""],result:"astral_compass",amount:1},
{id:"starfruit_seed",name:"Yıldız Meyvesi Tohumu",description:"Sıradan tohumu nadir ürüne dönüştür.",ingredients:{astral_dust:2,wheat_seed:1,fiber:2},pattern:["fiber","astral_dust","fiber","astral_dust","wheat_seed",""],result:"starfruit_seed",amount:1},
{id:"moonberry_seed",name:"Ay Üzümü Tohumu",description:"Yankı Parçalarıyla gizemli tohum üret.",ingredients:{echo_shard:2,wheat_seed:1},pattern:["echo_shard","wheat_seed","echo_shard"],result:"moonberry_seed",amount:1},
{id:"resonance_lens",name:"Yankı Merceği",description:"Kristallerin titreşimini okuyabilen araç.",ingredients:{crystal:2,astral_dust:2,flint:1},pattern:["crystal","astral_dust","crystal","astral_dust","flint",""],result:"resonance_lens",amount:1}
];
export function canCraft(inv,r){return Object.entries(r.ingredients).every(([id,n])=>inv.has(id,n))}
export function craft(game,r){const inv=game.player.inventoryApi;if(!canCraft(inv,r)){game.ui.toast("Eksik malzeme.");return false}for(const [id,n] of Object.entries(r.ingredients))inv.remove(id,n);inv.add(r.result,r.amount);if(["crude_tool","hand_axe","iron_tool","iron_axe","resonance_lens"].includes(r.result))game.player.equipment.tool=r.result;if(r.result==="astral_compass")game.player.discoveries.compass=true;if(r.result==="resonance_lens")game.player.discoveries.resonanceLens=true;game.ui.toast(r.name+" üretildi.");game.save();return true}
export function recipePattern(r){const p=Array(9).fill("");(r.pattern||[]).forEach((id,i)=>{if(i<9)p[i]=id||""});return p}
