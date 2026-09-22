const FALLBACK = {
  branch:{name:"Dal Parçası",type:"material",rarity:"Common",sellPrice:1,icon:"🪵"},
  fiber:{name:"Yabani Lif",type:"material",rarity:"Common",sellPrice:1,icon:"🌿"},
  stone:{name:"Yontulmamış Taş",type:"material",rarity:"Common",sellPrice:2,icon:"🪨"},
  flint:{name:"Çakmaktaşı",type:"material",rarity:"Uncommon",sellPrice:5,icon:"🔸"},
  reed_seed:{name:"Yabani Tohum",type:"seed",rarity:"Common",sellPrice:3,icon:"🌱"},
  crude_tool:{name:"Derme Çatma Kazma",type:"tool",rarity:"Common",icon:"⛏️"},
  hand_axe:{name:"Lif Bağlı Keski",type:"tool",rarity:"Common",icon:"🪓"},
  stone_club:{name:"Yontma Sopa",type:"weapon",rarity:"Common",damage:9,icon:"🪵"},
  reed:{name:"Yabani Sap",type:"material",rarity:"Common",sellPrice:4,icon:"🌾"},
  astral_dust:{name:"Astral Tozu",type:"material",rarity:"Rare",sellPrice:20,icon:"✦"},
  wheat:{name:"Buğday",type:"crop",rarity:"Common",sellPrice:8,icon:"🌾"},
  wheat_seed:{name:"Buğday Tohumu",type:"seed",rarity:"Common",sellPrice:2,icon:"🌱"},
  wood:{name:"Odun",type:"material",rarity:"Common",sellPrice:3,icon:"🪵"},
  iron:{name:"Demir",type:"material",rarity:"Uncommon",sellPrice:12,icon:"⬜"},
  potion:{name:"Enerji İksiri",type:"food",rarity:"Uncommon",sellPrice:15,icon:"🧪"}
};
export const ITEMS = FALLBACK;
export function item(id){return ITEMS[id]||{name:id,type:"misc",icon:"?"};}
