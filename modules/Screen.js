/*jshint esnext: true */
/*jslint browser: true */
/*global window */

import {isUncontained} from "./Map.js";
import {OBJECTS, FIELD, MAP_SIZE, UNIT_ARRAY, Decoration, occupied} from "./Objects.js";
import * as F from "./Functions.js";
import {Terrain, TERRAIN} from "./Terrain.js";
import {MODELS} from "./Models.js";
import {Time} from "./Time.js";


//Game Parameters
const TICKRATE = 40;
export const SEC = 1000/TICKRATE;
window.RENDERING_MODE = false;
function field_to_pixels(f) {return f * FIELD;}



window.tooltip = null;

window.mouse = {
	real : [0, 0],
    update: window.onmousemove = function (e) {
		window.mouse.real = [e.clientX, e.clientY];
		
		if(window.tooltip && window.tooltip.body.style.opacity) {
			window.tooltip.body.style.left = window.mouse.real[0] + 20;
			
			let offsetTop = window.mouse.real[1] - window.tooltip.body.clientHeight;
			if(offsetTop < 0) {
				window.tooltip.body.style.top = 10;
			} else {
				window.tooltip.body.style.top = offsetTop;
			}
		}
	},
	
	pos : function () {
		return [(window.mouse.real[0] - Math.floor(Screen.ww/2))/FIELD + window.camera.pos[0], (window.mouse.real[1] - Math.floor(Screen.wh/2))/FIELD + window.camera.pos[1]];
	}
};

window.camera = {
	pos : [0, 0],
	object : undefined,
	attach : function (obj) {
		this.object = obj;
	},
	detach : function () {
		this.object = undefined;
	}
};
export const camera = window.camera;


//Interface
export class Interface {
	constructor(parent = document.body,  html = "div") {
		
		Screen.interface.push(this);
		this.parent = parent;
		this.body = document.createElement(html);
		this.body.style.position = "absolute";
		this.body.setAttribute("draggable", false);
		this.body.style.webkitUserDrag = "none";
		this.body.hidden = true;
		this.TooltipText = undefined;
		this.name = undefined;
		
		this.body.ondragstart = function () {return false;};
		
		this.events = {
			"reloaded" : [],
			"rendered" : []
		};

		parent.appendChild(this.body);
		
		let self = this;
		this.body.addEventListener("mouseover", function () {
			if(self.TooltipText) {
				window.tooltip.show(self.name, self.TooltipText);
			} 			
		});
		
		this.body.addEventListener("mouseout", function () {
			window.tooltip.hide();
		});
		
		this.body.onclick = function (e) {
			e.stopPropagation();
		};
	}
	
	hide() {
		this.body.style.display = 'none';
	}
	
	show() {
		this.body.style.display = 'inline-block';
	}
	
	setTooltip(txt) {
		this.TooltipText = txt;
	}
	
	reload() {
		this.body.hidden = Screen.c.hidden;
		for(let e of this.events.reloaded) {e();}
	}
	
	render() {
		for(let e of this.events.rendered) {e();}
	}
	
	addEvent(name, func) {
		if(this.events.hasOwnProperty(name)) {
			this.events[name].unshift(func);
		} else {
			this.events[name] = [func];
		}
	}
	
	get visible() {
		return this.body.style.display != 'none';
	}
}

//Tooltip
class Tooltip extends Interface {
	constructor() {
		super();
		Object.assign(this.body.style, {
			zIndex : 100,
			opacity : 0,
			border : "1px solid black",
			borderRadius : "1px",
			backgroundColor : "rgba(0,0,0, 0.5)",
			left : "0px",
			top : "0px",
			maxWidth : "300px",
			transition : "opacity 0.2s",
			color : "white",
			padding : 10,
			userSelect : "none",
			cursor : "none",
			pointerEvents : "none"
		});
		
		
		let span = document.createElement("span");
		this.body.appendChild(span);
		this.body.TN = document.createTextNode("");
		span.appendChild(this.body.TN);
		
		let span2 = document.createElement("span");
		this.body.appendChild(span2);
		this.body.TN2 = document.createTextNode("");
		span2.appendChild(this.body.TN2);
		
		span.style.display = span2.style.display = "block";
		span.style.textAlign = "center";
		span.style.color = "yellow";
	}
	
