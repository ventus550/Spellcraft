/*jshint esnext: true */
/*jslint browser: true */

import * as SpellEffects from "./spell_effects.js";
import * as Curse from "./curses.js";
import {Time, Effects, chance, randomChoice, rand} from "./engine.js";




//Spellbar items
export class Item {
	constructor(icon, name, tooltip) {
		Object.assign(this, {
			icon : icon,
			name : name,
			tooltip : tooltip
		});
	}
	
	use() {console.log(this, "NYI");}
}


//GENERIC ITEMS ----------------------------------------------

export class MysteriousTome extends Item {
	constructor() {
		super("items/tome.png", "Mysterious Tome", "This tome contains a powerful spell. There is no telling what will happen should you unleash its power.");
	}
	
	use() {
		const msg = function (txt) {window.messages.message(txt);},
			  player = window.p;
		
		function roll() {
			switch(rand(0, 10)) {
				case 0:
					Curse.ApplyRandomCurse();
					break;
				case 1:
					msg("Damage slightly increased");
					Effects.Modify(player, "damage_modifier", 0.05, "Add")(player);
					break;
				case 2:
					msg("Damage increased");
					Effects.Modify(player, "damage_modifier", 0.1, "Add")(player);
					break;
				case 3:
					msg("Health slightly increased");
					Effects.Modify(player, "MAX_HP", 1.1, "Multiply")(player);
					break;
				case 4:
					msg("Health increased");
					Effects.Modify(player, "MAX_HP", 1.2, "Multiply")(player);
					break;
				case 5:
					msg("Mana orb obtained!");
					Effects.Modify(player, "MAX_MANA", 1, "Add")(player);
					break;
				case 6:
					Effects.ApplyBehaviour(player, SpellEffects.Ignite)(player);
					break;
				case 7:
					Effects.ApplyBehaviour(player, SpellEffects.Ignite)(player);
					break;
				case 8:
					Effects.ApplyBehaviour(player, SpellEffects.Ignite)(player);
					break;
				case 9:
					Effects.ApplyBehaviour(player, SpellEffects.ManaPotionBuff)(player);
					break;
				case 10:
					Effects.ApplyBehaviour(player, SpellEffects.ManaPotionBuff)(player);
					break;
					
			}
			
			if(chance(0.75)) {
				roll();
			}
		}
		
		roll();
	}
}

export class CursedManastone extends Item {
	constructor() {
		super("items/cursed_manastone.png", "Cursed Manastone", "Contains unimaginable amounts of mana... and an occasional curse as well.");
	}
	
	use() {
		if(chance(0.25)) {
			Curse.ApplyRandomCurse();
		}
		window.p.MAX_MANA += 1;
	}
}

export class CursedBox extends Item {
	constructor() {
		super("items/box.png", "Cursed Box", "It propably contains an item, although the name suggests otherwise..");
	}
	
	use() {
		if(chance(0.1)) {
			Curse.ApplyRandomCurse();
		} else {
			const pick = randomChoice(ALL),
				  item = new pick();
			window.messages.message("Box contained " + item.name);
			Time.after(4, function () {
				window.spellbar.pushItem(item);
			});
			
		}
	}
}

export class LiquidFlame extends Item {
	constructor() {
		super("items/potion.png", "Liquid Flame", "Sets everything on fire. Literally.");
	}
	
	use() {
		SpellEffects.FlameBlast(window.p, window.p);
	}
}

export class HealthPotion extends Item {
	constructor() {
		super("items/healthPotion.png", "Health Potion", "Recovers half of your missing health over a short duration.");
	}
	
	use() {
		Effects.ApplyBehaviour(window.p, SpellEffects.HealthPotionBuff)(window.p);
	}
}

export class ManaPotion extends Item {
	constructor() {
		super("items/manaPotion.png", "Mana Potion", "For a brief moment your mana regeneration is greatly amplified.");
	}
	
	use() {
		Effects.ApplyBehaviour(window.p, SpellEffects.ManaPotionBuff)(window.p);
	}
}

