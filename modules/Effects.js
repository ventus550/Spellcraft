/*jshint esnext: true */
/*jslint browser: true */

import {Time} from "./Time.js";
import {for_radius, relationship, dist, fix_pos, rand, sq} from "./Functions.js";
import {MAP} from "./Map.js";
import {Actor} from "./Models.js";


export const Effects = {
	//Return a function modifying target unit's property (operations = {"Set", "Add", "Sub", "Multiply", "Divide"})
	"Modify" : function (source, property, value = 0, operation = "Set") {
		
		return function (target) {
			try {
				switch(operation) {
					case "Set":
						target[property] = value;
						break;
					case "Add":
						target[property] += value;
						break;
					case "Sub":
						target[property] -= value;
						break;
					case "Multiply":
						target[property] *= value;
						break;
					case "Divide":
						target[property] /= value;
						break;
				}
				
				return source;
			} catch(err) {}
		};
		
	},
	
	//Return a function dealing damage to the target unit
	"Damage" : function (source, value = 0) {
		
		return function (target) {
			target.damage(value * source.damage_modifier, source);
			return source;
		};
	},
	
	//Return function applying Behaviour class  object to the target unit
	"ApplyBehaviour" : function(source, behaviour, chance = 1.0) {
		
		return function (target) {
			
			if(target.behaviours.length === 0) { //<<-- raczej obsolete
				target.addEvent("removed", function () {
					for(let b of target.behaviours) {
						b.remove();
					}
				});
			}
			
			
			if(rand(0, 100) <= Math.floor(chance * 100)) {
				let res = target.resistances[behaviour.name];
				if(res) {
					res[0] += 1;
					if(res[0] >= res[1]) {
						res[0] = 0;
						target.behaviours.push(new behaviour(target, source));
					}
				} else {
					target.behaviours.push(new behaviour(target, source));
				}
			}
			
			
			return source;
		};
		
	},
	
	//Return function calling other effect functions
	"Set" : function (source, effects_array = []) {
		return function (target) {
			for(let e of effects_array) {e(target);}
			return source;
		};
		
	},
	
	//Return function applying effect function to all units in the target area
	"AreaOfEffect" : function (source, radius, effect, relation = ["Hostile", "Friendly", "Neutral"], excluded_types = ["Missile"]) {
		
		return function (target) {
			if(target.hasOwnProperty("pos")) {
				target = fix_pos(target.pos);
			}

			for_radius(target, radius, function (x, y) {
				for(let unit of MAP[x][y][1]){
					if(relation.includes(relationship(source, unit)) && !unit.properties.isDead && !excluded_types.includes(unit.type)) {
						effect(unit);
					}
				}
			});
			return source;
		};
	},
	
	"CreateUnit" : function(source, unit) {
		
		return function (target) {
			if(target.hasOwnProperty("pos")) {
				target = [Math.floor(target.pos[0]), Math.floor(target.pos[1])];
			}

			let u = new unit(target[0], target[1]);
			if(source.hasOwnProperty("owner")) {
				u.owner = source.owner;
			}
			
			return source;
		};
	},
	
	"LaunchMissile" : function (source, point, missile) {
		
		if(point.hasOwnProperty("pos")) {
			point = fix_pos(point.pos);
		} else {
			point = fix_pos(point);
		}
		
		
		return function (target) {
			if(target.hasOwnProperty("pos")) {
				target = fix_pos(target.pos);
			} else {
				target = fix_pos(target);
			}
			
			let owner = 0;
			if(source.hasOwnProperty("owner")) {
				owner = source.owner;
			}

			let u = new missile(source, point, target);
			u.owner = owner;
			return source;
		};
	},
	
	"RandomPointInRadius" : function (source, radius, effect, inner_radius = 0) { //<<-- inner_raidus missing
		
		return function (target) {
			if(inner_radius >= radius) {return source;}
			
			
			if(target.hasOwnProperty("pos")) {
				target = fix_pos(target.pos);
			} else {
				target = fix_pos(target);
			}
			
			let point;
			do {
				point = [target[0] + rand(-radius, radius), target[1] + rand(-radius, radius)];
			} while(sq(point[0] - target[0]) + sq(point[1] - target[1]) > sq(radius) ||
				   	dist(point, target) < inner_radius);
			
			effect(point);
			
			return source;
		};
	},
	
	"ClosestUnitToPoint" : function (source, radius, relation, effect, excluded_types = ["Missile"]) {
		
		return function (target) {
			if(target.hasOwnProperty("pos")) {
				target = fix_pos(target.pos);
			} else {
				target = fix_pos(target);
			}
			
			let BEST_UNIT = [radius, undefined];
			for_radius(target, radius, function (x, y) {

				for(let unit of MAP[x][y][1]){
					if(relation.includes(relationship(source, unit)) &&
					   !unit.properties.isDead &&
					   !excluded_types.includes(unit.type) &&
					  	dist(unit.pos, target) < BEST_UNIT[0])
						
					{
						BEST_UNIT = [dist(unit.pos, target), unit];
					}
				}
			});
			if(BEST_UNIT[1]) {
				effect(BEST_UNIT[1]);
			}
			
			return source;
		};
	},
	
	//Return a dummy function
	"Dummy" : function(source, func) {
		return function (target) {
			if(func) {
				func(target);
			}
			return source;
		};
	}
	
}; 

export class Behaviour {
	
	constructor(host, obj, model) {
		this.host = host;
		this.requesting_update = false;
		this.removed = false;
		this.stacks = 1;
		this.effects = {
			"Apply" : Effects.Dummy(host),
			"Period" : 0,
			"Duration" : 0,
			"Periodic" : Effects.Dummy(host),
			"Remove" : Effects.Dummy(host)
		};
		
		this.actor = undefined;
		if(model) {
			this.requesting_update = true;
			this.actor = new Actor(model);
			this.actor.set("Idle");
		}
		
		Object.assign(this.effects, obj);
		
		this.effects.Apply(this.host);
		this.timeout = this.effects.Duration + Time.time;

	}
	
	timers() {
		if(this.effects.Duration && Time.time >= this.timeout) {
			this.remove();
		}
		
		if(Time.time % this.effects.Period === 0) {
			this.effects.Periodic(this.host);
		}
	}
	
	update() {
		if(this.requesting_update) {
			this.actor.scale *= (this.host.actor.model.width / this.actor.width) * this.subScale * this.subScale;
		}
	}
	
	scale_to_host(val) {
		this.subScale = val;
	}
	
	offset_to_host(arr) {
		this.actor.offset = [this.actor.offset[0] + arr[0], this.actor.offset[1] + arr[1]];
	}
	
	remove() {
		if(!this.removed) {
			this.effects.Remove(this.host);
			Time.killTimers(this);
			this.host.behaviours.remove(this);
			this.removed = true;
		}
	}
}