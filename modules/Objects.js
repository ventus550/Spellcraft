/*jshint esnext: true */
/*jslint browser: true */

/*
import {MAP, FIELD} from "./Map.js";
import {for_radius, enlog, occupied, dist, acom} from "./Functions.js";
import {Actor, UNIT_ARRAY, OBJECTS, Screen} from "./Screen.js";
*/
//import {MAP, FIELD, for_radius, enlog, occupied, dist, acom, Actor, UNIT_ARRAY, OBJECTS, Screen} from "../engine.js";

import * as F from "./Functions.js";
import {Actor} from "./Models.js";
import {MAP, MAP_SIZE, FIELD} from "./Map.js";
import {Time} from "./Time.js";

const OBJECTS = [];
const UNIT_ARRAY = [];
const DECORATIONS = []; //<<-- chyba useless
window.OBJECTS = OBJECTS;
window.UNIT_ARRAY = UNIT_ARRAY; //<<-- do poprawy




function occupied(i, j) {
	if(i < 0 || j < 0 || i > MAP_SIZE || j > MAP_SIZE) {return [];}
	if(window.MAP[i][j][0] === 0) {return false;}return window.MAP[i][j][1];}

function pathfinder(unit, destination) {
 	let maxSteps = F.dist(unit.pos, destination), //<<-- max path length!!
		speed = unit.speed,
		crossed = [],
		res = [];
	
	
	F.for_radius(unit.pos, unit.radius, function (i, j) {window.MAP[i][j][0] -= 1;}); //<<-- Remove own collision
	
	
	
	function search(pos, stepList, stepNum) {
		if((pos[0] === destination[0] && pos[1] === destination[1]) || stepNum >= maxSteps) {
			res = stepList;
			return [pos, stepList];
		}
		
		crossed.push(pos);
		let dest,
			possible_paths = [];
		
		
		function notIncluded(pos) {
			
			let ok = true;
			for (let ar of crossed) {
				if(F.acom(pos, ar)) {ok = false;}

			}
			return ok;
		}
		for(let dir of ["left", "up", "down", "right"]) {
			
			switch(dir) {
				case "left":
					dest = [pos[0] - speed, pos[1]]; break;
				case "right":
					dest = [pos[0] + speed, pos[1]]; break;
				case "up":
					dest = [pos[0], pos[1] - speed]; break;
				case "down":
					dest = [pos[0], pos[1] + speed]; break;
			}

			if(notIncluded(dest) && unit.canMoveTo(dest)) {
				possible_paths.push( [dest, dir, F.dist(dest, destination)] ); // <<-- nowa pozycja/ "kierunkek" / dystans
			}
		}
		possible_paths =  possible_paths.sort(function (a, b) {return a[2] - b[2];});
		
		for(let p of possible_paths) {
			
			let newList = stepList.slice();
			newList.push(p[1]);
			
			if(stepNum < maxSteps) {
				let res = search(p[0], newList, stepNum + 1);
				if(res) {return res;}
			}
		}
	}
	
	search(unit.pos, [], 0);
	F.for_radius(unit.pos, unit.radius, function (i, j) {window.MAP[i][j][0] += 1;});
	unit.firstMoveTo = false;

	return res.reverse();
	
}  //<< O(infinity) do poprawy






//General purpose unit class
class Unit {
	
