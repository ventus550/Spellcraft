/*jshint esnext: true */
/*jslint browser: true */

import {Screen, Unit, Time, camera, MAP_SIZE, OBJECTS, UNIT_ARRAY, for_radius, rand, asum, chance} from "./engine.js";

import {tombstone} from "./models.js";

import * as Curse from "./curses.js";

import {SPELLCAST} from "./spells.js";

//Player
export class Player extends Unit {
	constructor(x, y, radius, model) {
		super(x, y, radius, model);
		
		this.speed = 1;
		this.owner = 1;
		this.HP = 100;
		this.MAX_HP = 100;
		this.MANA = 5;
		this.MAX_MANA = 5;
		this.MANA_REGEN = 0.01;
		this.properties.ignoreCollision = false;
		this.thirst = 0;
		this.level = 1;

		this.actor.offset = [0, 30];
		this.actor.setShadow(1, [0,0]);
		this.actor.set("Idle");
		this.actor.speed = 0.5;
		this.actor.launch_offsets.push([0, -8]);
		this.edge = false;
		this.barrier = false;
		this.notReviving = true;
		
		this.properties.isIncapacitated = false;
		this.properties.isKillable = false;
		
		let self = this;
		this.addEvent("updated", function () {
			self.player_move(Screen.registered_keys);
			self.restoreMana(self.MANA_REGEN);
			
			let min_dist = Math.min(
				self.pos[0], self.pos[1],
				MAP_SIZE - self.pos[0],
				MAP_SIZE - self.pos[1]
			);
			
			if(min_dist < MAP_SIZE/10) {
				self.edge = true;
				Screen.setShadows(1000 * (min_dist / (MAP_SIZE / 10)));
			}
		});
		
		
		this.addEvent("death", function () {
			self.actor.replace_model(tombstone);
			self.properties.isDead = true;
			Screen.c.style.filter = "grayscale(100%)";
			window.messages.warning("You have been slain");
		});
		
		this.cast = {
			isCasting : false,
			charge_costs : [6, 14, 20, 38],
			charge_power : 0,
			charge_level : 0,
			effects : [               //<<-- podmienić kryterium max charge'a
				undefined,
				undefined,
				undefined,
				undefined
			]
		};
	
		camera.attach(this);
		
		Screen.c.addEventListener("mousedown", function () {
			self.cast_begin();
		});
		
		Screen.c.addEventListener("mouseup", function () {
			self.cast.isCasting = false;
		});
	
		
	}
	damage(dmg, source = this) {
		
		if(this.barrier && dmg > 0) {
			this.barrier = false;
			return 0;
		}
		
		
		if(source != this && chance(0.1) && this.hasBehaviour(Curse.Protection)) {
			source.damage(dmg, this);
			return 0;
		}
		
		if(dmg < 0) {
			if(this.hasBehaviour(Curse.Hemophilia)) {
				return 0;
			}
			
			
			this.HP -= dmg;
			if(this.HP > this.MAX_HP) {
				this.HP = this.MAX_HP;
			}
			return dmg;
		}
		
		
		
		
		this.last_attacker = source;
		this.handle_event("damaged");
		if(this.damage_reduction > 1) {this.damage_reduction = 1;}
		let true_damage = dmg * (1-this.damage_reduction);
		if(this.properties.isDestructible) {this.HP -= true_damage;}
		if(this.HP <= 0) {
			this.kill();
		}
		return true_damage;
	}
	
	remove() {
		UNIT_ARRAY.splice(UNIT_ARRAY.indexOf(this), 1);
		OBJECTS.splice(OBJECTS.indexOf(this), 1);

		this.map_clear();
		for_radius([Math.floor(this.pos[0]), Math.floor(this.pos[1])], this.radius, function (i, j) {try {window.MAP[i][j][0] -= 1;} catch(err) {}});
	}
	
	restoreMana(value) {
		if(this.MANA + value > this.MAX_MANA) {
			this.MANA = this.MAX_MANA;
		} else {
			this.MANA += value;
		}
	}
	
	player_move(input) {  //<--- do poprawy
		let unit = this;
		if(this.properties.isIncapacitated) {return false;}
		
		if (input[37] || input[65]) {unit.addAction(unit.move("left"));}
		if (input[38] || input[87]) {unit.addAction(unit.move("up"), 1);}
		if (input[39] || input[68]) {unit.addAction(unit.move("right"));}
		if (input[40] || input[83]) {unit.addAction(unit.move("down"), 1);}
	}
	
	face_mouse() { 
		if(window.mouse.pos()[0] < this.pos[0]) {
			this.actor.facing = "left";
		} else {
			this.actor.facing = "right";
		}
	}
	
	cast_begin() {
		if(this.properties.isIncapacitated) {return false;}
		
		let self = this;
		if(Math.floor(this.MANA) === 0) {return false;}
		this.actor.speed = 2;
		this.properties.isMovable = false;
		this.cast.isCasting = true;
		
		Time.periodic(1, function () {
			if(self.properties.isIncapacitated) {
				Time.killTimers("player_cast");
				return false;
			}
			self.addAction(function () {
				self.actor.set("Cast", 3);
				self.cast.charge_power += 1;
				
				
				if(!self.cast.isCasting && self.cast.charge_level >= 1) {
					self.cast_finish();
					return true;
				}
				
				//If charge level achived:
				if(self.cast.charge_costs.includes(self.cast.charge_power)) {
					self.cast.charge_level = self.cast.charge_costs.indexOf(self.cast.charge_power) + 1;
					self.MANA -= 1;
					if(self.MANA < self.MAX_MANA/2 && self.hasBehaviour(Curse.Corruption)) {
						self.HP -= self.HP * 0.1;
					}
					if(Math.floor(self.MANA) === 0 || self.cast.charge_level + 1 > self.cast.charge_costs.length) {
						self.cast_finish();
						return false;
					}
				}
				
				self.face_mouse();
				
			}, 10);
		}, "player_cast");
	}
	
	cast_effect() {
		try {
			let pos = window.mouse.pos();
			if(this.hasBehaviour(Curse.Madness) && chance(0.1)) {
				pos = asum(pos, [rand(-50, 50), rand(-50, 50)]);
			}
			
			SPELLCAST(this.cast.charge_level);
			//this.cast.effects[this.cast.charge_level - 1](pos);
		}catch(err) {console.log("Missing cast effect", err);}
	}
	cast_finish() {
		Time.killTimers("player_cast");
		this.face_mouse();
		this.cast_effect();
		this.properties.isMovable = true;
		this.actor.speed = 0.5;
		
		this.cast.charge_power = 0;
		this.cast.charge_level = 0;
	}
	
	hasBehaviour(behClass) {
		let yes = false;
		for(let b of this.behaviours) {
			if(b instanceof behClass) {
				yes = true;
			}
		}
		
		return yes;
	}
}