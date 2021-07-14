/*jshint esnext: true */
/*jslint browser: true */

import {Interface} from "./engine.js";
import {Button} from "./interface.js";


export let SPELL = [];
window.spell = SPELL;


function int(txt) {return parseInt(txt, 10);}
const empty_icon = "ItemEmptySlot.png";


const Conduits = {

	Enchants : {
		
		Fire : {
			name : "Fire",
			TooltipText : "Fire Enchant",
			icon : "conduits/fire.png"
		}
	},
	
	Amplifiers : {
		
		Low : {
			name : "Low",
			TooltipText : "<>",
			icon : "conduits/amp1.png"
		},
		
		Medium : {
			name : "Medium",
			TooltipText : "<>",
			icon : "conduits/amp2.png"
		},
		
		High : {
			name : "High",
			TooltipText : "<>",
			icon : "conduits/amp3.png"
		}
		
	},
	
	Targetting : {
		
		Random : {
			name : "Random",
			TooltipText : "Random Target",
			icon : "conduits/fire.png"
		},
		
		Regular : {
			name : "Regular",
			TooltipText : "Regular Target",
			icon : "conduits/fire.png"
		}
		
		
	},
	
	Effects : {
		
		Missiles : {
			name : "Missiles",
			TooltipText : "Missles Conduit",
			icon : "conduits/missiles.png"
		},
		
		Projectile : {
			name : "Projectile",
			TooltipText : "Projectile Conduit",
			icon : "conduits/projectile.png"
		},
		
		Area : {
			name : "Area",
			TooltipText : "Area Conduit",
			icon : "conduits/area.png"
		}
	},
	
	empty_socket : {
		name : "Empty Socket",
		TooltipText : "Left click to insert conduit.",
		icon : empty_icon
	}
	
};


class Socket extends Interface {
		
	constructor(sc, column, row, type = Conduits.Effects) {
		super(sc.body);
		this.body.core = this;
		this.column = column;
		this.type = type;
		this.edges = [];
		this.back_edges = [];
		this.active = true;
		this.sc = sc;
		
		let h = int(sc.body.style.height),
			width = 50,
			height = 50;
		
		if(type === Conduits.Effects) {
			this.body.style.borderRadius = "50%";
			height *= 2;
			width *= 2;
		}
			
		
		Object.assign(this.body.style, {
			left : (column-1) * 250 - width/2 + 100,
			top : row * h/4 - height/2,
			width : width,
			height : height,
			border : "2px solid grey",
			backgroundColor : "rgba(255, 0, 0, 0.5)",
			backgroundSize : "100% 100%",
			transition : "0.5s opacity"
		});
		
		const self = this;
		this.body.onclick = function (e) {
			e.stopPropagation();
			if(self.active) {
				sc.selector.show(self);
			}
		};
		
		this.body.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();
			if(column !== 1 && column !== 2) {
				self.empty();
			}
			return false;
		}, false);
		
		this.empty();
		if(column !== 1) {
			this.deactivate();
		}
		
	}
	
	update() {
		Object.assign(this, this.conduit);
		this.setIcon(this.icon);
		
		this.sc.update();

	}
	
	empty() {
		this.conduit = Conduits.empty_socket;
		this.update();
	}
	
	socket(conduit = Conduits.Effects.Missiles) {
		this.conduit = conduit;
		this.update();		
	}
	
	activate() {
		this.active = true;
		this.setTooltip(this.conduit.TooltipText);
		this.body.style.transition = "0s opacity";
		this.body.style.opacity = 1.0;
	}
	
	deactivate() {
		this.active = false;
		this.setTooltip();
		this.body.style.transition = "0.5s opacity";
		this.body.style.opacity = 0.25;
	}
	
	setIcon(icon) {
		this.body.style.backgroundImage = "url(" + icon + ")";
	}
	
	isPowered() {
		let yes = true;
		for(let e of this.back_edges) {
			if(!e.active || e.conduit === Conduits.empty_socket) {yes = false;}
		}
		return yes;
	}
	
	get x() {
		return int(this.body.style.left) + int(this.body.style.width)/2 + int(this.body.style.borderWidth);
	}
	
	get y() {
		return int(this.body.style.top) + int(this.body.style.height)/2 + int(this.body.style.borderWidth);
	}
}