	constructor(x, y, radius, model) {
		this.actionQueue = [];
		this.moveQueue = [];
		this.behaviours = [];
		this.owner = 0;
		this.pos = [x, y];
		this.radius = radius;
		this.speed = 0;
		
		this.firstMoveTo = true;
		this.spawnCollisionOff = true;
		
		this.map_spot = undefined;
		
		//Read only. Stores information about camera span over the unit
		this.inSight = false;
		this.isRemoved = false;
		
		//stats
		this.HP = 1;
		this.MAX_HP = 1;
		this.damage_reduction = 0;
		this.last_attacker = undefined;
		this.type = "Unit";
		this.damage_modifier = 1;
		
		this.resistances = {};
		
		
		//actors
		this.actor = new Actor(model);
		this.map_update(); //<<-- możliwie niebezpieczne
		let self = this;
		
		//Contains unit flags and behaviour modifications and becomes read only when unit enters its death state
		this.properties = {
			//Ignores collision allowing the unit to pass through other objects, while still keeping its own collision radius
			"ignoreCollision" : false,
			//Dictates whether or not the unit can perform move() action
			"isMovable" : true,
			//Dictates whether or not the unit gets rendered by the Screen
			"isVisible" : true,
			//Dictates whether or not the unit can be destroyed
			"isDestructible" : true,
			//Dictates whether or not the unit is dead
			"isDead" : false,
			//Dictates whether or not the unit is currently in motion
			"isMoving" : false,
			//Dictates whether or not a unit can be killed. Unit can still trigger "death" event but will not be removed.
			"isKillable" : true
		};
		
		//Events hausing their respective functions. Handling given event executes all its stored functions
		this.events = {
			//Unit died
			"death" : [
				function () {
					
					
					if(!self.properties.isKillable) {
						self.HP = 1;
						return false;
					}
					
					self.properties.isDead = true;
					self.properties.isMovable = false;
					self.cleanse();
					if(self.actor.model.Animations.Death) {
						self.actor.set("Death", 3);
						self.actor.angle = 0;

						
						self.events.updated.push(
							function() {
								let fnum = self.actor.frameNum,
									fspeed = self.actor.speed,
									flen = self.actor.len;
								
								if(fnum + fspeed > flen * 0.8) {
									self.remove();
								} else {
									self.addAction(function () {self.actor.set("Death");}, 3);
								}	
							}
						);
					} else {
						self.remove();
					}
					
				}
			],
			//Unit moved
			"moved" : [
				function () {
					self.map_update();
				}
			],
			//Unit has been updated by the renderer
			"updated" : [],
			//Unit took damage
			"damaged" : [],
			//Unit has been removed from the game <<-- do usunięcie
			"removed" : []
		};
		
		this.map_attach();
		

	}
	//Cleanse unit of all pending timers, behaviours, orders and actions
	cleanse() {
		Time.killTimers(this);
		this.actionQueue = [];
		this.moveQueue = [];
		
		while(this.behaviours.length > 0) {
			this.behaviours[0].remove();
		}
	}
	
	
	//Fires an event passed as the argument by its name
	handle_event(e) {
		for (let f of this.events[e]) {f();}
	}
	
	//Registers an event under the given name or, if event already exists, adds the function to the fornt of the functions queue
	addEvent(name, func) {
		if(this.events.hasOwnProperty(name)) {
			this.events[name].unshift(func);
		} else {
			this.events[name] = [func];
		}
	}
	
	addResistance(name, max_res = Infinity) {
		this.resistances[name] = [0, max_res];
	}
	
	//Removes this unit from the map field
	map_clear() {
		try {
			this.map_spot.splice(this.map_spot.indexOf(this), 1);
		}catch(err) {}
	}
	
	//Reappends this unit to the map field. This function calls "map_clear"
	map_update() {
		this.map_clear();
		
		let x = Math.floor(this.pos[0]),
			y = Math.floor(this.pos[1]);
		window.MAP[x][y][1].push(this);
		this.map_spot = window.MAP[x][y][1];
	}
	
	map_attach() {
		UNIT_ARRAY.push(this);
		OBJECTS.push(this);		
		
		if(!(this.properties.ignoreCollision)) {
			F.for_radius(this.pos, this.radius, function (i, j) {try{window.MAP[i][j][0] += 1;}catch(err){F.enlog(err);}});
		}
	}
		
	//Remove unit from the game engine
	remove() {
		this.isRemoved = true;
		this.events.updated = [];
		UNIT_ARRAY.splice(UNIT_ARRAY.indexOf(this), 1);
		OBJECTS.splice(OBJECTS.indexOf(this), 1);
		this.cleanse();


		this.map_clear();
		F.for_radius([Math.floor(this.pos[0]), Math.floor(this.pos[1])], this.radius, function (i, j) {try {window.MAP[i][j][0] -= 1;} catch(err) {}});
		
	}
	//Kills the unit. Killed unit enters "death state" and play its "Death" animation. If no such animation is found unit is instantly removed. This function will always call "remove" function
	kill() {
		if(this.isRemoved) {return;}
		this.map_clear();
		if(!this.properties.isDead) {this.handle_event("death");}
	}
	
	//! ACTION QUEUE -------------------------
	
	//Adds action to the action queue to be executed by the next game update
	addAction(action, prio = 0) {
		if(typeof action !== "function") {F.enlog("Degenerated action -> ", action);}
		let isNew = true;
		for(let a of this.actionQueue) {
			if(a[0] === prio && a[1].toString() === action.toString()) {isNew = false;}}
		
		if(isNew) {this.actionQueue.push([prio, action]);}
		
	}
	
	//Empties action queue and returns all its actions as an array. Should be used only by game update mechanisms
	retrieveActions() {
		this.actionQueue.sort(function(a, b) {return b[0] - a[0];});
		let arr = [];
		for (let e of this.actionQueue) {arr.push(e[1]);}
		this.actionQueue = [];
		return arr;
		
	}
	
	//Check collision of a given point on the map
	canMoveTo(destination) {
		let unit = this;
		if(unit.properties.ignoreCollision || unit.firstMoveTo) {return true;}

		let isSafe = true;
		F.for_radius(destination, unit.radius, function (i, j) {
			if(occupied(i,j)) {isSafe = false;}

			if (window.RENDERING_MODE) {
				let rp = window.Screen.sp([i ,j]);
				window.Screen.ctx.beginPath();
				window.Screen.ctx.rect(rp[0]-FIELD/2, rp[1]-FIELD/2, FIELD, FIELD);
				window.Screen.ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
				window.Screen.ctx.fill();
			}
		});
		
		return isSafe;
	}
	
