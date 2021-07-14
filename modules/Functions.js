/*jshint esnext: true */
/*jslint browser: true */


import {isUncontained} from "./Map.js";
//import {MAP, FIELD} from "./Map.js";
function enlog(message, val1 = "", val2 = "", val3 = "", val4 = "") {
	console.log("#Engine:", message, val1, val2, val3, val4);
}
function sq(x) {return Math.pow(x, 2);}
function dist(p1, p2) {
	return Math.sqrt(sq(p1[0]-p2[0]) + sq(p1[1]-p2[1]));
}
function rand(a, b) {
	a = Math.floor(a);
	b = Math.floor(b);
	b += 1; return a + Math.floor(Math.random() * (b-a));}

function for_radius(point, radius, func, strict = true) {
	if (!Number.isInteger(point[0]) || !Number.isInteger(point[1])) {enlog("Degenerated point values in 'for_radius' -> ", point);}
	if (!Number.isInteger(radius)) {enlog("Degenerated radius value in 'for_radius' -> ", radius);}
	//!
	
	for(let i = point[0] - radius + 1; i <= point[0] + radius - 1; i++) {
		for(let j = point[1] - radius + 1; j <= point[1] + radius - 1; j++) {
			if(strict && isUncontained([i, j])) {continue;}
			
			//równanie okręgu ;)
			if(sq(i - point[0]) + sq(j - point[1]) > sq(radius)) {continue;}
			
			try {func(i, j);} catch(err) {enlog(err, " -> for_radius(",i,j,")");}}}	
}

function fix_pos(pos) {
	return [Math.floor(pos[0]), Math.floor(pos[1])];
}


function angle(p1, p2) {
	let x_dist = (p1[0] - p2[0]),
		y_dist = (p1[1] - p2[1]);
	
	return Math.atan(y_dist / x_dist);
}


function acom(a1, a2) {
	if(a1.length != a2.length) {return false;}
	let ok = true;
	for(let i = 0; i < a1.length; i++) {
		if(a1[i] != a2[i]) {ok = false;}
	}
	return ok;
}

function asum(a1, a2) {
	return [a1[0] + a2[0], a1[1] + a2[1]];
}

function amult(arr, operand) {
	
	let res = [];
	
	for(let i = 0; i < arr.length; i++) {
		res.push(arr[i] * operand);
	}
	
	return res;
}

function ignore(func) {
	try {
		func();
	} catch(err) {}
}

function relationship(source, target) {
	
	if(source.owner === 0 || target.owner === 0) {
		return "Neutral";
	}
	
	if(source.owner != target.owner) {	
		return "Hostile";
	}
	
	return "Friendly";
}

function chance(fraction) {
	if(fraction >= 1) {return true;}
	let size = 0,
		test = fraction;
	while(test < 1) {
		test *= 10;
		size++;
	}
	
	
	return rand(0, size*10) <= Math.floor(fraction*size*10);
}

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}


export {enlog, sq, dist, rand, for_radius, acom, asum, amult, ignore, relationship, fix_pos, chance, randomChoice, angle};


