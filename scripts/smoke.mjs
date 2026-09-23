import assert from "node:assert/strict";
import {Player} from "../src/player.js";
import {Inventory} from "../src/inventory.js";
import {RECIPES,canCraft} from "../src/crafting.js";

const game={
  keys:new Set(),touchMove:{x:0,y:0},mouse:{x:500,y:360},
  world:{width:1800,height:1100,screenOffsetX:0,screenOffsetY:0,isNight:()=>false},
  systems:{handStrike(){},hit(){}},
  ui:{toast(){}}
};
const p=new Player(game);
assert.equal(typeof p.attack,"function");
assert.equal(typeof p.attackPower,"number");
p.inventory={iron:3,wood:3,rope:1};
p.inventoryOrder=["iron","wood","rope"];
p.inventoryApi=new Inventory(p);
assert.ok(canCraft(p.inventoryApi,RECIPES.find(r=>r.id==="iron_axe")));
p.attack();
console.log("Star Republic smoke test passed");