	show(title, txt) {
		this.body.TN.textContent = title;
		this.body.TN2.textContent = txt;
		this.body.style.opacity = "1";
	}
	hide() {
		this.body.style.opacity = '0';
	}
}

//Messages
function Message(parent, txt, color = "white", warning = false) {
		
	let body = document.createElement("div");
	parent.appendChild(body);

	Object.assign(body.style, {
		//backgroundColor : "rgba(100,100,100, 0.5)",
		left : "0px",
		top : "0px",
		width : parent.style.width,
		color : color,
		fontSize : "15px",
		position : "block",
		userSelect : "none",
		textAlign : "center",
		transition : "top 0.5s, opacity 2s"
	});

	if(warning) {
		body.style.fontStyle = "italic";
		body.style.fontSize = "28px";
	}
	
	body.textContent = txt;
	setTimeout(function () {
		body.style.opacity = 0;
		setTimeout(function () {
			body.remove();
		}, 2000);
	}, 3000);
	
	
	return body;
}

class Messages extends Interface {
	constructor() {
		super();
		this.MSGS = [];
				
		let self = this;
		this.addEvent("reloaded", function () {
			self.body.style.left = (window.innerWidth - self.body.offsetWidth)/2 + "px";
			//self.body.style.top = (window.innerHeight - self.body.offsetHeight)/2 + "px";
		});
		
		Object.assign(this.body.style, {
			//backgroundColor : "rgba(10,10,10, 0.5)",
			left : "0px",
			bottom : "100px",
			width : "400px",
			height : "200px",
			padding : 10,
			pointerEvents : "none"
		});
		
		
		
		
	}
	
	message(txt, color = "white", warning = false) {
		this.MSGS.unshift(Message(this.body, txt, color, warning));
		for(let msg of this.MSGS) {
			this.body.appendChild(msg);
		}
	}
	
	warning(txt) {
		this.message(txt, "#5e070e", true);
	}
	
} 



//Screen Definition
export class Screen {
	
	constructor() {
		
		//UI
		this.interface = [];
		//user input section
		window.regs = this.registered_keys = {
			37: false,
			38: false,
			39: false,
			40: false
			
		};
		
		let scr = this;
		function kd(e) {
			try {
				scr.registered_keys[e.keyCode] = true;
			} catch(err) {}
		}
		function ku(e) {
			try {
				scr.registered_keys[e.keyCode] = false;
			} catch(err) {}
		}
		window.addEventListener("keydown", kd);
		window.addEventListener("keyup", ku);
		
		window.Screen = Screen;
		this.ww = this.wh = 0;
		this.shadowRadius = 1000;
		
		
		//pocket canvas
		this.pc = document.createElement("canvas");
		this.pctx = this.pc.getContext("2d");
		this.pc.width = this.pc.height = 500;
		//this.pc.style.position = "absolute";
		//this.pc.style.border = "2px solid black";
		//this.pc.style.backgroundColor = "black";
		
		//canvas section
		this.virtual_canvas = document.createElement("canvas");
		this.vctx = this.virtual_canvas.getContext("2d");

		
		//canvas section
		this.c = document.createElement("canvas");
		this.ctx = this.c.getContext("2d");
		this.c.style.backgroundColor = "black"; //<<-- do usunięcia
		this.c.hidden = true;
		this.c.style.position = "absolute";
		document.body.appendChild(this.c);
		
		
		//canvas section
		this.effects = document.createElement("canvas");
		this.ectx = this.effects.getContext("2d");
		this.effects.style.position = "absolute";
		this.effects.style.pointerEvents = "none";
		document.body.appendChild(this.effects);
		
		
		
		this.reload();		
	}
	
