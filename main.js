/*jshint esnext: true */
/*jslint browser: true */
import {Screen, Missile, Effects, MAP_RESET, MAP_SIZE, Time, load_terrain, rand} from "./engine.js";



import * as Models from "./models.js";
import {Player} from "./player.js";
import {Spellbar, StatusBar, CurseBox} from "./interface.js";
import {DarkForest} from "./zones/dark_forest.js";
import * as Items from "./items.js";
import * as SpellEffects from "./spell_effects.js";
import * as Events from "./events.js";
import {Portal} from "./monsters.js";
import {Thorns, Hope, Purity, removeLastCurse} from "./curses.js";
import {SpellCraftingButton} from "./spellcrafting.js";






Screen.load("loading_screen.png");
let mc = Screen.mc;



//Make player unit
window.p = new Player(mc(5), mc(0), 3, Models.mage);


//Set up interface
let spellbar = new Spellbar(5),
	statusbar = new StatusBar(window.p),
	cursebox = new CurseBox(),
	spellcraft = new SpellCraftingButton();

window.cb = cursebox;
window.sc = spellcraft;
window.spellbar = spellbar;

window.addBox = function () {
	spellbar.pushItem(new Items.CursedBox());
	spellbar.pushItem(new Items.CursedBox());
	spellbar.pushItem(new Items.CursedBox());
	spellbar.pushItem(new Items.CursedBox());
	spellbar.pushItem(new Items.MysteriousTome());
};
window.addBox();





function ZoneSwitch(zone, monster_power) {
	
	function portal_coloring(val) {
		if(val === 0) {
			Screen.setShadows();
			return;}
		let r = val/20;
		window.p.actor.color = "rgba(138,43,226, " + val/20 + ")";
		Screen.setShadows(1000, "rgb(" + 138*r + ", " + 43*r + ", " + 226*r + ")");
		Time.after(2, function () {
			portal_coloring(val - 1);
		});
	}
	
	
	
	Screen.setShadows(1000, "rgb(138,43,226)");
	
	MAP_RESET();
	window.p.pos = [MAP_SIZE/2, MAP_SIZE/2];
	new zone(monster_power);
	
	let portal = new Portal(window.p.pos[0] + 5, window.p.pos[1] - 5);
	statusbar.hide();
	spellbar.hide();
	
	Time.after(20, function () {
		window.p.actor.facing = "left";
		window.p.map_attach();
		portal.close();
		statusbar.show();
		spellbar.show();
		load_terrain();
		new Events.LostSoul(window.p.pos[0] - 30, window.p.pos[1] + rand(-40, 40));
		new Events.Chest(window.p.pos[0] - 50, window.p.pos[1] + rand(-40, 40));
		portal_coloring(20);
		
		if(window.p.hasBehaviour(Purity)) {
			removeLastCurse();
		}
		
		if(window.p.hasBehaviour(Thorns)) {
			window.p.HP *= 0.5;
		}

		if(window.p.hasBehaviour(Hope)) {
			window.p.MAX_HP *= 1.1;
		}
		
	});
}
window.nextLevel = function () {
	console.log("switching zones!");
};


//Flamebolt
class Flamebolt extends Missile {
	constructor(source, point, destination) {
		super(point, Models.flamebolt);
		this.source = source;
		this.speed = 2;
		this.move_to(destination);
		this.actor.color = "rgb(10, 255, 255)";
		let self = this;
		
		this.addEvent("updated", function () {
			if(self.moveQueue.length === 0) {
				self.kill();
			}
		});
		this.addEvent("death", function () {
			self.actor.replace_model(Models.explosion_fire);
			self.actor.set("Death");

			Effects.AreaOfEffect(self.source, 10,
								Effects.ApplyBehaviour(self.source, SpellEffects.Ignite), ["Hostile"])(self);
			
			/*
			Effects.ClosestUnitToPoint(self.source, 20, ["Neutral"],
									  Effects.LaunchMissile(self.source, self.pos, Flamebolt),
									  ["Missile"])(self);
			*/
			
			/*
			Effects.RandomPointInRadius(self.source, 100,
									  Effects.LaunchMissile(self.source, self.pos, Flamebolt))(self);
			
			*/
			
			
			//Effects.CreateUnit(self.source, Wild, 0)(pp);
		});
	}
}

for(let i = 0; i < 4; i++) {
	window.p.cast.effects[i] = Effects.Dummy(window.p, function(target) {
		let arr = [];
		arr.push(Effects.LaunchMissile(window.p, window.p.lpoint(0), Flamebolt));
		for(let e = 0; e < i; e++) {
			arr.push(Effects.RandomPointInRadius(window.p, 20,
								   Effects.LaunchMissile(window.p, window.p.lpoint(0), Flamebolt)));
		}
		
		Effects.Set(window.p, arr)(target);
	});
}

ZoneSwitch(DarkForest, 0);
window.swap = function () {ZoneSwitch(DarkForest, 0);};
window.p.level = 7;