class ConduitElem extends Interface {
	constructor(parent, cond) {
		super();
		parent.body.appendChild(this.body);
		
		Object.assign(this.body.style, {
			width : int(parent.body.style.width) - 12,
			height : 30,
			backgroundColor : "rgba(0, 0, 0, 0.5)",
			backgroundImage : "url(WindowButton.png)",
			backgroundSize : "100% 100%",
			margin : 6,
			position : "static",
			display : "block"
		});
		
		const icon = document.createElement("div");
		this.body.appendChild(icon);
		Object.assign(icon.style, {
			width : int(this.body.style.height) * 0.75,
			height : int(this.body.style.height) * 0.75,
			margin : int(this.body.style.height) * 0.1,
			//border : "1px solid rgba(100, 100, 100, 0.5)",
			boxShadow : "0px 0px 2px 1px black inset",
			opacity : 0.8,
			backgroundImage : "url(" + cond.icon + ")",
			backgroundSize : "100% 100%",
			display : "inline-block"
		});
		
		const self = this.body;
		this.body.onmouseover = function () {
			self.style.backgroundImage = "url(WindowButtonHovered.png)";
		};
		
		this.body.onmouseout = function () {
			self.style.backgroundImage = "url(WindowButton.png)";
		};
		
		this.body.onclick = function () {
			parent.opened_socket.socket(cond);
			parent.hide();
			window.tooltip.hide();
		};
		
		
		
		const txt = document.createElement("div");
		this.body.appendChild(txt);
		Object.assign(txt.style, {
			width : 100,
			marginTop : "auto",
			marginBottom : "auto",
			height : int(this.body.style.height) * 0.75,
			color : "grey",
			textShadow: "2px 2px 3px rgba(0,0,0,0.5)",
			fontSize : "12px",
			textAlign : "center",
			display : "inline-block",
			userSelect : "none",
			pointerEvents : "none"
		});
		
		
		
		
		txt.textContent = cond.name;
		
		this.setTooltip(cond.TooltipText);
		this.name = "";
		
	}
}


class ConduitSelector extends Interface {
	constructor(parent) {
		super();
		this.conduits = [];
		this.opened_socket = undefined;
		
		parent.appendChild(this.body);
		Object.assign(this.body.style, {
			top : 0,
			left : 0,
			width : 150,
			margin : 50,
			backgroundColor : "rgba(0, 0, 0, 0.5)",
			display : "none",
			zIndex : 40
		});
		
		
				
	}
	
	show(socket) {
		
		this.hide();
		this.opened_socket = socket;
		
		for(let c in socket.type) {
			this.conduits.push(new ConduitElem(this, socket.type[c]));
		}
		
		//this.span.style.height = this.height();
		
		this.body.style.left = int(socket.body.style.left) - int(this.body.style.width)/2;
		this.body.style.top = int(socket.body.style.top) - int(socket.body.style.height)/2;
		this.body.style.display = "initial";
	}
	
	
	hide() {
		this.opened_socket = undefined;
		this.body.style.display = "none";
		for(let c of this.conduits) {
			c.body.remove();
		}
		this.conduits = [];
	}
}

