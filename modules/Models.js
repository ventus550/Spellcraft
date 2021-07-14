/*jshint esnext: true */
/*jslint browser: true */

//! Dodać default export


const MODELS = [];
class Model {
	
	constructor(def) {
		let model = new Image();
		model.src = def;
		this.loaded = false;
		this.width = this.height = 0;
		
		let m = this;
		model.onload = function () {
			m.loaded = true;
			m.width = model.width;
			m.height = model.height;
		};
		
		this.Animations = {
			"Default" : [model]
		};
		
		MODELS.push(this);
	}
	
	
	frame(name, indx) {
		//console.log("Returning model?", this.Animations[name][indx]);
		return this.Animations[name][indx];
	}

	
	new(name, sequence) {
		this.Animations[name] = [];
		for(let s of sequence) {
			let img = new Image();
			img.src = s;
			this.Animations[name].push(img);
		}
	}
	
	new_auto(name, frame_name, countTo, extension) {
		let acc = [];
		
		for(let i = 0; i <= countTo; i++) {
			let num = i;
			let str = frame_name + num + extension;
			acc.push(str);
		}
		this.new(name, acc);
	}
}

//Actors
class Actor {
	
	constructor(model) {
		this.model = model;
		this.frameNum = 0;
		this.facing = "left";
		this.angle = 0;
		this.animating = "Default";
		this.aimation_priority = 0;
		this.len = 1;
		this.scale = 1;
		this.speed = 1;
		this.color = undefined;
		this.offset = [0, 0];
		this.launch_offsets = [];
		this.notMissile = 1;
		this.shadow = undefined;
	}
	
	setShadow(scale, offset) {
		this.shadow = {
			scale : scale,
			offset : offset
		};
	}	
	
	get width() {
		return this.model.width * this.scale;
	}
	
	get height() {
		return this.model.height * this.scale;
	}
	
	next() {		
		this.frameNum += this.speed;
		let index = Math.floor((this.frameNum - this.speed) % this.len);
		return this.model.frame(this.animating, index);
	}
	replace_model(model) {
		this.model = model;
		this.set("Default", 0);
		this.aimation_priority = 0;
	}
	
	set(name, prio = 1) {
		if(this.animating === "Death") {
			return false;
		}
		
		if(prio >= this.aimation_priority) {
			this.aimation_priority = prio;
			if(name != this.animating) {
					if(name in this.model.Animations) {
					this.animating = name;
					this.frameNum = 0;
					this.len = this.model.Animations[name].length;
			} else { /*this.set("Default", 0);*/ }}
		}
		
	}
	

}


export {Model, MODELS, Actor};

