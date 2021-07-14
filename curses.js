/*jshint esnext: true */
/*jslint browser: true */

import {Behaviour, Effects, randomChoice, UNIT_ARRAY, SEC, chance} from "./engine.js";
import * as SpellEffects from "./spell_effects.js";


//General Use
export class Curse extends Behaviour {
	constructor(title, description, img, obj) {
		super(window.p, obj);
		this.title = title;
		this.description = description;
		this.img = img;
	}
}

export function removeCurse(curse) {
	window.cb.removeCurse(curse);
}

export function removeLastCurse() {
	const curse = window.cb.last_curse();
	if(curse) {
		removeCurse(curse);
	}
	
	return curse;
}

export function addCurse(curse) {
	window.cb.addCurse(curse);
}

export function removeBlessing(blessing) {
	window.cb.removeBlessing(blessing);
}

export function addBlessing(blessing) {
	window.cb.addBlessing(blessing);
}






//CURSES -------------------------------------------------------------
export class Blindness extends Curse {
	constructor() {
		super(
			
			"Blindness",
			"Your vision is obscured.",
			"curses/eye.png",
			{
				Apply : function () {window.Screen.shadowRadius = 500;
									 window.Screen.setShadows();},
				Remove : function () {window.Screen.shadowRadius = 1000;
									  window.Screen.setShadows();}
			}
		);
	}
}

export class Weakness extends Curse {
	constructor() {
		super(
			
			"Weakness",
			"Your damage dealt is reduced.",
			"curses/cast.png",
			{
				Apply : function () {window.p.damage_modifier -= 0.25;},
				Remove : function () {window.p.damage_modifier += 0.25;}
			}
		);
	}
}

export class Fragility extends Curse {
	constructor() {
		super(
			
			"Fragility",
			"You take increased damage.",
			"curses/skull.png",
			{
				Apply : function () {window.p.damage_reduction -= 0.25;},
				Remove : function () {window.p.damage_reduction += 0.25;}
			}
		);
	}
}

export class Madness extends Curse {
	constructor() {
		super(
			
			"Madness",
			"Your spells have a chance to be misdirected.",
			"curses/twist.png",
			{}
		);
	}
}

export class Oblivion extends Curse {
	constructor() {
		super(
			
			"Oblivion",
			"Taking damage while below 50% health has a chance to shortly incapacitate you.",
			"curses/zzz.png",
			{
				Apply : function (target) {
					target.addEvent("damaged", function () {
						if(target.hasBehaviour(Oblivion) &&
						   target.HP < target.MAX_HP/2 &&
						   chance(0.1))
						{
							target.properties.isIncapacitated = true;
							target.actor.color = "purple";
							
							setTimeout(function () {
								target.properties.isIncapacitated = false;
								target.actor.color = undefined;
							}, 500);
						}
					});
				}
			}
		);
	}
}

export class Soulshatter extends Curse {
	constructor() {
		super(
			
			"Shattered Soul",
			"Cannot benefit from resurrection mechanics.",
			"curses/souls.png",
			{}
		);
	}
}

export class Blood extends Curse {
	constructor() {
		super(
			
			"Black Blood",
			"Chance to leave a toxic cloud when taking damage.",
			"curses/dark_blood.png",
			{
				Apply : function (target) {
					target.addEvent("damaged", function () {
						if(target.hasBehaviour(Blood)) {
							if(chance(0.001)) {
								SpellEffects.DeadlyCloud(window.p, window.p);
							}
						}
					});
				}
				
			}
		);
	}
}

export class Demonology extends Curse {
	constructor() {
		super(
			
			"Demonology",
			"Periodically summon a random demon.",
			"curses/demon.png",
			{}
		);
	}
}

export class Soulbinding extends Curse {
	constructor() {
		super(
			
			"Soulbound",
			"Slaying monsters causes you to take damage.",
			"curses/fish.png",
			{}
		);
	}
}

export class Hunt extends Curse {
	constructor() {
		super(
			
			"Hunted",
			"Monsters sense you from greater distance.",
			"curses/evil_eye.png",
			{}
		);
	}
}

