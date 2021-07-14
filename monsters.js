/*jshint esnext: true */
/*jslint browser: true */

import * as Models from "./models.js";
import * as SpellEffects from "./spell_effects.js";
import * as Curse from "./curses.js";
import {Behaviour, Effects, Time, Unit, camera, dist, rand, chance, angle} from "./engine.js";





export class Weapon {
	constructor(range, cooldown, effect, animation = "Attack", angle = Math.PI/2) {
		
		Object.assign(this, {
			range : range,
			cooldown : cooldown,
			effect : effect,
			max_cooldown : cooldown,
			off : false,
			beginTime : 0,
			finishTime : 0,
			attackAngle : angle,
			attackAnimation : animation,
			inRange : false
		});	
	}
}

export class Firing extends Behaviour {
	constructor(host) {
		
		let beginTime = host.weapon.beginTime,
			finishTime = host.weapon.finishTime;
		
		super(host, {
		 	Apply : function () {
				let target = camera.pos;
				host.properties.isMovable = false;
				host.face_camera();
				host.moveQueue = [];
				host.actor.set(host.weapon.attackAnimation, 2);
				host.weapon.cooldown = host.weapon.max_cooldown;
				host.weapon.off = true;
				
				Time.after(beginTime, function () {

					host.weapon.effect(target);
					
				}, host);
				
			},
			
			Period : 1,
			Periodic : function () {
				host.addAction(function () {
					host.actor.set(host.weapon.attackAnimaton, 2);
				}, 3);
			},
				
			
			Duration : beginTime + finishTime,
			Remove : function () {
				host.weapon.off = false;
				host.properties.isMovable = true;
				host.actor.aimation_priority = 0;
				host.actor.set("Idle", 0);
			}
		});
	}	
}

export class Agression extends Behaviour {
	constructor(host) {
		super(host, {
			Period : 30,
			Periodic : function () {
				let range = host.agression_range;
				if(window.p.hasBehaviour(Curse.Hunt)) {range *= 2;}
				if(dist(host.pos, camera.pos) < range && !host.weapon.inRange) {
					host.move_to(camera.pos);
				}
			}
		});
	}
}



//Wondering behaviour
export class Wondering extends Behaviour {
	constructor(host) {
		
		let dst = 20;
		if(host.wonder_dst) {
			dst = host.wonder_dst;
		}
		
		super(host, {
			Period : rand(50,150),
			Periodic : function () {
				if(host.properties.isDead || (host.weapon && host.weapon.inRange)) {return;}
				if(host.inSight && !host.properties.isMoving) {
					host.move_to([host.pos[0] + rand(-dst, dst), host.pos[1] + rand(-dst, dst)]);
				}
			}
		});
	}
}


function WonderAround(unit, dist) {
	unit.wonder_dist = dist;
	Effects.ApplyBehaviour(unit, Wondering)(unit);
}


export class Monster extends Unit {
	constructor(x, y, radius, model, aggression_range = 50) {
		super(x, y, radius, model);
		this.owner = 2;
		this.agression_range = aggression_range;
		this.actor.setShadow(1.0, [0,0]);
		this.speed = 1;
		this.type = "Monster";
		let self = this;
		
		this.addEvent("death", function () {
			if(window.p.hasBehaviour(Curse.Harvest)) {
				Effects.Damage(self, -self.MAX_HP * 1)(window.p);
			}
			
			if(window.p.hasBehaviour(Curse.Purification)) {
				Effects.ApplyBehaviour(window.p, SpellEffects.RetributionStack)(window.p);
			}
			
			if(window.p.hasBehaviour(Curse.Soulbinding)) {
				Effects.Damage(self, window.p.HP * 0.01)(window.p);
			}
			
			if(window.p.hasBehaviour(Curse.Thirst)) {
				window.p.thirst = 0;
			}
			
			if(window.p.hasBehaviour(Curse.Purification)) {
				SpellEffects.PurificationBlast(window.p, self);
			}
		});

		
	}
	
	setWeapon(weapon, beginTime = 20, finishTime = 10) {
		
		let isFirst = true;
		if(this.weapon) {
			isFirst = false;
		}

		//Set weapon
		this.weapon = weapon;
		this.weapon.beginTime = beginTime;
		this.weapon.finishTime = finishTime;
		
		
		if(isFirst) {
			//Agression
			let self = this;
			this.addEvent("damaged", function () {
				if(!self.properties.isMoving) {
					self.move_to(self.last_attacker.pos);
				}
			});

			Effects.ApplyBehaviour(self, Agression)(self);

			//Weapon Mechanics
			this.addEvent("updated", function () {
				if(self.weapon.cooldown > 0) {
					self.weapon.cooldown -= 1;
				}

				if(!self.weapon.off &&
				   self.inSight &&
				   self.weapon.cooldown === 0 &&
				   dist(self.pos, camera.pos) <= self.weapon.range &&
				   Math.abs(angle(self.pos, camera.pos)) <= self.weapon.attackAngle) {
					self.weapon.inRange = true;
					Effects.ApplyBehaviour(self, Firing)(self);
				} else {
					self.weapon.inRange = false;
				}
			});
		}
		
	}
	
