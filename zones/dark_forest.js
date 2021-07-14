/*jshint esnext: true */
/*jslint browser: true */

import * as Models from "../models.js";
import {Slime, SkeletonArcher} from "../monsters.js";
import * as Events from "../events.js";
import {Terrain, Decoration, for_radius, Zone, MAP_SIZE, randomChoice, chance} from "../engine.js";


function rand(a, b) {b += 1; return a + Math.floor(Math.random() * (b-a));}

//function randomChoice(arr) {return arr[Math.floor(Math.random() * arr.length)];}

//Tree
let arr1 = [];
for_radius([0,0], 3, function (x, y) {
	arr1.push([x,y]);
}, false);
class Tree extends Decoration {
	constructor(x, y) {
		super(x, y, Models.darkwood, arr1);
		this.actor.offset = [4, 40];
		this.actor.speed = 0.5;
		this.actor.set("Idle");
		this.actor.frameNum = rand(0, this.actor.len);
		this.actor.setShadow(0.8, [-20,10]);

	}
}


//Tree Blockade
class TreeBlock extends Decoration {
	constructor(x, y, radius) {
		let arr2 = [];
		for_radius([0,0], radius, function (x, y) {
			arr2.push([x,y]);
		}, false);
		
		
		super(x, y, Models.darkwood, arr2);
		this.actor.offset = [4, 80];
		this.actor.speed = 0.5;
		this.actor.set("Idle");
		this.actor.scale = 1.8;
		this.actor.setShadow(0.8, [-50,10]);
		
		this.actor.frameNum = rand(0, this.actor.len);
	}
}



//Bonfire
let arr3 = [];
for (let i = -3; i <= 3; i++) {
	for (let j = -2; j <= -1; j++) {
		arr3.push([i, j]);
	}
}
arr3.push([-2, -3]);
arr3.push([-1, -3]);
arr3.push([0, -3]);
arr3.push([1, -3]);
arr3.push([2, -3]);

class Bonfire extends Decoration {
	constructor(x, y) {
		super(x, y, Models.bonfire, arr3);
		this.actor.set("Idle");
	}
}


function blockCell(x, y, undefined, size) {
	new TreeBlock(x, y, Math.floor(size/2));
}


function unitCell(x, y, val) {
	return;
	if(val === 4) {
		//new Slime(x, y, "blue");
		new SkeletonArcher(x, y);
	}
	if(val === 5) {
		new Slime(x, y, "red");
	}
	if(val > 5) {
		new Slime(x, y, "green");
		new Slime(x, y, "green");
		new Slime(x, y, "green");
	}
	
}


function decoCell(x, y, val, size) {
	let cent = [x, y],
		os = size/2;
	
	for(let i = 0; i < val/2; i++) {
		new Tree(cent[0]+rand(-os, +os), cent[1]+rand(0, os));
	}
	
	if(val > 3) {
		new TreeBlock(cent[0], cent[1], Math.floor(size/3));
	}
}

function eventCell(x, y, val, size) {
	let e;
	if(chance(0.1)) {
		e = randomChoice(Events.GENERICS);
	} else {
		e = randomChoice([Events.BlackMushroom, Events.Tombstone]);
	}
	new e(x, y);
}



//Grass
class DarkGrass extends Terrain {
	constructor(x, y, size) {
		super(x, y, size, Models.dark_grass);
	}
}


export class DarkForest extends Zone {
	constructor(monster_power) {
		super({
			blockades : blockCell,
			units : unitCell,
			decorations : decoCell,
			events : eventCell
		}, 200, 200);
		
		window.grass = new DarkGrass(MAP_SIZE/2, MAP_SIZE/2, MAP_SIZE/2);
		//new Bonfire(MAP_SIZE/2, MAP_SIZE/2);		
	}
}