	reload() {
		this.ww = window.innerWidth;
		this.wh = window.innerHeight;
		this.c.width = this.virtual_canvas.width = this.effects.width = this.ww;
		this.c.height = this.virtual_canvas.height = this.effects.height = this.wh;
		
		for(let i of this.interface) {i.reload();}
		this.setShadows();

	}
	
	setShadows(radius = this.shadowRadius, color = "black") {
		//...
		this.ectx.clearRect(0, 0, this.effects.width, this.effects.height);
		
		
		// Create gradient
		let grd = this.ectx.createRadialGradient(this.effects.width/2, this.effects.height/2, 50, this.effects.width/2, this.effects.height/2, radius);
		grd.addColorStop(0, "rgba(0,0,0,0)");
		grd.addColorStop(1, color);

		// Fill with gradient
		this.ectx.fillStyle = grd;
		this.ectx.fillRect(0, 0, this.effects.width, this.effects.height);
	}
	
	update() {
	
		//Timers
		Time.time += 1;
		Time.game_time += TICKRATE/1000;
		for (let t of Time.activeTimers) {
			t[0] -= 1;
			
			if(t[0] === 0) {
				try {
					t[1]();
					
					if(t.length === 4) {t[0] = t[3];}
				} catch(err) {F.enlog(err); t[2] = null;}}}
		
		Time.activeTimers = Time.activeTimers.filter(function(e) {return e[0] !== 0 || e.length === 4;}); //<<-- pewnie dało sie lepiej :<
		
		//update units
		for (let unit of UNIT_ARRAY) {
			unit.handle_event("updated");
			if(isUncontained(unit.pos)) {unit.remove(); continue;}
			if(unit.properties.isDead || unit.isRemoved) {continue;}
			
			//Handle behaviours
			for(let b of unit.behaviours) {
				b.timers();
			}
			
			if(unit.moveQueue.length === 0) {unit.properties.isMoving = false;}
			if(unit.actionQueue.length === 0 && unit.moveQueue.length === 0) {
				unit.actor.set("Idle", 0);
				
			} else {
				unit.properties.isMoving = true;
				
				let move1 = unit.moveQueue.pop(), 
					move2 = unit.moveQueue[unit.moveQueue.length - 1],
					ret = unit.retrieveActions(); //<<-- cleanup ;)
				if(move1) {unit.move(move1)();}
				
				
				
				if(((move1 == "left" || move1 == "right") && (move2 == "up" || move2 == "down")) ||
				  ((move1 == "up" || move1 == "down") && (move2 == "left" || move2 == "right")))
					{unit.move(unit.moveQueue.pop())();}
				
						
				for(let a of ret) {
					a();
				}
				
				unit.handle_event("moved");	
			}}
		

		
		
		//Camera
		if(camera.object) {
			if(camera.object.hasOwnProperty("pos")) {
				camera.pos = camera.object.pos;
			} else {
				try {
					camera.pos = F.fix_pos(camera.object);
				}catch(err) {F.enlog("Degenerated camera object value ->", camera.object, "\n", err);}
			}
		}
		
	}
	
