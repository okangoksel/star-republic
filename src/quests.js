export const QUESTS=[
{id:"first_materials",name:"Boş Eller",text:"Dal, lif ve taş topla.",need:{branch:2,fiber:2,stone:2},reward:25},
{id:"first_seed",name:"Toprağın Sesi",text:"Yabani saplardan Buğday Tohumu üret.",need:{wheat_seed:1},reward:35},
{id:"bloom",name:"İlk Yankı",text:"Astral Bloom'u keşfet.",need:{bloom:true},reward:75},
{id:"resonance_25",name:"Dünyanın Fısıltısı",text:"25 Yankı biriktir.",need:{resonance:25},reward:60},
{id:"iron_progress",name:"Demir Çağı",text:"Demir Kazma veya Demir Balta üret.",need:{iron_tool:1},reward:110},
{id:"deep_mine",name:"Derin Damar",text:"Madenin 3. derinliğine ulaş.",need:{mineDepth:3},reward:160},
{id:"crystal_echo",name:"Kristal Yankısı",text:"Bir Yankı Parçası bul.",need:{echo_shard:1},reward:140},
{id:"echo_gate",name:"Ormanın Yankısı",text:"Yankı Ormanı için İlk Yankıyı keşfet ve 25 Yankıya ulaş.",need:{region_echo:true},reward:180},
{id:"traveler_food",name:"Yol Azığı",text:"Gezgin Erzağı üret.",need:{camp_ration:1},reward:55},
{id:"moonberry",name:"Ay Bahçesi",text:"Ay Üzümü yetiştir.",need:{moonberry:1},reward:240},
{id:"crystal_gate",name:"Kristal Kapı",text:"Kristal Yankısını keşfet ve madenin 3. derinliğine ulaş.",need:{region_crystal:true},reward:220},
{id:"rare_crop",name:"Gökyüzü Bahçesi",text:"Yıldız Meyvesi yetiştir.",need:{starfruit:1},reward:180},
{id:"resonance_60",name:"İzlerin Haritası",text:"60 Yankı biriktir.",need:{resonance:60},reward:120},
{id:"star_gate",name:"Çayıra Açılan Yol",text:"Yıldız Çayırı için Gökyüzü Bahçesini tamamla ve 60 Yankıya ulaş.",need:{region_star:true},reward:300},
{id:"relic_research",name:"Kadim İz",text:"Kadim bir kalıntı bul.",need:{ancient_relic:1},reward:260},
{id:"glow_path",name:"Işıklı Yol",text:"Parlayan Mantarı bul.",need:{glow_mushroom:1},reward:140}
];
export class QuestSystem{
 constructor(game){this.game=game;this.done={}}
 progress(q){
  const p=this.game.player,w=this.game.world;
  return Object.entries(q.need).every(([id,n])=>{
   if(id==="bloom")return !!p.discoveries.bloom;
   if(id==="resonance")return p.resonance>=n;
   if(id==="mineDepth")return (w.mineDepth||0)>=n;
   if(id==="region_echo")return !!p.discoveries.bloom&&p.resonance>=25;
   if(id==="region_crystal")return !!p.discoveries.deepMine&&!!p.inventory.echo_shard;
   if(id==="region_star")return !!this.done.rare_crop&&p.resonance>=60;
   return (p.inventory[id]||0)>=n;
  });
 }
 claim(q){if(this.done[q.id]||!this.progress(q))return false;this.done[q.id]=true;this.game.player.gold+=q.reward;this.game.player.gainXp(20);this.game.ui.toast(q.name+" tamamlandı: +"+q.reward+" altın");this.game.save();return true}
 serialize(){return this.done}
 restore(s){this.done=s||{}}
}