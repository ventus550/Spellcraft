/*jshint esnext: true */
/*jslint browser: true */

export const Time = {
	"activeTimers" : [],
	"periodic" : function(time, func, id) {
		this.activeTimers.push([time, func, id, time]);
	},
	"after" : function(time, func, id = null) {
		this.activeTimers.push([time, func, id]);
	},
	"killTimers" : function(id) {
		this.activeTimers = this.activeTimers.filter(function(e) {return e[2] !== id;});
	},
	"time" : 0,
	"game_time" : 0
};
window.Time = Time;