	DRAW_ACTOR(actor, x, y){
		
		//x, y are screen coords
		let pc = this.pc,
			context = this.pctx,
			image = actor.next();
		
		
		//Creating shadows
		if(actor.shadow) {
			this.vctx.beginPath();
					this.vctx.ellipse(x - actor.width/8 + actor.shadow.offset[0],
									  y - actor.height/8 + actor.shadow.offset[1],
									  actor.width/4 * actor.shadow.scale,
									  actor.height/3 * actor.shadow.scale,
									  -Math.PI/4,
									  0,
									  2 * Math.PI);
					
					this.vctx.fillStyle = "rgba(0, 0, 0, 0.25)";
					this.vctx.fill();
		}
		
		//Optimizing for simple cases
		if(actor.angle === 0 && actor.facing === "left" && actor.color === undefined) {
			this.vctx.drawImage(image, x - actor.width/2 + actor.offset[0], y - actor.height/2 - actor.notMissile * actor.height/2 + actor.offset[1],
							  actor.width, actor.height);
			return;
		}
		

		
		context.clearRect(0, 0, pc.width, pc.height);
		
		let size = 0,
			ax = actor.width,
			ay = actor.height;
		if(ax > ay) {
			size = ax;
		} else {
			size = ay;
		}
		//pc.width = pc.width = size;
		
		context.save();
		context.translate(pc.width / 2, pc.height / 2);

		if(actor.angle !== 0) {
			
			context.rotate(actor.angle*Math.PI/180);
			
		} else {
			if(actor.facing === "right") {
				context.scale(-1,1);
			}
		}
		
		if(actor.color) {
			context.fillStyle = actor.color;
			context.fillRect(-pc.width/2, -pc.height/2, pc.width, pc.height);
			context.globalCompositeOperation = "destination-in";
			context.drawImage(image, -actor.width/2, -actor.height/2, actor.width, actor.height);
			context.globalCompositeOperation = "luminosity";
		}
		
		/* 
		context.shadowColor = "rgba(0, 0, 0, 0.5)";
		context.shadowBlur = 5;								//<<-- zabite marzenia
		context.shadowOffsetX = -10;
		context.shadowOffsetY = -10;
		*/
		
		context.drawImage(image, -actor.width/2, -actor.height/2, actor.width, actor.height);
		
		
		
		//-actor.height/2 to place the image at the units feet
		this.vctx.drawImage(pc, x - pc.width/2 + actor.offset[0], y - pc.height/2 - actor.notMissile * actor.height/2 + actor.offset[1]);
		context.restore();
	}

	
	render() {	
		const MARGIN = 100,
			  vision_range = this.ww / 2 / FIELD + MARGIN;
		
		
		//clear
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);
		this.vctx.clearRect(0, 0, this.virtual_canvas.width, this.virtual_canvas.height);
		this.ctx.beginPath();
		let pt = this.sp([0,0]);
		this.ctx.rect(pt[0], pt[1], MAP_SIZE * FIELD, MAP_SIZE * FIELD);
		this.ctx.stroke();
		
		
		//Draw Terrain
		for (let terrain of TERRAIN) {
			
            for (let t of terrain.fields) {
                if(!(t instanceof Terrain)) {
                    
                    let pos = this.sp(t);
                        /*tam = terrain.actor,
                        x = pos[0] - tam.width/2 + terrain.actor.offset[0],
                        y = pos[1] - tam.height + terrain.actor.offset[1];*/
					
                    if(Math.abs(t[0] - camera.pos[0]) > vision_range || Math.abs(t[1] - camera.pos[1]) > vision_range) {
						continue;
					}
					
                    this.DRAW_ACTOR(terrain.actor, pos[0], pos[1] + terrain.actor.height/2);
                    
                }
            }
			let spt = this.sp(terrain.pos),
				w = field_to_pixels(terrain.width),
				h = field_to_pixels(terrain.height);
			if (window.RENDERING_MODE) {
				this.vctx.beginPath();
				this.vctx.strokeStyle = 'purple';
				this.vctx.rect(spt[0] - w/2, spt[1] -h/2, w, h);
				this.vctx.stroke();
				this.vctx.strokeStyle = 'black';
			}
        }
		
		
		//Draw Units
		OBJECTS.sort(function(a,b) {return a.pos[1] - b.pos[1];}); // <<-- chyba okey, do przemyślenia
		
