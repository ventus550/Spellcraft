/*jshint esnext: true */
/*jslint browser: true */

import * as Models from "./models.js";
import {SEC, Time, Effects, Unit, Missile, rand, sq, fix_pos, angle, asum, dist} from "./engine.js";
import {SPELL} from "./spellcrafting.js";
import * as SpellEffects from "./spell_effects.js";

function SizeFormula(power) {
	return Math.pow(power, 0.2);
}

class BlastDummy extends Unit {
	constructor(target, model = Models.flame_blast) {
		target = fix_pos(target);
		super(target[0], target[1], 0, model);
		this.properties.isDestructible = false;
		this.actor.offset = [0, 50];
		this.actor.scale = 0.5;
		this.type = "Dummy";
		this.kill();
	}
}

//Flamebolt
class SpellMissile extends Missile {
	constructor(obj = {
		source : window.p,
		destination : window.mouse.pos(),
		model : Models.flamebolt,
		power : 1
	}) {
		if(obj.source.pos) {obj.source = obj.source.lpoint(0);} //<<-- lpoints
		obj.source = fix_pos(obj.source);
		
		
		super(obj.source, obj.model);
		this.owner = 1;
		this.source = obj.source;
		this.speed = 2 * 1/SizeFormula(SizeFormula(obj.power));
		this.actor.scale *= SizeFormula(obj.power);
		this.move_to(obj.destination);
		
		const self = this;
		this.addEvent("updated", function () {
			if(self.moveQueue.length === 0) {
				self.kill();
			}
		});
		this.addEvent("death", function () {
			self.actor.replace_model(Models.explosion_fire);
			self.actor.set("Death");

			Effects.AreaOfEffect(self.source, 10,
								Effects.ApplyBehaviour(self.source, SpellEffects.Ignite), ["Hostile"])(self);
		});
	}
}


export class Spell {
	constructor(source, target, mana, max_mana, power, deg, prevType = null) {
		this.source = source;
		this.target = target;
		this.mana = mana;
		this.max_mana = max_mana;
		this.power = power;
		this.deg = deg;
		this.model = undefined;
		this.color = undefined;
		
		const sp = SPELL[mana],
			  rad = 50 * power,  //<<-- do przemyslenia
			  self = this;
		
		
		
		//Choose Target-----------------------------------------------------
		switch(sp.Target) {
				
			case "Regular":
				this.target = asum(this.target, [20 * Math.cos(deg), 20 * Math.sin(deg)]);
				break;
				
			case "Random":
				let point;
				do {
					point = [this.target[0] + rand(-rad, rad), this.target[1] + rand(-rad, rad)];
				} while(sq(point[0] - target[0]) + sq(point[1] - target[1]) > sq(rad));
				this.target = point;
				
				break;
				
			default:
				console.log("Failed to match Effect");
				break;
		}
		if(mana === 0) {this.target = target;}
		this.deg = angle(this.target, this.source);
		if(this.source[0] - this.target[0] >= 0) {this.deg += Math.PI;} 
		
		
		
		//Choose Model-----------------------------------------------------
		switch(sp.Effect) {
				
			case "Area":
				switch(sp.Enchant) {
					case "Fire":
						this.model = Models.flame_blast;
						break;
					default:
						console.log("Failed to match Enchant");
						break;
				}
				break;
				
			case "Missiles":
				switch(sp.Enchant) {
					case "Fire":
						this.model = Models.flamebolt;
						break;
					default:
						console.log("Failed to match Enchant");
						break;
				}
				break;
				
				
			default:
				console.log("Failed to match Effect");
				break;
		}
		
		//Choose Effect-----------------------------------------------------
		switch(sp.Effect) {
			case "Area":
				const radius = 20 * SizeFormula(this.power);
				function areaBlast(power, r) {
					const dummy = new BlastDummy(self.target, self.model),
						  coeff = r/radius;
					
					dummy.actor.scale *= SizeFormula(power) * coeff;
					dummy.actor.offset[1] *= SizeFormula(power) * coeff;
					Effects.AreaOfEffect(window.p, r, Effects.Damage(window.p, 10 * power),
										["Hostile"], ["Missile", "Dummy", "Event"]);


					Time.after(SEC, function () {
						self.next(dummy.pos, dummy.pos, self.deg, power);
					});
				}
				
				switch(sp.Amplifier) {
					case "Low":
						areaBlast(this.power, radius);
						break;
						
					case "Medium":
						areaBlast(this.power * 0.85, radius * 1.25);
						break;
						
					case "High":
						areaBlast(this.power * 0.7, radius * 1.5);
						break;
				}
				
				break;
				
			case "Missiles":
				function launchMissile(power, degrees) {
					const d = dist(self.source, self.target);
					
					const miss = new SpellMissile({
						source : self.source,
						destination : asum(self.source, [d * Math.cos(degrees), d * Math.sin(degrees)]),
						power : power,
						model : self.model
					});
					
					miss.addEvent("death", function () {
						self.next(miss.pos, miss.pos, degrees, power);
					});
				}
				
				switch(sp.Amplifier) {
					case "Low":
						launchMissile(this.power, this.deg);
						break;
						
					case "Medium":
						launchMissile(this.power/2, this.deg + Math.PI/8);
						launchMissile(this.power/2, this.deg - Math.PI/8);
						break;
						
					case "High":
						launchMissile(this.power/3, this.deg + Math.PI/6);
						launchMissile(this.power/3, this.deg - Math.PI/6);
						launchMissile(this.power/3, this.deg);
						break;
				}
				
				
				
				
				
				break;
			
			default:
				console.log("Failed to match Effect");
				break;
		}
	}
	
	next(src = this.target, tg = this.target, deg = this.deg, power = this.power) {
		if(this.mana < this.max_mana) {
			new Spell(src, tg, this.mana+1, this.max_mana, power, deg);
		}
	}
	
	
	
	
	
}









export function SPELLCAST(mana) {
	let source_point = window.p.lpoint(0),
		dst_point = window.mouse.pos(),
		deg = angle(dst_point, source_point);
	if(source_point[0] - dst_point[0] >= 0) {deg += Math.PI;} 
	
	
	
	new Spell(source_point, dst_point, 0, mana-1, 1, deg);
}


