/*jshint esnext: true */
/*jslint browser: true */

//Terrain
import {FIELD} from "./Objects.js";
import {Actor} from "./Models.js";
import {rand, enlog} from "./Functions.js";


const TERRAIN = [];
window.TERRAIN = TERRAIN;

function load_terrain() {
	for(let t of TERRAIN) {
		t.generate();
	}
}

class Terrain { //<<-- Zaimplenentować zagnieżdżanie terenu :)
    constructor(x, y, radius, model, generator/*, terrain*/) {
        this.pos = [x, y];
        this.width = this.height = 2 * radius; //<<-- do porpawy :)
        this.actor = new Actor(model);
		this.generator = generator;
        this.fields = [];
		
        TERRAIN.push(this);
    }
	
	remove() {
		TERRAIN.splice(TERRAIN.indexOf(this), 1);
	}
	
	generate() {

		let ter = this;
		this.fields = [];
        this.generators = {
            "random" : function() {
				let abw = ter.actor.width / FIELD,
					abh = ter.actor.height / FIELD,
                	num = (Math.ceil(ter.width / abw) * Math.ceil(ter.height / abh));
                for (let i = 0; i < num; i++) {
                    let x = rand(ter.pos[0] - ter.width/2 + abw/2, ter.pos[0] + ter.width/2 - abw/2), 
                        y = rand(ter.pos[1] - ter.height/2 + abh/2, ter.pos[1] + ter.height/2 - abh/2);
					
                        
                        
                        
                    ter.fields.push([x, y]);
                }},
            "singular" : function () {ter.fields.push([ter.pos[0] - ter.actor.width / FIELD / 2, ter.pos[1]  - ter.actor.height / FIELD / 2]);},
			"fill" : function () {
				let abw = ter.actor.width / FIELD,
					abh = ter.actor.height / FIELD,
                	xnum = Math.ceil(ter.width / abw),
					ynum = Math.ceil(ter.height / abh),
					xdiff = ter.width - xnum * abw,
					ydiff = ter.height - ynum * abh,
					xstart = xdiff/2 + abw/2,
					ystart = ydiff/2 + abh/2;
					
					for (let x = 0; x < xnum; x++) {
						for (let y = 0; y < ynum; y++) {
							ter.fields.push( [ ter.pos[0] - ter.width/2 + xstart + x*abw, ter.pos[1] - ter.height/2 + ystart + y*abh ] );						
						}
					}
				
			}
	};

	let final_gen = this.generators.fill;
	if(ter.generator !== undefined) {

		if(ter.generator in ter.generators) {
			
			final_gen = ter.generators[ter.generator];
		} else {

			if(typeof ter.generator !== "function") {enlog("Degenerated generator function argument for terrain -> ", ter.generator);}
		}
	}
		
	final_gen();
	}
}

export{TERRAIN, Terrain, load_terrain};