export class Shadows extends Curse {
	constructor() {
		super(
			
			"Shadows",
			"Monsters regenerate their health while in your presence.",
			"curses/siphon.png",
			{
				Period : SEC,
				Periodic : Effects.AreaOfEffect(window.p, 100, function (target) {
					if(target.HP + 1 <= target.MAX_HP) {
						target.HP += 1;
					}
				}, ["Hostile"])
			}
		);
	}
}

export class Thorns extends Curse {
	constructor() {
		super(
			
			"Thorns",
			"Suffer 50% of your current health as damage when performing teleportation magic.",
			"curses/tentacles.png",
			{}
		);
	}
}

export class Corruption extends Curse {
	constructor() {
		super(
			
			"Corrupted",
			"Dropping below 50% mana causes you to take damage proportionate to the mana exceeded.",
			"curses/orb.png",
			{}
		);
	}
}

export class Dusk extends Curse {
	constructor() {
		super(
			
			"Dusk",
			"Monsters grow in strength with time. Resets each level.",
			"curses/eclipse.png",
			{
				Period : 1000,
				Periodic : function () {
					window.messages.warning("Monsters grow in strength!");
					for(let u of UNIT_ARRAY) {
						if(u.type === "Monster") {
							u.damage_modifier += 0.05;
						}
					}
				}
				
			}
		);
	}
}
//Greater Curses
export class Thirst extends Curse {
	constructor() {
		super(
			
			"Thirst",
			"Permanently reduce your maximum health every 10 seconds. Killing monsters resets this timer. Lasts until the end of this level.",
			"curses/maw.png",
			{
				Period : SEC,
				Periodic : function () {
					let player = window.p;
					player.thirst += 1;
					if(player.thirst === 10) {
						player.thirst = 0;
						player.MAX_HP *= 0.95;
						if(player.MAX_HP < player.HP) {
							player.HP *= 0.95;
						}
					}
				}
			}
		);
	}
}

export class Shackles extends Curse {
	constructor() {
		super(
			
			"Shackled",
			"You can no longer use your items. Lasts until the end of this level.",
			"curses/swirl.png",
			{
				Apply : function () {
					for(let slot of window.spellbar.slots) {
						slot.active = false;
					}
				},
				
				Remove : function () {
					for(let slot of window.spellbar.slots) {
						slot.active = true;
					}
				}
				
			}
		);
	}
}

export class Hemophilia extends Curse {
	constructor() {
		super(
			
			"Hemophilia",
			"Cannot benefit from health restoring effects. Lasts until the end of this level.",
			"curses/blood.png",
			{}
		);
	}
}


export class Darkness extends Curse {
	constructor() {
		super(
			
			"Darkness",
			"Dead monsters have a chance to revive as demons. Lasts until the end of this level.",
			"curses/devil.png",
			{}
		);
	}
}

export class Doom extends Curse {
	constructor() {
		super(
			
			"Doomed",
			"Next portal you take will lead you into the Demon Realm instead. Lasts until the end of this level.",
			"curses/pentagram.png",
			{}
		);
	}
}


//Curse Mechanics --------------------------------------
export const LesserCurses = [Blindness, Weakness, Fragility, Madness, Oblivion,
							 Soulshatter, Blood, Demonology, Soulbinding,
							 Hunt, Shadows, Thorns, Corruption, Dusk];
export const GreaterCurses = [Thirst, Shackles, Hemophilia, Darkness, Doom];




export function ApplyRandomCurse() {
	let bracket = LesserCurses;
	
	if(chance(0.1)) {
		window.messages.warning("You feel a dark aura surround you, but nothing happens");
		ApplyRandomBlessing();
		return false;
	}
	
	if(Object.keys(window.cb.curses).length >= 10) {
		window.messages.warning("You feel a dark aura surround you, but nothing happens");
		return false;
	}
	
	if(Object.keys(window.cb.curses).length >= 5) {bracket = GreaterCurses;}
	
	let cr = randomChoice(bracket);
	if(!window.cb.addCurse(cr)) {
		ApplyRandomCurse();
	} else {
		window.messages.warning("You have been afflicted with the Curse of " + cr.name);
	}
}
window.curse = ApplyRandomCurse;
window.last = removeLastCurse;