export class Poison extends Item {
	constructor() {
		super("items/poison.png", "Deadly Poison", "Deadly cloud shrouds the targeted area, poisoning any creatue that comes into contact with it.");
	}
	
	use() {
		SpellEffects.DeadlyCloud(window.p, window.mouse.pos());
	}
}

export class Soulstone extends Item {
	constructor() {
		super("items/soulstone.png", "Soulstone", "Revive on death with 25% health and suffer a random curse. This effect is unique.");
	}
	
	use() {
		Curse.addBlessing(Curse.Soulstone);
	}
}

export class SacretSigil extends Item {
	constructor() {
		super("items/sigil.png", "Sacret Sigil", "Remove a curse.");
	}
	
	use() {
		if(Curse.removeLastCurse()) {
			window.messages.message("The curse has been lifted!");
		}
	}
}

export class EnchantedScroll extends Item {
	constructor() {
		super("items/enchanted_scroll.png", "Enchanted Scroll", "Gain a random blessing.. or a curse.");
	}
	
	use() {
		if(chance(0.5)) {
			Curse.ApplyRandomCurse();
		} else {
			Curse.ApplyRandomBlessing();
		}
	}
}

export class SummoningCircle extends Item {
	constructor() {
		super("items/portal.png", "Summoning Circle", "Opens the portal to the next level.");
	}
	
	use() {
		window.nextLevel();
	}
}


//DARK FOREST ---------------------------------------------------------------
export class Soulgem extends Item {
	constructor() {
		super("items/soulgem.png", "Soulgem", "Devour the life force of all nearby monsters. If at least 10 monsters are affected transform this item into a Soulstone.");
	}
	
	use() {
		let counter = 0;
		Effects.AreaOfEffect(window.p, 100, function (target) {
			counter++;
			Effects.ApplyBehaviour(window.p, SpellEffects.SoulgemBuff)(target);
		}, ["Hostile"], ["Missile", "Event"])(window.p);
		
		if(counter >= 10) {
			Time.after(5, function () {
				window.messages.message("Dark energies are sucked into the gem. Twisting and turning they form a Soulstone.");
				window.spellbar.pushItem(new Soulstone());
			});
		}
	}
}

export class ForbiddenEnchant extends Item {
	constructor() {
		super("items/enchant.png", "Forbidden Enchant", "Increase your damage by +25%. You have 10% chance to die instantly instead.");
	}
	
	use() {
		if(chance(0.1)) {
			window.p.kill();
		} else {
			window.messages.message("You feel your power grow as the enchant takes effect.");
			Effects.Modify(window.p, "damage_modifier", 0.25, "Add")(window.p);
		}
	}
}

export class DarkPact extends Item {
	constructor() {
		super("items/dark_pact.png", "Dark Pact", "Increase your maximum health by 10%. You have 10% chance to die instantly instead.");
	}
	
	use() {
		if(chance(0.1)) {
			window.p.kill();
		} else {
			window.messages.message("Despite all the dark arts involved you end up feeling a lot healthier and even alive!");
			Effects.Modify(window.p, "MAX_HP", 1.1, "Multiply")(window.p);
		}
	}
}

export class DarkRegeneration extends Item {
	constructor() {
		super("items/blackhole.png", "Dark Regeneration", "Restore your health to full. You have 10% chance to die instantly instead.");
	}
	
	use() {
		if(chance(0.1)) {
			window.p.kill();
		} else {
			window.messages.message("Dark magic surrounds and mends your wounds.");
			Effects.ApplyBehaviour(window.p, SpellEffects.DarkRegenerationBuff)(window.p);
		}
	}
}






//ITEMES ----------------------------
export const DARK_FOREST = [Soulgem, ForbiddenEnchant, DarkPact, DarkRegeneration];

export const GENERIC = [LiquidFlame, HealthPotion, ManaPotion, SacretSigil, EnchantedScroll,
						Poison,Soulstone, CursedBox, MysteriousTome, CursedManastone];

export const ALL = GENERIC.concat(DARK_FOREST);