		for (let unit of OBJECTS) {
			
			if(unit.isRemoved) {continue;}
			
			//Discard assests out of reach
			if(Math.abs(unit.pos[0] - camera.pos[0]) > vision_range || Math.abs(unit.pos[1] - camera.pos[1]) > vision_range) {
				unit.inSight = false;
				continue;
			}
			unit.inSight = true;
			

			let pos = this.sp(unit.pos),
				uam = unit.actor,
				x = pos[0],
				y = pos[1];
			try {
				
				if (unit.properties.isVisible) {
					if(unit instanceof Decoration &&
					   unit.pos[1] - camera.pos[1] > 0 &&
					   Math.abs(camera.pos[0] - unit.pos[0]) < unit.actor.width/2 / FIELD &&
					   unit.pos[1] - camera.pos[1] < unit.actor.height/2 / FIELD)
					{this.vctx.globalAlpha = 0.3;}
					
					//Draw behaviours' visuals
					if(unit.behaviours) {
						let rendered = [];
						for(let b of unit.behaviours) {
							if(b.actor) {
								if(!rendered.includes(b.actor.model)) {
									rendered.push(b.actor.model);
									b.update();
									this.DRAW_ACTOR(b.actor, x + unit.actor.offset[0], y + unit.actor.offset[1]);
								}
								
								
							}
						}
					}
					
					this.DRAW_ACTOR(unit.actor, x, y);
					unit.actor.aimation_priority = 0;

					
					this.vctx.globalAlpha = 1;
				}
				
				if (window.RENDERING_MODE) {
					this.vctx.beginPath();
					if(unit instanceof Decoration) {this.vctx.strokeStyle = '#7a7a7a';}
					this.vctx.rect(x - unit.actor.width/2 + unit.actor.offset[0], y - unit.actor.height + unit.actor.offset[1], uam.width, uam.height);
					this.vctx.stroke();
					this.vctx.strokeStyle = 'black';
				}				
			} catch(err) {console.log("failed to draw unit", err);}
		}
		
		
		//Paint map
		if (window.RENDERING_MODE) {
			let scr = this;
			let pp = this.sp(camera.pos);
			this.vctx.beginPath();
			this.vctx.arc(pp[0], pp[1],20 * FIELD, 0, 2* Math.PI);
			this.vctx.stroke();
			F.for_radius(camera.pos, 20, function (i, j) {

				if (occupied(i, j)) {
					let rp = scr.sp([i ,j]);
					scr.vctx.beginPath();
					scr.vctx.rect(rp[0]-FIELD/2, rp[1]-FIELD/2, FIELD, FIELD);
					if(occupied(i,j).length > 0) {
						scr.vctx.fillStyle = "rgba(0, 0, 255, 0.5)";
					} else {
						scr.vctx.fillStyle = "rgba(255, 0, 0, 0.5)";
					}
					
					scr.vctx.fill();
				}
			});
		}
		
		for(let i of this.interface) {i.render();}
		
		
		//Drop virtual canvas onto the real one
		this.ctx.drawImage(this.virtual_canvas, 0, 0);
		
	}
	
	beginRendering() {
		let self = this;
		self.update();
		setInterval(function () {
			
			self.update();
			self.render();
		}, TICKRATE);
		
	}
	
	load() {
		
		//document.body.style.backgroundImage = "url(" + image + ")";
		//document.body.style.backgroundSize = "100% 100%";
		
		//Wait for load
		let self = this;
		let wait = setInterval(function () {
			let ready = true;
			for (let m of MODELS) {
				if(!m.loaded) {ready = false;}}
			if (ready) {
				clearInterval(wait);

				
				
				
				self.beginRendering();
				F.enlog("Map Center:", self.mc(0), self.mc(0));
				self.c.hidden = false;
				self.reload();
				
			}
		}, 10);
	}
	
	//get screen position of xy
	sp(xy) {
		return [field_to_pixels(xy[0] - camera.pos[0]) + Math.floor(this.ww / 2),
				field_to_pixels(xy[1] - camera.pos[1]) + Math.floor(this.wh / 2)];
	}
	
	mc(c) {return c + MAP_SIZE/2;}
	
}


Screen = new Screen();
window.Screen = Screen;
Screen.Tooltip = window.tooltip = new Tooltip();
window.messages = new Messages();
Screen.warning = function(txt) {
	window.messages.warning(txt);
};
Screen.message = function(txt, color = "white", warning = false) {
	window.messages.message(txt, color, warning);
};








