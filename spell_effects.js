/*jshint esnext: true */
/*jslint browser: true */

import * as Models from "./models.js";
import {Soulshatter} from  "./curses.js";
import {Behaviour, SEC, Effects, Unit, Missile, asum, amult} from "./engine.js";


//Revive
export function Revive() {
	if(window.p.hasBehaviour(Soulshatter)) {return false;}
	window.p.properties.isDestructible = false;
	window.p.properties.isDead = false;
	window.p.HP = 1;
	window.Screen.c.style.filter = "grayscale(0%)";
	window.p.actor.replace_model(Models.mage);
	setTimeout(function () {
		window.p.properties.isDestructible = true;
	}, 3000);
	return true;
}

//Radius unit spawn
export function Ambush(source, radius, count, unit) {
	for(let i = 0; i < count; i++) {
		Effects.RandomPointInRadius(source, radius, 
								   Effects.CreateUnit(source, unit),
								   radius/2)(source);
	}
}

//Purification
export class RetributionStack extends Behaviour {
	constructor(host) {
		super(host, {
			"Apply" : Effects.Modify(host, "damage_modifier", 0.05, "Add"),
			
			"Duration" : 10 * SEC,
			
			"Remove" : Effects.Modify(host, "damage_modifier", 0.05, "Sub")
		});
	}
}

//Health Increase +10
export class MaxHeathIncreased extends Behaviour {
	constructor(host) {
		super(host, {
			"Apply" : Effects.Set(host, [
				Effects.Modify(host, "MAX_HP", 10, "Add"),
				Effects.Modify(host, "HP", 10, "Add")]),
			
			"Duration" : 0,
			"Remove" : Effects.Modify(host, "MAX_HP", 10, "Sub")
		});
	}
}

//Ignite
export class Ignite extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 10,
			"Periodic" : Effects.Damage(source, 1),
			"Duration" : 100
		}, Models.flame);
		this.offset_to_host([-2, -5]);
		this.scale_to_host(0.8);
	}
}

//Poison
export class Poison extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 10,
			"Periodic" : function (target) {
				Effects.Damage(source, host.HP * 0.01)(target);
			},
			"Duration" : 300
		}, Models.poison);
		this.offset_to_host([-2, -5]);
		this.scale_to_host(1.0);
	}
}

//Disease
export class Disease extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 10,
			"Periodic" : Effects.Damage(source, 0.1),
			"Duration" : 1000,
			"Apply" : function () {
				host.damage_reduction -= 0.1;
			},
			"Remove" : function () {
				host.damage_reduction += 0.1;
			}
		}, Models.disease);
		this.offset_to_host([5, -10]);
		this.scale_to_host(1.2);
	}
}

//Health Potion
export class HealthPotionBuff extends Behaviour {
	constructor(host, source = host) {
		let health = (host.MAX_HP - host.HP) / 2;
		super(host, {
			"Period" : 1,
			"Periodic" : Effects.Damage(source, -health/40),
			"Duration" : 40
		}, Models.heal);
		this.offset_to_host([-2, 20]);
		this.scale_to_host(1.5);
	}
}

//Mana Potion
export class ManaPotionBuff extends Behaviour {
	constructor(host) {
		super(host, {
			"Period" : 1,
			"Periodic" : function () {host.MANA += 0.1;},
			"Duration" : 200
		}, Models.mana_potion);
		this.offset_to_host([-2, 25]);
		this.actor.speed = 0.5;
		this.scale_to_host(1.1);
	}
}


//Flame Blast
class FlameBlastDummy extends Unit {
	constructor(x, y) {
		super(x, y, 0, Models.flame_blast);
		this.properties.isDestructible = false;
		this.actor.offset = [0, 150];
		this.actor.scale = 1.5;
		this.type = "Dummy";
		this.kill();
	}
}