	//Move unit by its speed value in a given direction and play "Run" animation
	move(direction) {
		if(this.firstMoveTo) {this.firstMoveTo = false;}


		let self = this;
		return function () {
			if(self.properties.isMovable) {
				self.actor.set("Run", 2);
			
				let destination;

				switch(direction) {
					case "left":
						destination = [self.pos[0] - self.speed, self.pos[1]];
						self.actor.facing = "left";
						break;
					case "right":
						destination = [self.pos[0] + self.speed, self.pos[1]];
						self.actor.facing = "right";
						break;
					case "up":
						destination = [self.pos[0], self.pos[1] - self.speed];
						break;
					case "down":
						destination = [self.pos[0], self.pos[1] + self.speed];
						break;
				}


				F.for_radius(self.pos, self.radius, function (i, j) {try {window.MAP[i][j][0] -= 1;} catch(err) {}});

				if(self.canMoveTo(destination)) {self.pos = destination; self.spawnCollisionOff = false;}
				else {if(self.spawnCollisionOff) {self.pos = destination;}}

				F.for_radius(self.pos, self.radius, function (i, j) {try {window.MAP[i][j][0] += 1;} catch(err) {}});
			}
		};
	}
	
	//Path to a given point and play "Run" animation
	move_to(point) {
		this.moveQueue = pathfinder(this, point);
		return this.moveQueue.slice();
	}
	
	
	//Damage the unit, if no damage source is specified the parameter resolves to this unit. Should the damage be negative it will be trated as a heal, not trigger "damaged" event and won't exceed the maximum health value
	damage(dmg, source = this) {
		if(dmg < 0) {
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
	
	//Returns unit's position offseted by a launch point
	lpoint(index) {
		try {
			let lps = this.actor.launch_offsets[index];
			if(this.actor.facing === "right") {
				return [this.pos[0] - lps[0], this.pos[1] + lps[1]];
			} else {
				return [this.pos[0] + lps[0], this.pos[1] + lps[1]];
			}
			
			
		}catch(err) {return this.pos;}
	}
}


//General purpose missile class
class Missile extends Unit {
	constructor(pos, model) {
		super(pos[0], pos[1], 0, model);
		this.angle = 0;
		this.actor.facing = "left";
		this.actor.notMissile = 0;
		this.type = "Missile";
	}
	//Move missile (in pixels) by [x, y] vector
	move(xy) {
		if(this.properties.isMovable) {
			let self = this;
			return function () {
				self.actor.set("Run", 2);
				self.pos[0] += xy[0];
				self.pos[1] += xy[1];
			};
		}
		
	}
	
	//Queue missiles trajectory and play "Run" animation
	move_to(point) {
		let x_dist = (point[0] - this.pos[0]),
			y_dist = (point[1] - this.pos[1]),
			angle = Math.atan(y_dist / x_dist),
			Xmove = Math.cos(angle)*this.speed,
			Ymove = Math.sin(angle)*this.speed,
			time = Math.ceil(F.dist(this.pos, point) / this.speed);
		
		this.actor.angle = angle * 180 / Math.PI;
		if(point[0] - this.pos[0] < 0) {Xmove *= -1; Ymove *= -1;} else {this.actor.angle += 180;}

		for(let i = 0; i < time; i++) {
			this.moveQueue.push([Xmove, Ymove]);
		}
		
		
	}
	
	
	
}


//!Decorations ---------------

//General purpose decoration. Decorations are uniteractable game world objects
class Decoration {
	constructor(x, y, model, fields) {
		this.pos = [x, y];
		
		this.actor = new Actor(model);
		
		this.properties = {
			//Dictates whether or not the unit gets rendered by the Screen
			"isVisible" : true
		};
		this.fields = fields;
		
		if (fields !== undefined) {
			for(let f of fields) {
				if(!(f.length === 2 && Number.isInteger(f[0]) && Number.isInteger(f[1]))) { F.enlog("Degenerated field value -> ", f); }
				window.MAP[this.pos[0] + f[0]][this.pos[1] + f[1]][0] += 1;
			}
		}
		
		DECORATIONS.push(this);
		OBJECTS.push(this);
	}
	
	get Array() {
		return DECORATIONS;
	}
	
	remove() {
		DECORATIONS.splice(DECORATIONS.indexOf(this), 1);
		OBJECTS.splice(OBJECTS.indexOf(this), 1);
		for(let f of this.fields) {
			window.MAP[this.pos[0] + f[0]][this.pos[1] + f[1]][0] -= 1;
		}
	}
}


export {OBJECTS, MAP, MAP_SIZE, FIELD, Unit, UNIT_ARRAY, Missile, Decoration, occupied};