//BLESSINGS -------------------------------------------------------------------------------
export class Soulstone extends Curse {
	constructor() {
		super(
			
			"Soulstone",
			"Revive on death with 25% health and suffer a random curse.",
			"items/soulstone.png",
			{
				Apply : function (target) {
					target.addEvent("death", function () {
						if(target.notReviving && target.hasBehaviour(Soulstone)) {
							target.notReviving = false;
							removeBlessing(Soulstone);
							setTimeout(function () {
								if(SpellEffects.Revive()) {
									target.HP = target.MAX_HP/4;
									ApplyRandomCurse();
									target.notReviving = true;
								}
							}, 1000);
							
						}
					});
				}
			}
		);
	}
}


export class Power extends Curse {
	constructor() {
		super(
			
			"Power Core",
			"Your mana regenerates faster the less of it you have.",
			"curses/energy_orb.png",
			{
				Apply : function (target) {
					target.addEvent("updated", function () {
						if(target.hasBehaviour(Power)) {
							target.restoreMana(target.MANA_REGEN * (1 - target.MANA/target.MAX_MANA));
						}
					});
				}
			}
		);
	}
}

export class Redemption extends Curse {
	constructor() {
		super(
			
			"Redemption",
			"Curse inflicting effects have a chance to apply a blessing instead.",
			"curses/redemption.png",
			{}
		);
	}
}

export class Dawn extends Curse {
	constructor() {
		super(
			
			"Dawn",
			"Monsters in your presence grow weaker with time.",
			"curses/dawn.png",
			{
				Period : SEC,
				Periodic : Effects.AreaOfEffect(window.p, 100, function (target) {
					target.damage_multiplier *= 0.99;
				}, ["Hostile"])
			}
		);
	}
}

export class Purification extends Curse {
	constructor() {
		super(
			
			"Purification",
			"Dead monsters explode dealing damage proportionate to their maximum health to the enemies nearby.",
			"curses/smite.png",
			{}
		);
	}
}

export class Protection extends Curse {
	constructor() {
		super(
			
			"Protection",
			"Chance to reflect damage back to the enemy.",
			"curses/reflect.png",
			{}
		);
	}
}

export class Hope extends Curse {
	constructor() {
		super(
			
			"Hope",
			"Increase your maximum health by 10% at the start of each level.",
			"curses/hope.png",
			{}
		);
	}
}


export class Reincarnation extends Curse {
	constructor() {
		super(
			
			"Reincarnation",
			"Revive on death with full health and lose one of your mana orbs.",
			"curses/circle.png",
			{
				Apply : function (target) {
					target.addEvent("death", function () {
						if(target.notReviving && target.hasBehaviour(Reincarnation)) {
							target.notReviving = false;
							removeBlessing(Reincarnation);
							setTimeout(function () {
								if(SpellEffects.Revive()) {
									target.HP = target.MAX_HP;
									target.MAX_MANA -= 1;
									target.MANA = target.MAX_MANA;
									target.notReviving = true;
								}
							}, 1000);
							
						}
					});
				}
			}
		);
	}
}

export class Retribution extends Curse {
	constructor() {
		super(
			
			"Retribution",
			"Killing monsters temporarly increases your damage.",
			"curses/holy_sword.png",
			{}
		);
	}
}


export class Harvest extends Curse {
	constructor() {
		super(
			
			"Dark Harvest",
			"Killing monsters restores health proportionate to that of your victim.",
			"curses/traces.png",
			{}
		);
	}
}

export class Purity extends Curse {
	constructor() {
		super(
			
			"Purity",
			"Remove a curse at the end of each level.",
			"curses/pointing.png",
			{}
		);
	}
}

export class Fortitude extends Curse {
	constructor() {
		super(
			
			"Fortitude",
			"Periodically gain a barrier nullifying damage of your next received hit.",
			"curses/barrier.png",
			{
				Period : 5 * SEC,
				Periodic : function (target) {
					target.barrier = true;
				}
				
			}
		);
	}
}

// Blessing Mechanics --------------------------------------------
export const GenericBlessings = [Power, Redemption, Dawn, Retribution,
						  Protection, Hope, Reincarnation, Purification,
						  Harvest, Purity, Fortitude];



export function ApplyRandomBlessing() {
	let bracket = GenericBlessings;
	
	let cr = randomChoice(bracket);
	if(!window.cb.addBlessing(cr)) {
		ApplyRandomBlessing();
	} else {
		window.messages.message("You gain the Blessing of " + cr.name);
	}
}
window.bless = ApplyRandomBlessing;







