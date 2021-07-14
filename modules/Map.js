/*jshint esnext: true */
/*jslint browser: true */

const FIELD = 5;
const MAP_SIZE = 3000;
const MAP = window.MAP = [];
for (let i = 0; i < MAP_SIZE; i++) {
	let temp = [];
	for (let j = 0; j < MAP_SIZE; j++) {
		
		if(i === 0 || j === 0 || i === MAP_SIZE-1 || j === MAP_SIZE-1) {
			temp.push([1, []]);
		} else {
			temp.push([0, []]);
		}
	}
	MAP.push(temp);
}

function isUncontained(pos) {
	return pos[0] < 0 || pos[1] < 0 || pos[0] >= MAP_SIZE || pos[1] >= MAP_SIZE;
}

function MAP_RESET() {
	while (window.OBJECTS.length > 0) {
		window.OBJECTS[0].remove();
	}
	while (window.TERRAIN.length > 0) {
		window.TERRAIN[0].remove();
	}
}
window.MAP_RESET = MAP_RESET;


export {FIELD, MAP_SIZE, MAP_RESET, MAP, isUncontained}; //<<-- do przemyslenia



