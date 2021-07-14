/*jshint esnext: true */
/*jslint browser: true */

//import * as Spelleffects from "./spell_effects.js";
import * as Items from "./items.js";
import {ChoiceWindow, LootWindow} from "./interface.js";
import * as Models from "./models.js";
import * as Monsters from "./monsters.js";
import * as SpellEffects from "./spell_effects.js";
import {Screen, randomChoice, Time, Unit, Effects, dist, rand, chance} from "./engine.js";





function pick(arr, count) {
	let carr = arr.slice(),
		res = [];
	
	while (count > 0 && carr.length > 0) {
		let choice = randomChoice(carr);
		carr.splice(carr.indexOf(choice), 1);
		res.push(choice);
		count -= 1;
	}
	return res;
}

//Event Object
export class EventObject extends Unit {
	constructor(x, y, radius, model, event) {
		super(x, y, radius, model);
		this.owner = 0;
		this.properties.isDestructible = false;
		this.event = event(this);
		this.type = "Event";
		
		let self = this;
		this.addEvent("updated", function () {
			if(self.event.isRemoved) {
				self.kill();
			}
			
			try {
				if(dist(window.camera.pos, self.pos) < 10) {
					self.event.show();
				} else {
					self.event.hide();
				}
				
				
			}catch(err) {}
		});
		this.addEvent("removed", function () {
			self.event.remove();
			self.event = undefined;
		});
	}
}


//LOST SOUL ----------------------------------------------------------------------
function LostSoulEvent() {
	let group = [Items.HealthPotion, Items.ManaPotion, Items.LiquidFlame];
	
	return new LootWindow("Lost Soul", "The weird creature appears to be amused by your struggles and offers you its help. You may choose one item:", pick(group, 3), 1);
}


export class LostSoul extends EventObject {
	constructor(x, y) {
		super(x, y, 0, Models.soul, LostSoulEvent);
		
		this.actor.scale = 0.15;
		this.actor.speed = 0.5;
		this.actor.setShadow(1, [0,0]);
	}
}

//CHEST ---------------------------------------------------------------------------
function ChestOpenedEvent(host) {
	host.actor.set("Opening", 10);
	Time.after(15, function () {
		host.actor.set("Opened", 11);
	});
	let group = [Items.HealthPotion, Items.HealthPotion, Items.ManaPotion, Items.LiquidFlame, Items.Soulstone];

	return new LootWindow("Chest", "The chest is open and its contents are laid bare.", pick(group, rand(1, 2)));
}

function ChestEvent(host) {
	
	return new ChoiceWindow("Chest", "Sometimes a chest i just a chest..",
		[
			["Open it", function () {
				host.event = ChestOpenedEvent(host);				   
			}],

			["Leave it be", function () {
				host.kill();
			}]
		]);
}

export class Chest extends EventObject {
	constructor(x, y) {
		super(x, y, 4, Models.chest, ChestEvent);
		
		this.actor.facing = "right";
		this.actor.scale = 0.5;
		this.actor.speed = 0.5;
		this.actor.offset = [3, 10];
		this.actor.setShadow(1.6, [5,-3]);
	}
}

//STATUE ---------------------------------------------------------------------------
function StatueEvent(host) {
	
	return new ChoiceWindow("Grim Statue", "There is something off-putting about it.",
		[
			["Touch it", function () {
				//host.event = ChestOpenedEvent(host);				   
			}],

			["Leave it be", function () {
				host.kill();
			}]
		]);
}

export class Statue extends EventObject {
	constructor(x, y) {
		super(x, y, 4, Models.statue, StatueEvent);
		
		//this.actor.facing = "right";
//		/this.actor.scale = 1;
		//this.actor.offset = [3, 10];
		this.actor.setShadow(1.6, [5,-3]);
	}
}


//TOMBSTONE -------------------------------------------------------------------
function TombstoneLootEvent() {
	let group = [Items.HealthPotion, Items.ManaPotion, Items.LiquidFlame];
	
	return new LootWindow("Tombstone", "You find valuables inside.", pick(group, 2));
}

function TombstoneEvent(host) {
	
	
	return new ChoiceWindow("Tombstone", "As you aproach you feel a chilly gust of wind on the back of your coat.",
		[
			["Dig it up", function () {
				let roll = rand(0, 100);
				
				if(roll < 33) {
					host.event = TombstoneLootEvent(host);
					return;
				}
				if(roll < 66) {
					Screen.warning("You catch a nasty disease!");
					Effects.ApplyBehaviour(window.p, SpellEffects.Disease)(window.p);
				} else {
					Screen.warning("It's an ambush!");
					SpellEffects.Ambush(host.pos, 60, 10, randomChoice([Monsters.Slime,
									   									Monsters.SkeletonArcher]));
				}
				
							   
			}],

			["Leave it be", function () {
				host.kill();
			}]
		]);
}

export class Tombstone extends EventObject {
	constructor(x, y) {
		super(x, y, 4, Models.tombstone, TombstoneEvent);
		
		this.actor.facing = "right";
		this.actor.setShadow(1.6, [5,-3]);
	}
}

//Mushroom -------------------------------------------------------------------
function MushroomLootEvent() {
	let txt;
	if(chance(0.5)) {
		if(chance(0.5)) {
			txt = "Success! The potion contains a powerful poison! Just think of all its potential uses!";
		} else {
			txt = "Alchemy is so underappreciated...";
		}
		
	} else {
		if(chance(0.5)) {
			txt = "Deadly Poison! A perfect tool for all occasions!";
		} else {
			txt = "The potion turns out poisonous. All that is left to do is to test just how much!";
		}
		
	}
	
	
	return new LootWindow("Black Mushroom", txt, [Items.Poison]);
}

function MushroomEvent(host) {
	
	return new ChoiceWindow("Black Mushroom", "It's a mushroom.",
		[
			["Eat the mushroom!", function () {
				let roll = rand(0, 100);

				if(roll < 50) {
					Screen.warning("The mushroom was poisonous. How suprising..");
					Effects.ApplyBehaviour(window.p, SpellEffects.Poison)(window.p);
				} else {
					Effects.ApplyBehaviour(window.p, SpellEffects.HealthPotionBuff)(window.p);
				}			   
			}],
		
		
			["Crush the mushroom", function () {
				SpellEffects.DeadlyCloud(host, host);
				host.kill();
			}],
		
		
			["Make it into a potion", function () {
				let roll = rand(0, 100);
				
				if(roll < 50) {
					host.event = MushroomLootEvent(host);
					return;
				} else {
					Screen.warning("The potion doesn't seem to have any useful properties..");
				}   
			}]

			
		]);
}

export class BlackMushroom extends EventObject {
	constructor(x, y) {
		super(x, y, 4, Models.mushroom, MushroomEvent);
		
		this.actor.facing = "right";
		this.actor.setShadow(1.2, [5,0]);
	}
}


//---------------------------------------------------------------------------------------
export const ALL = [Chest, BlackMushroom, Tombstone];
export const GENERICS = [Chest, Statue];