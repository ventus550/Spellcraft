/*jshint esnext: true */
/*jslint browser: true */


import {Model} from "./engine.js";

//Portal :)
export let portal = new Model("model_assets/portal/idle0.png");
portal.new_auto("Idle", "model_assets/portal/idle", 81, ".png");

//Chest
//export let chest = new Model("model_assets/chest/chest0.png");
//chest.new_auto("Opening", "model_assets/chest/chest", 7, ".png");
//chest.new("Opened", "model_assets/chest/chest7.png");
//chest.new("Idle", "model_assets/chest/chest0.png");

//Chest
export let chest = new Model("model_assets/chest/chest0.png");
chest.new_auto("Opening", "model_assets/chest/chest", 7, ".png");
chest.new("Opened", ["model_assets/chest/chest7.png"]);

//Lost Soul
export let soul = new Model("model_assets/LostSoul/soul0.png");
soul.new_auto("Idle", "model_assets/LostSoul/soul", 11, ".png");

//Tombstone
export let tombstone = new Model("model_assets/tombstone/tombstone.png");

//Statue
export let statue = new Model("model_assets/statue/statue.png");

//Mushroom
export let mushroom = new Model("model_assets/mushroom/mushroom.png");

//Making some models
export let darkwood = new Model("model_assets/darkwood/darkwood0.png");
darkwood.new_auto("Idle", "model_assets/darkwood/darkwood", 52, ".png");

//Slimes ^.^
export let blueSlime = new Model("model_assets/blueSlime/idle/idle0.png");
blueSlime.new_auto("Idle", "model_assets/blueSlime/idle/idle", 3, ".png");
blueSlime.new_auto("Attack", "model_assets/blueSlime/attack/attack", 13, ".png");
blueSlime.new_auto("Death", "model_assets/blueSlime/death/death", 10, ".png");
blueSlime.new_auto("Run", "model_assets/blueSlime/run/run", 17, ".png");

export let redSlime = new Model("model_assets/redSlime/idle/idle0.png");
redSlime.new_auto("Idle", "model_assets/redSlime/idle/idle", 3, ".png");
redSlime.new_auto("Attack", "model_assets/redSlime/attack/attack", 13, ".png");
redSlime.new_auto("Death", "model_assets/redSlime/death/death", 10, ".png");
redSlime.new_auto("Run", "model_assets/redSlime/run/run", 17, ".png");

export let greenSlime = new Model("model_assets/greenSlime/idle/idle0.png");
greenSlime.new_auto("Idle", "model_assets/greenSlime/idle/idle", 3, ".png");
greenSlime.new_auto("Attack", "model_assets/greenSlime/attack/attack", 13, ".png");
greenSlime.new_auto("Death", "model_assets/greenSlime/death/death", 10, ".png");
greenSlime.new_auto("Run", "model_assets/greenSlime/run/run", 17, ".png");

//Skeletons
export let arrow = new Model("model_assets/whiteArcher/arrow.png");

export let whiteArcher = new Model("model_assets/whiteArcher/idle/idle0.png");
whiteArcher.new_auto("Idle", "model_assets/whiteArcher/idle/idle", 2, ".png");
whiteArcher.new_auto("Attack", "model_assets/whiteArcher/attack/attack", 3, ".png");
whiteArcher.new_auto("Death", "model_assets/whiteArcher/death/death", 5, ".png");
whiteArcher.new_auto("Run", "model_assets/whiteArcher/walk/walk", 5, ".png");

export let flamebolt = new Model("model_assets/flamebolt/flamebolt0.png");
flamebolt.new_auto("Run", "model_assets/flamebolt/flamebolt", 26, ".png");

export let explosion_fire = new Model("model_assets/flamebolt/explosion/exp0.png");
explosion_fire.new_auto("Death", "model_assets/flamebolt/explosion/exp", 26, ".png");

export let flame_blast = new Model("model_assets/flameblast/fb0.png");
flame_blast.new_auto("Death", "model_assets/flameblast/fb", 47, ".png");

export let heal = new Model("model_assets/heal/heal0.png");
heal.new_auto("Idle", "model_assets/heal/heal", 43, ".png");

export let poison = new Model("model_assets/poison/0.png");
poison.new_auto("Idle", "model_assets/poison/", 105, ".png");

export let mana_potion = new Model("model_assets/ManaPotion/mana0.png");
mana_potion.new_auto("Idle", "model_assets/ManaPotion/mana", 5, ".png");

export let mage = new Model("model_assets/mage/idle/idle00.gif");
mage.new("Run", [
	"model_assets/mage/run/run0.png",
	"model_assets/mage/run/run0.png",
	"model_assets/mage/run/run1.png",
	"model_assets/mage/run/run1.png",
	"model_assets/mage/run/run2.png",
	"model_assets/mage/run/run2.png",
	"model_assets/mage/run/run3.png",
	"model_assets/mage/run/run3.png",
	"model_assets/mage/run/run4.png",
	"model_assets/mage/run/run4.png"
]);

mage.new_auto("Cast", "model_assets/mage/cast/cast", 72, ".png");


mage.new("Idle", [
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/blink00.png",
	"model_assets/mage/idle/blink01.png",
	"model_assets/mage/idle/blink02.png",
	"model_assets/mage/idle/blink03.png",
	"model_assets/mage/idle/blink04.png",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif",
	"model_assets/mage/idle/idle00.gif"
]);


export let fire = new Model("model_assets/fire/fire0.png");
fire.new_auto("Idle", "model_assets/fire/fire", 9, ".png");

export let flame = new Model("model_assets/flame/flame0.png");
flame.new_auto("Idle", "model_assets/flame/flame", 11, ".png");

export let disease = new Model("model_assets/disease/psmoke0.png");
disease.new_auto("Idle", "model_assets/disease/psmoke", 39, ".png");


export let bonfire = new Model("model_assets/bonfire/bonfire0.png");
bonfire.new_auto("Idle", "model_assets/bonfire/bonfire", 14, ".png");
export let dark_grass = new Model("model_assets/DarkGrass/DarkGrass.png");

export let wild = new Model("model_assets/wild/wild.png");
wild.new("Run", [
	"model_assets/wild/wild00.gif",
	"model_assets/wild/wild01.gif",
	"model_assets/wild/wild02.gif",
	"model_assets/wild/wild03.gif"
]);

export let fireball = new Model("model_assets/fireball/fireball00.gif");
fireball.new("Run", [
	"model_assets/fireball/fireball00.gif",
	"model_assets/fireball/fireball01.gif",
	"model_assets/fireball/fireball03.gif",
	"model_assets/fireball/fireball04.gif",
	"model_assets/fireball/fireball05.gif",
	"model_assets/fireball/fireball06.gif",
	"model_assets/fireball/fireball07.gif",
	"model_assets/fireball/fireball08.gif",
	"model_assets/fireball/fireball09.gif",
	"model_assets/fireball/fireball10.gif",
	"model_assets/fireball/fireball11.gif"
]);
fireball.new("Death", [
	"model_assets/fireball/explosion00.gif",
	"model_assets/fireball/explosion01.gif",
	"model_assets/fireball/explosion02.gif",
	"model_assets/fireball/explosion03.gif",
	"model_assets/fireball/explosion04.gif"

]);
