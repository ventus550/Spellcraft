/*jshint esnext: true */
/*jslint browser: true */

import {Time, Interface, Screen} from "./engine.js";
import {Corruption} from "./curses.js";


export class Button {
	constructor(parent, txt, width = 150) {
		this.body = document.createElement("div");
		Object.assign(this.body.style, {
			width : width,
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
		
		let button = document.createElement("div");
		this.body.append(button);
		button.style.marginTop = 8;
		button.textContent = "Spellcrafting";
		
		const self = this;
		this.body.onmouseover = function () {
			self.body.style.backgroundImage = "url(WindowButtonHovered.png)";	
		};
		this.body.onmouseout = function () {
			self.body.style.backgroundImage = "url(WindowButton.png)";	
		};
		
		
		parent.append(this.body);
	}
}



//Curses
class Curse extends Interface {
	constructor(title, description, img, type = "curse") {
		super();
		this.name = title;
		this.setTooltip(description);
		let color;
		switch(type) {
			case "curse":
				color = "rgba(200, 0, 255, 0.5)";
				break;
			case "greaterCurse":
				color = "rgba(255, 0, 0, 0.5)";
				break;
			case "blessing":
				color = "rgba(0, 150, 255, 0.5)";
		}
		
		Object.assign(this.body.style, {
			position : "static",
			display : "inline-block",
			margin : 5,
			width : 30,
			height : 30,
			backgroundColor : "rgba(200, 50, 200, 0.8)",
			backgroundImage : "url(" + img + ")",
			backgroundSize : "100% 100%",
			border : "4px outset " + color,
			borderRadius : "50px"
		});
		
	}
}

export class CurseBox extends Interface {
	constructor() {
		super();
		
		this.curses = {};
		this.blessings = {};
		
		Object.assign(this.body.style, {
			width : 300
		});
		
		this.curseSpan = document.createElement("span");
		this.body.appendChild(this.curseSpan);
		this.curseSpan.style.display = "block";
		
		this.blessingSpan = document.createElement("span");
		this.body.appendChild(this.blessingSpan);
		this.blessingSpan.style.display = "block";

	}
	
	last_curse() {
		const keys = Object.keys(this.curses);
		return keys[keys.length - 1];
	}
	
	addCurse(curse, isCurse = true) {
		let box;
		if(isCurse) {box = this.curses;}
		else {box = this.blessings;}
		
		
		if(box[curse]) {return false;}
		
		
		let curseItem,
			cr = new curse();
		
		if(isCurse) {
			if(Object.keys(this.curses).length >= 5) {
				curseItem = new Curse(cr.title, cr.description, cr.img, "greaterCurse");
			} else {
				curseItem = new Curse(cr.title, cr.description, cr.img);
			}
			
			this.curseSpan.appendChild(curseItem.body);
		} else {
			curseItem = new Curse(cr.title, cr.description, cr.img, "blessing");
			this.blessingSpan.appendChild(curseItem.body);
		}
		
		window.p.behaviours.push(cr);
		
		
		
		box[curse] = [curseItem.body, cr];
		return true;
	}
	
	addBlessing(blessing) {
		return this.addCurse(blessing, false);
	}
	
	removeCurse(curse, isCurse = true) {
		let box;
		if(isCurse) {box = this.curses;}
		else {box = this.blessings;}

		
		try {
			box[curse][0].remove();
			box[curse][1].remove();
			delete box[curse];
		} catch(err) {}	
	}
	
	removeBlessing(blessing) {
		this.removeCurse(blessing, false);
	}
}


//General purpose item slot
class Slot extends Interface {
	constructor(number, parent) {
		super();
		const border = 1,
			  size = 50,
			  margin = 10;
		
		this.item = undefined;
		this.parent = parent;
		this.active = true;
		
		
		
		//Item Slot
		this.ItemSlot = this.body;
		parent.appendChild(this.ItemSlot);

		this.ItemSlot.hidden = false;
		Object.assign(this.ItemSlot.style, {
			"position" : "static",
			"display" : "inline-block",
			"border" : border + "px solid #2f3332",
			"width" : size,
			"height" : size,
			"margin" : margin / 2,
			"backgroundImage" : "url(ItemEmptySlot.png)",
			"backgroundSize" : "100% 100%",
			"boxShadow" : "0px 0px 3px black"
		});

		//Item Image
		this.ItemImage = document.createElement("div");
		this.ItemSlot.appendChild(this.ItemImage);

		Object.assign(this.ItemImage.style, {
			"margin" : 2.5,
			"width" : size - 5,
			"height" : size - 5,
			"backgroundImage" : "url()",
			"backgroundSize" : "100% 100%",
			"boxShadow" : "0px 0px 3px black",
			"color" : "#615c5c",
			"textAlign" : "center",
			"userSelect" : "none"
			
		});
		
		
	}
	
	pushItem(item) {
		this.item = item;
		this.ItemImage.style.backgroundImage = "url(" + item.icon + ")";
		this.setTooltip(item.tooltip);
		this.name = item.name;
	}
}


//Event windows -----------------------------------------------------------
export class EventWindow extends Interface {
	constructor(title, description) {
		super();
		
		this.body.hidden = false;
		this.body.style.display = "hidden";
		this.isRemoved = false;
		
		//! MainBody
		Object.assign(this.body.style, {
			backgroundColor : "rgba(0,0,0,0.5)",
			width : "300px",
			userSelect : "none",
			padding : "10px",
			left : "10px"
		});
		let self = this;
		this.addEvent("reloaded", function () {
			self.body.style.top = (window.innerHeight - self.body.offsetHeight)/2 + "px";
		});
		
		
		//! Title
		let Title = document.createElement("div");
		Object.assign(Title.style, {
			color : "yellow",
			
			textAlign : "center",
			fontSize : "40px",
			margin : "10px",
			boxShadow : "2px 2px black",
			border : "1px solid black"
		});
		Title.textContent = title;
		this.body.appendChild(Title);
		
		
		//! Description
		let Description = document.createElement("div");
		Object.assign(Description.style, {
			width : "200px",
			fontStyle : "italic",
			marginLeft : "50px",
			color : "grey",
			textAlign : "center",
			fontSize : "15px"
		});
		Description.textContent = description;
		this.body.appendChild(Description);
		
		this.reload();
	}
	
	remove() {
		this.isRemoved = true;
		this.body.remove();
	}
}

//CHOICE WINDOW -----------------------------------------------------------------
export class ChoiceWindow extends EventWindow {
	constructor(title, description, choices = []) {
		super(title, description);
		let self = this;
		for(let choice of choices) {
			let button = document.createElement("div");
			Object.assign(button.style, {
				width : "200px",
				padding : "10px",
				marginLeft : "40px",
				marginTop : "10px",
				boxShadow : "3px 3px rgba(0, 0, 0, 0.5)",
				backgroundImage : "url(WindowButton.png)",
				backgroundSize : "100% 100%",
				
				textAlign : "center",
				color : "grey",
				textShadow: "2px 2px 3px rgba(0,0,0,0.5)",
				fontSize : "12px"
			});
			
			button.textContent = choice[0];
			button.onmouseover = function () {
				button.style.backgroundImage = "url(WindowButtonHovered.png)";	
			};
			button.onmouseout = function () {
				button.style.backgroundImage = "url(WindowButton.png)";	
			};
			button.onclick = function () {
				choice[1]();
				self.remove();
			};
			
			
			
			this.body.append(button);
			
		}
	}
}

//LOOT WINDOW ---------------------------------------------------------------------------
export class LootWindow extends EventWindow {
	constructor(title, description, items = [], max = items.length) {
		super(title, description);
		
		this.span = document.createElement("div");
		this.body.appendChild(this.span);
		this.count = 0;
		let rank = items.length > 3 ? 3 : items.length;
		
		Object.assign(this.span.style, {
				marginLeft : "auto",
				marginRight : "auto",
				maxWidth : rank * 60 + 10 + "px",       //"190px",
				padding : "10px",
				display : "block"
		});
		
		
		let self = this;
		function slotClick(slot) {
			return function (e) {
				e.stopPropagation();
				if(window.spellbar.pushItem(slot.item)) {
					self.count += 1;
					if(self.count === max) {
						self.remove();
					}
					slot.body.remove();
					window.tooltip.hide();
				} else {
					Screen.warning("Inventory is full");
				}
			};
		}
		
		
		
		
		for(let item of items) {
			let slot = new Slot(0, this.span);
			slot.pushItem(new item());
			slot.ItemImage.onclick = slotClick(slot);
			
		}
	}
}












//Spellbar -------------------------------------------------------------
class SpellbarSlot extends Slot{
	constructor(number, size, margin, parent) {
		super(number, parent);
		
		this.ItemImage.key = number+1;
		this.ItemSlot.style.transition = "box-shadow 0.05s, border-color 0.05s";
		
		
		//Events
		let self = this;
		this.ItemImage.onclick = function (e) {
			e.stopPropagation();
			self.use();
		};
		this.ItemImage.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();
			self.cleanse_slot();
			return false;
		}, false);
		window.addEventListener("keydown", function (e) {
			if(e.key == self.ItemImage.key) {
				self.use();
			}
			
		});
		
		this.addEvent("rendered", function () {
			if(self.active) {
				self.ItemImage.style.filter = "grayscale(0%)";
			} else {
				self.ItemImage.style.filter = "grayscale(100%)";
			}
		});


		//Slot Number
		let SlotNumber = document.createElement("div");
		this.ItemImage.appendChild(SlotNumber);
		SlotNumber.appendChild(document.createTextNode(this.ItemImage.key));
		SlotNumber.style.marginTop = "30px";
	}
	
	
	use() {
		if(this.item && !this.parent.hidden && this.active) {
			
			
			
			Object.assign(this.ItemSlot.style, {
				
				//borderColor : "rgba(255, 255, 255, 0.5)",
				boxShadow : "0px 0px 10px white"
			});
			
			let self = this;
			Time.after(3, function () {
				self.item.use();
				self.cleanse_slot();
				
				Object.assign(self.ItemSlot.style, {
					//borderColor : "#2f3332",
					boxShadow : "0px 0px 3px black"
				});
			});
			
			
		}
	}
	