	face_camera() { 
		if(camera.pos[0] < this.pos[0]) {
			this.actor.facing = "left";
		} else {
			this.actor.facing = "right";
		}
	}
}



//Generic Weapons
export class MeleeAttack extends Weapon {
	constructor(host, range, damage) {
		super(range, 30,
		  Effects.AreaOfEffect(host, 10, 
							  Effects.Damage(host, damage), ["Hostile"],
							  ["Missile"]));		
	}
}

export class MissileAttack extends Weapon {
	constructor(host, range, missile) {

		super(range, 20, Effects.Dummy(host, function (target) {
			
			let lpoint = host.pos;
			if(host.actor.launch_offsets[0]) {
				lpoint = host.lpoint(0);
			}
			
			
			Effects.LaunchMissile(host, lpoint, missile)(target);
		}));
		
		
	}
}














//!Generic Units ------------------------------------------------------------


//Portal
class PortalOpening extends Behaviour {
	constructor(host) {
		super(host, {
			Period : 1,
			Periodic : function () {
				host.actor.scale += 0.03;
			},
			Duration : 10
		});
	}
}

class PortalClosing extends Behaviour {
	constructor(host) {
		super(host, {
			Period : 1,
			Periodic : function () {
				host.actor.scale -= 0.03;
			},
			Duration : 5,
			Remove : function () {
				host.kill();
			}
		});
	}
}

export class Portal extends Unit {
	constructor(x, y) {
		super(x, y, 0, Models.portal);
		this.properties.isDestructible = false;
		this.actor.scale = 0;
		this.actor.setShadow(1.0, [0,0]);	
		this.open();
	}
	
	open() {
		this.behaviours.push(new PortalOpening(this));
	}
	close() {
		this.behaviours.push(new PortalClosing(this));
	}
}


//SLIMES
export class Slime extends Monster {
	constructor(x, y, type="blue") {
		let self;
		switch(type) {
			//Red slimes grow weaker the more wounded they become
			case "red":
				super(x, y, 4, Models.redSlime);
				this.actor.scale = 3;
				this.damage_modifier += 1;
				this.MAX_HP = this.HP = 15;
				this.actor.setShadow(0.6, [0,0]);
				this.addResistance("Ignite", 2);
				
				self = this;
				this.addEvent("damaged", function () {
					let ratio = (self.MAX_HP - self.HP) / self.MAX_HP;
					self.actor.scale = 3 - ratio;
					self.damage_modifier -= 0.1;
					self.actor.setShadow(0.6 - 0.2*ratio, [0,0]);
				});
				
				break;
			//Green slimes have a chance to split into 2 on death
			case "green":
				super(x, y, 2, Models.greenSlime);
				this.actor.scale = 1.5;
				this.MAX_HP = this.HP = 5;
				this.actor.setShadow(0.3, [0,0]);
				
				self = this;
				this.addEvent("death", function () {
					Time.after(10, function () {
						if(chance(0.25)) {
							new Slime(self.pos[0], self.pos[1]+5, "green");
							new Slime(self.pos[0], self.pos[1]-5, "green");
						}
					});

				});
				break;
			
			//Blue slimes are boring and unintersting...
			default:
				super(x, y, 3, Models.blueSlime);
				this.actor.scale = 2.2;
				this.MAX_HP = this.HP = 10;
				this.actor.setShadow(0.5, [0,0]);
				
		}
				
		this.actor.speed = 0.5;
		
		
		
		this.setWeapon(new MeleeAttack(this, 15, 10));
		WonderAround(this, 50);
	}
}



//SKELETON ARCHERS

//Arrow
class Arrow extends SpellEffects.GenericMissile {
	constructor(source, point, destination) {
		super(source, point, destination, 5, 
			 Effects.AreaOfEffect(source, 10,
								Effects.ApplyBehaviour(source, SpellEffects.Ignite), ["Hostile"]));
		
	}
}


export class SkeletonArcher extends Monster {
	constructor(x, y /*, type="white"*/) {

		super(x, y, 3, Models.whiteArcher, 75);
		
		this.actor.speed = 0.2;
		this.actor.scale = 1.8;
		this.actor.launch_offsets.push([-5, -5]);
		this.actor.offset = [0, 20];
		this.actor.setShadow(1, [0,0]);
		
		this.MAX_HP = this.HP = 15;
		
		this.setWeapon(new MissileAttack(this, 40, Arrow), 4, 10);
		this.weapon.attackAngle = Math.PI/4;
		WonderAround(this, 30);
	}
}


