export const QUESTS=[
{id:"first_materials",name:"Boş Eller",text:"Dal, lif ve taş topla.",need:{branch:2,fiber:2,stone:2},reward:25},
{id:"first_seed",name:"Toprağın Sesi",text:"Yabani saplardan Buğday Tohumu üret.",need:{wheat_seed:1},reward:35},
{id:"bloom",name:"İlk Yankı",text:"Astral Bloom'u keşfet.",need:{bloom:true},reward:75},{id:"resonance_25",name:"Dünyanın Fısıltısı",text:"25 Yankı biriktir.",need:{resonance:25},reward:60},{id:"resonance_60",name:"İzlerin Haritası",text:"60 Yankı biriktir.",need:{resonance:60},reward:120}
];
export class QuestSystem{
 constructor(game){this.game=game;this.done={}}
 progress(q){const p=this.game.player;return Object.entries(q.need).every(([id,n])=>id==="bloom"?!!p.discoveries.bloom:id==="resonance"?p.resonance>=n:(p.inventory[id]||0)>=n)}
 claim(q){if(this.done[q.id]||!this.progress(q))return false;this.done[q.id]=true;this.game.player.gold+=q.reward;this.game.player.gainXp(20);this.game.ui.toast(q.name+" tamamlandı: +"+q.reward+" altın");this.game.save();return true}
 serialize(){return this.done}
 restore(s){this.done=s||{}}
}