class SpellCraft extends Interface {
	constructor() {
		super();
		this.isReady = false;
		this.effects = [];
		
		this.hide();
		const self = this;
		
		Object.assign(this.body.style, {
			width : 800,
			height : 500,
			backgroundColor : "rgba(0, 0, 0, 1)"
		});
		
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("draggable", false);
		this.canvas.style.pointerEvents = "none";
		this.body.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");
		this.ctx.lineCap = "round";
		
		this.selector = new ConduitSelector(this.body);
		
		
		
		
		
		
		
		this.addEvent("reloaded", function () {
			Object.assign(self.body.style, {
				left : (window.innerWidth - int(self.body.style.width)) / 2 + "px",
				top : (window.innerHeight - int(self.body.style.height)) / 2 + "px",
				backgroundColor : "rgba(0, 0, 0, 0.5)"
			});
		});
		
		this.mouse = {
			posX : 0,
			down : false
		};
		this.body.addEventListener("mousedown", () => {self.mouse.down = true;});
		window.addEventListener("mouseup", () => {self.mouse.down = false;});
		//this.body.addEventListener("mouseleave", () => {self.mouse.down = false; });
		//this.body.addEventListener("mouseout", () => {self.mouse.down = false; });
		this.body.addEventListener("mousemove", (e) => self.HorizontalScroll(e));
		this.body.addEventListener("click", () => self.selector.hide());
		
		
		
		
		
		
		this.firstNode = this.lastNode = null;
		for(let i = 1; i <= 7; i++) {
			let sck;
			if(i % 2 !== 0) {
				sck = [ new Socket(this, i, 2) ];
				this.effects.push(sck[0]);
				
				if(!this.firstNode) {
					this.firstNode = sck[0];
					this.lastNode = sck;
				} else {
					for(let node of this.lastNode) {
						node.edges = sck;
					}
					sck[0].back_edges = this.lastNode;
				}
				
			} else {
				sck = [new Socket(this, i, 1, Conduits.Enchants),
					   new Socket(this, i, 2, Conduits.Targetting),
					   new Socket(this, i, 3, Conduits.Amplifiers)];
				
				this.lastNode[0].edges = sck;
				for(let s of sck) {
					s.back_edges = this.lastNode;
				}
			}
			this.lastNode = sck;	
		}
		this.isReady = true;
		
		//Fill starting conduits
		this.firstNode.socket(Conduits.Effects.Missiles);
		this.firstNode.edges[0].socket(Conduits.Enchants.Fire);
		this.firstNode.edges[1].socket(Conduits.Targetting.Regular);
		this.firstNode.edges[2].socket(Conduits.Amplifiers.Low);
		
		
		
		
		this.canvas.width = int(this.lastNode[0].body.style.left) + int(this.lastNode[0].body.style.width)/2 + 100;
		this.canvas.height = int(this.body.style.height);
		
		
		this.update();
	}
	
	HorizontalScroll(e) {
		if(this.mouse.down) {
			const diff = this.mouse.posX - e.clientX;
			this.body.scrollBy(diff, 0);
		}
		this.mouse.posX = e.clientX;
	}
	
	update() {
		if(!this.isReady){return;}
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		const self = this;
		function edgeDraw(src, dst) {
			
			if(src.column > window.p.level) {return false;}
			
			if(dst.isPowered()) {
				
				dst.activate();
				self.line([src.x, src.y],
					  [dst.x, dst.y]);
				
				
				if(dst.conduit !== Conduits.empty_socket) {
					self.line([src.x, src.y],
					  [dst.x, dst.y], "#6ba1ff", 8);
				}
				
			} else {
				//dst.empty();
				dst.deactivate();
			}
			
			
			
			
			for(let e of dst.edges) {
				edgeDraw(dst, e);
			}
		}
		
		edgeDraw(this.firstNode, this.firstNode);
		this.translate();
	}
	
	translate() {
		SPELL = [];
		for(let i = 0; i < 3; i++) {
			SPELL.push({
				Effect : this.effects[i].conduit.name,
				Enchant : this.effects[i].edges[0].conduit.name,
				Target : this.effects[i].edges[1].conduit.name,
				Amplifier : this.effects[i].edges[2].conduit.name
			});
		}
	}
	
	line(src, dst, color = "#2d3138", width = 15) {
		const ctx = this.ctx;
		
		ctx.beginPath();
		ctx.moveTo(src[0], src[1]);
		ctx.lineWidth = width;
		ctx.lineTo(dst[0], dst[1]);
		ctx.strokeStyle = color;
		ctx.stroke();
	}
}

export class SpellCraftingButton extends Interface {
	constructor() {
		super();
		this.sc = new SpellCraft();
		Object.assign(this.body.style, {
			width : 150,
			height : 30,
			bottom : 65,
			backgroundImage : "url(WindowButton.png)",
			backgroundSize : "100% 100%",
			textAlign : "center",
			color : "grey",
			textShadow: "2px 2px 3px rgba(0,0,0,0.5)",
			fontSize : "12px",
			userSelect : "none"
		});
		
		
		const button = new Button(this.body, "Spellcrafting");
		const self = this;
		button.body.onclick = function () {
			if(self.sc.visible) {
				self.sc.hide();
			} else {
				self.sc.show();
			}
		};
	}
}