	cleanse_slot() {
		this.item = undefined;
		this.ItemImage.style.backgroundImage = "url()";
		this.name = undefined;
		this.setTooltip(undefined);
	}
	
	pushItem(item) {
		this.item = item;
		this.ItemImage.style.backgroundImage = "url(" + item.icon + ")";
		this.setTooltip(item.tooltip);
		this.name = item.name;
	}
	
	isFree() {
		return !this.item;
	}
}


export class Spellbar extends Interface{
	
	constructor(num) {
		const size = 50,
			  margin = 10,
			  width = num * size + margin * (num + 1);
		
		
		super();
		
		this.slots = [];
		
		
		Object.assign(this.body.style, {
			"width" : width + "px",
			"height" : size + 10,
			"backgroundColor" : "#505257",
			"bottom" : "0px",
			"border" : "2px inset black",
			"boxShadow" : "0px 0px 20px black"
			
		});
		
		for(let i = 0; i < num; i++) {
			this.slots.push(new SpellbarSlot(i, size, margin, this.body));
		}
	}
	
	pushItem(Item) {
		for(let slot of this.slots) {
			if(slot.isFree()) {
				slot.pushItem(Item);
				return true;
			}
		}
		return false;
	}
}








// Statusbar ----------------------------------------------------------
export class StatusBar extends Interface {
	constructor(player) {
		super();
		
		this.bar_style = {
			width : "60px",
			height : "5px",
			borderRadius : "10px",
			pointerEvents : "none"
			
		};
		
		
		this.player = player;
		this.body.style.pointerEvents = "none";
		//Object.assign(this.body.style)
		
		
		
		this.empty_health = document.createElement("div");
		Object.assign(this.empty_health.style, this.bar_style);
		this.empty_health.style.backgroundColor = "black";
		this.body.appendChild(this.empty_health);
		
		this.health = document.createElement("div");
		Object.assign(this.health.style, this.bar_style);
		this.health.style.backgroundColor = "green";
		this.empty_health.appendChild(this.health);
		
		
		this.mana = document.createElement("span");
		this.mana.style.width = this.bar_style.width;
		this.mana.style.height = "10px";
		this.mana.style.pointerEvents = "none";
		this.body.appendChild(this.mana);
		
		
		this.mana_bubbles = [];
		this.make_bubbles();
		
		let self = this;
		
		this.addEvent("reloaded", function () {
			self.fixPosition();
		});
		
		
		this.addEvent("rendered", function () {
			let ratio = player.HP / player.MAX_HP;
			self.health.style.width = ratio * parseInt(self.bar_style.width, 10);
			
			if(player.barrier) {
				self.health.style.backgroundColor = "#ffffff";
			} else {
				self.health.style.backgroundColor = "rgb(" + 255 * (1 - ratio) + ", " + 150 * ratio + ", 50)";
			}
			
			
			if(self.mana_bubbles.length !== self.player.MAX_MANA) {
				for(let e of self.mana_bubbles) {e.remove();}
				self.mana_bubbles = [];
				self.make_bubbles();
			}
			
			for(let i = 0; i < self.player.MAX_MANA; i++) {
				if(i <= self.player.MANA - 1) {
					self.mana_bubbles[i].style.opacity = 1;
				} else {
					self.mana_bubbles[i].style.opacity = 0.5;
				}
				
				if(window.p.hasBehaviour(Corruption) && i+1 < self.player.MAX_MANA/2) {
					self.mana_bubbles[i].style.backgroundColor = "rgb(200, 0, 255)";
				} else {
					self.mana_bubbles[i].style.backgroundColor = "#4287f5";
				}
			}
		});
	}
	
	
		
	make_bubbles() {
		for (let i = 0; i < this.player.MAX_MANA; i++) {
			let tmp = document.createElement("div"),
				size = 7;
			
			tmp.style.width = tmp.style.height = size;
			tmp.style.backgroundColor = "#4287f5";
			tmp.style.borderRadius = "50px";
			tmp.style.display = "inline-block";
			tmp.style.pointerEvents = "none";
			tmp.style.marginRight = (parseInt(this.bar_style.width, 10) - this.player.MAX_MANA * size) / (this.player.MAX_MANA - 1) + "px";
			tmp.style.marginTop = 5;
			this.mana.appendChild(tmp);
			this.mana_bubbles.push(tmp);
		}	
	}	

	
	fixPosition() {
		this.body.style.left = (window.innerWidth - parseInt(this.bar_style.width, 10)) / 2 + "px";
		this.body.style.top = window.innerHeight / 2 + 20 + "px";
	}
	
}



