export const FlameBlast = function (source, point) {
	Effects.AreaOfEffect(source, 100, Effects.ApplyBehaviour(source, Ignite), ["Hostile", "Neutral", "Friendly"], ["Event", "Dummy"])(point);
	
	Effects.CreateUnit(source, FlameBlastDummy)(point);
};

//Purification
class PurificationDummy extends FlameBlastDummy {
	constructor(x, y) {
		super(x, y);
		this.actor.offset = [0, 25];
		this.actor.scale = 0.25;
		this.actor.color = "#ffae36";
		this.actor.speed = 4;
	}
}

export const PurificationBlast = function (source, unit) {
	Effects.AreaOfEffect(source, 10, Effects.Damage(source, unit.MAX_HP/10),
						 ["Hostile"], ["Event", "Dummy", "Missile"])(unit.pos);
	
	Effects.CreateUnit(source, PurificationDummy)(unit.pos);
};

window.blast = function () {
	PurificationBlast(window.p, window.p);
};


//Dark Regeneration
export class DarkRegenerationBuff extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 1,
			"Periodic" : Effects.Damage(source, -host.MAX_HP/40),
			"Duration" : 40
		}, Models.heal);
		this.offset_to_host([-2, 20]);
		this.scale_to_host(1.5);
		this.actor.color = "purple";
	}
}

//Soulgem
export class SoulgemBuff extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 10,
			"Periodic" : function (target) {
				Effects.Damage(source, 1)(target);
				Effects.Damage(source, -0.25)(source);
			},
			"Duration" : 50
		}, Models.flame);
		this.offset_to_host([-2, -5]);
		this.scale_to_host(0.8);
		this.actor.color = "rgb(94, 0, 138)";
	}
}

//Deadly Cloud
class DeadlyCloudBehv extends Behaviour {
	constructor(host, source = host) {
		super(host, {
			"Period" : 1,
			
			"Periodic" : Effects.AreaOfEffect(source, 40, function (target) {
				let ok = true;
				for(let b of target.behaviours) {
					if(b instanceof Poison) {ok = false;}
				}
				
				if(ok) {Effects.ApplyBehaviour(source, Poison)(target);}	
			}, ["Hostile", "Friendly", "Neutral"], ["Event", "Dummy", "Missile"]),
											  
			"Duration" : 300,
			
			"Remove" : function () {host.kill();}
		}, Models.poison);
		
		this.actor.frameNum = 33;
		this.actor.speed = 1;
		this.actor.color = "yellow";
		this.offset_to_host([0, -20]);
		this.scale_to_host(1.1);
		//this.scale_to_host(10.0);
	}
}


class DeadlyCloudDummy extends Unit {
	constructor(x, y) {
		super(x, y, 0, Models.poison);
		this.properties.isDestructible = false;
		this.actor.offset = [0, 200];
		this.actor.scale = 1.5;
		this.actor.speed = 0.5;
		this.type = "Dummy";
		Effects.ApplyBehaviour(this, DeadlyCloudBehv)(this);
	}
}

export const DeadlyCloud = function (source, point) {
	Effects.CreateUnit(source, DeadlyCloudDummy)(point);
};


//Generic Missile
export class GenericMissile extends Missile {
	constructor(source, point, destination, collision_radius, impact_effect, model = Models.arrow) {
		super(point, model);
		this.source = source;
		this.speed = 2;
		this.move_to(asum(destination, amult([destination[0] - point[0], destination[1] - point[1]], 100)));
		this.inSight = true;
		
		let self = this;
		this.addEvent("updated", function () {
			
			
			if(!self.inSight) {
				self.remove();
				return;
			}
			
			
			
			Effects.AreaOfEffect(self.source, collision_radius,
								 Effects.Dummy(self.source, function () {self.kill();}),
								 ["Hostile"])(self);
			
			
			if(self.moveQueue.length === 0) {
				self.kill();
			}
		});
		this.addEvent("death", function () {
			impact_effect(self);
		});
	}
}



