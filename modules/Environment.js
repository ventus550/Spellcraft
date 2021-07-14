/*jshint esnext: true */
/*jslint browser: true */

import {MAP_SIZE} from "./Map.js";


const MSIZE = 100,
	  CELL_SIZE = MAP_SIZE / MSIZE,
	  CUT = MSIZE - 2;

function div(num, val) {
	return Math.floor(num / val);
}

function safe(num) {
	if(num < 0) {
		num %= CUT;
		return CUT + num;	
	}
	return num % CUT;
}


function makeBoard() {
	let arr = [];
	
	for (let x = 0; x < CUT; x++) {
		let arrIn = [];
		for (let y = 0; y < CUT; y++) {
			arrIn.push(0);
		}
		arr.push(arrIn);
	}
	
	arr[div(CUT, 2)][div(CUT, 2)] = 10;
	return arr;
}

//Spread cells ranging in power from 0 to 7
function unitInteraction(x, y, board) {
	let mod = board[x][y] % 4;

	switch(mod) {
		case 0:
			board[safe(x-1)][y] += 3;
			break;
		case 1:
			board[x][safe(y+1)] += 3;
			break;
		case 2:
			board[safe(x+1)][y] += 3;
			break;
		case 3:
			board[x][safe(y-1)] += 3;
			break;
	}
	
	board[x][y] -= 1;
	
	let neightbours = 0;
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			neightbours += board[safe(x-i)][safe(y-j)];
		}
	}
	
	if(neightbours > 30) {
		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				board[safe(x-i)][safe(y-j)] = div(board[safe(x-i)][safe(y-j)], 2);
				board[safe(x-i)][safe(y-j)] += 1;
			}
		}
	}
}

function random(x, y, board) {
	let mod = board[x][y] % 4;

	switch(mod) {
		case 0:
			board[safe(x-1)][y] += 1;
			break;
		case 1:
			board[x][safe(y+1)] += 1;
			break;
		case 2:
			board[safe(x+1)][y] += 1;
			break;
		case 3:
			board[x][safe(y-1)] += 1;
			break;
	}
	
	//board[x][y] -= 1;
	
	
	
	let neightbours = 0;
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			if(board[safe(x-i)][safe(y-j)] > 0) {
				neightbours += 1;
			}
		}
	}
	
	if(neightbours > 3) {
		board[x][y] = 0;
	}
}


function decorationInteraction(x, y, board) {
	let mod = board[x][y] % 4;
	board[x][y] %= 7;

	switch(mod) {
		case 0:
			board[safe(x-1)][y] += 1;
			break;
		case 1:
			board[x][safe(y+1)] += 1;
			break;
		case 2:
			board[safe(x+1)][y] += 1;
			break;
		case 3:
			board[x][safe(y-1)] += 1;
			break;
	}	
	
	let neightbours = 0;
	for (let i = -2; i <= 2; i++) {
		for (let j = -2; j <= 2; j++) {
			if(board[safe(x-i)][safe(y-j)] > 0) {
				neightbours += 1;
			}
		}
	}
	
	if((neightbours < 6 && board[x][y] > 1) ||
	  	(neightbours > 8 && board[x][y] < 4) ||
	  	(neightbours > 12)
	  ) {
		board[x][y] = 0;
	}
}







function automata(board, iters, auto, format = function () {}) {
		
	
	for (let x = 0; x < CUT; x++) {
		for (let y = 0; y < CUT; y++) {
			if(board[x][y] !== 0) {
				auto(x, y, board);				
			}
		}
	}
	
	if(iters > 0) {
		automata(board, iters - 1, auto, format);
	} else {

		for (let x = 0; x < CUT; x++) {
			for (let y = 0; y < CUT; y++) {
				format(x, y, board);
			}
		}
	}
}

//drop b1 onto b2
function merge(b1, b2) {
	
	for (let x = 0; x < CUT; x++) {
		for (let y = 0; y < CUT; y++) {
			if(b1[x][y] !== 0) {
				b2[x][y] = b1[x][y];			
			}
		}
	}
	return b2;
}

//?
export class CellBuilder {
	constructor(events, decorations, units) {
		this.events = events;
		this.decorations = decorations;
		this.units = units;
	}
}


export class Zone {
	constructor(cellBuilders, unit_iter = 100, deco_iter = 100, event_iter = 100) {
		
		
		this.automatas = {
			events : random,
			decorations : decorationInteraction,
			units : unitInteraction
		};
		
		let UNIT_LAYER = makeBoard(),
			DECORATION_LAYER = makeBoard(),
			EVENTS_LAYER = makeBoard();
		
		automata(UNIT_LAYER, unit_iter, this.automatas.units);
		automata(DECORATION_LAYER, deco_iter, this.automatas.decorations, function(x, y, board) {
			if(board[x][y] !== 0) {board[x][y] = ["decoration", board[x][y]];}
			return;
		});
		automata(EVENTS_LAYER, event_iter, this.automatas.events, function(x, y, board) {
			if(board[x][y] > 3) {board[x][y] = ["event", board[x][y]];}
			else {board[x][y] = 0;}
			return;
		});
		
		window.ev = EVENTS_LAYER;
		
		
		this.map = merge(EVENTS_LAYER, merge(DECORATION_LAYER, UNIT_LAYER));
		let map = this.map;
		
		for (let x = 0; x < MSIZE; x++) {
			for (let y = 0; y < MSIZE; y++) {
				if(x === 0 || y === 0 || x === MSIZE-1 || y === MSIZE-1) {
					cellBuilders.blockades(x * CELL_SIZE + Math.round(CELL_SIZE/2), y * CELL_SIZE + Math.round(CELL_SIZE/2), null, CELL_SIZE);
				}
				
			}
		}
		
		//Cut center
		for(let i = -3; i <= 3; i++) {
			for(let j = -3; j <= 3; j++) {
				this.map[CUT/2 + i][CUT/2 + j] = 0;
			}
		}
		
		
		
		for (let x = 0; x < CUT; x++) {
			for (let y = 0; y < CUT; y++) {
				let X = (x+1) * CELL_SIZE,
					Y = (y+1) * CELL_SIZE;
				
				if(Array.isArray(this.map[x][y])) {
					if(this.map[x][y][0] === "decoration") {
						cellBuilders.decorations(X, Y, map[x][y][1], CELL_SIZE);
					} else {
						cellBuilders.events(X, Y, map[x][y][1], CELL_SIZE);
					}
					
					
				} else {
					cellBuilders.units(X, Y, map[x][y], CELL_SIZE);
				}
			}
		}
	}
	
	printMap() {
		console.log(this.map);
	}
	
	cellSize() {
		return CELL_SIZE;
	}
	
	
}























