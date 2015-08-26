'use strict';

var iteration 	= [];
var ease 		= [];

var Metaball = function(options){
	this.container			= document.querySelector('.canvas-container');
	this.element			= document.getElementById('metaball');
	this.center				= null;
	this.elementWidth		= null;
	this.elementHeight		= null;
	this.collision 			= false;
	this.pathTrajectory		= null;
	this.timer 				= null;
	this.mouseX				= null;
	this.mouseY				= null;
	this.position 			= null;
	this.activeHover		= null;
	this.path 				= [];
	this.pathPositionY 		= [];
	this.pathPositionX 		= [];
	this.distanceToCenter	= [];
	this.circlePaths 		= [];
	this.goCenterPaths 		= [];
	this.activePaths 		= [];
	this.tx 				= [];
	this.ty 				= [];
	this.iteration 			= [];
	var defaults = {
		cellColor : [],
		trajectorySize  : 30,
		ballSize        : 10,
		handleRate		: 3.4
	};
	if (arguments[0] && typeof arguments[0] === "object") {
		this.options = _extendDefaults(defaults, arguments[0]);
	}
};

function _extendDefaults(source, properties) {
	var property;
	for (property in properties) {
		if (properties.hasOwnProperty(property)) {
			source[property] = properties[property];
		}
	}
	return source;
}

Metaball.prototype = {
	_setTrajectory : function() {
		if(this.pathTrajectory !== null){
			this.pathTrajectory.remove();
			this.pathPositionY = [];
			this.pathPositionX = [];
		}
		this.pathTrajectory = new Path.Circle({
			center: view.center,
			radius: this.element.clientWidth / 100 * this.options.trajectorySize,
			fillColor: 'white'
		});
		this.pathTrajectory.flatten(this.pathTrajectory.length/this.options.cellColor.length);
		this.pathTrajectory.smooth();
		this.pathTrajectory.rotate(90);
		for (var i = 0 ; i < this.pathTrajectory.segments.length; i++) {
			this.pathPositionY.push(this.pathTrajectory.segments[i]._point._y);
			this.pathPositionX.push(this.pathTrajectory.segments[i]._point._x);
		}
	},

	_setText : function() {
		var items, i, thisItem;
		items = document.body.querySelectorAll('.overlay-metaball-item');
		for(i = 0; i < items.length; i++){
			thisItem = items[i];
			thisItem.style.left = this.pathPositionX[i] + 'px';
			thisItem.style.top = this.pathPositionY[i] + 'px';
		}
	},

	_setMetaballAround : function() {
		if(this.circlePaths !== []){
			for(var i in this.circlePaths){
				var thisPath = this.circlePaths[i];
				var thisCenter = this.goCenterPaths[i];
				thisCenter.remove();
				thisPath.remove();
			}
			this.circlePaths = [];
			this.goCenterPaths = [];
		}
		for (var i= 0; i < this.options.cellColor.length; i++) {
			var circlePath = new Path.Circle({
				fillColor: 	this.options.cellColor[i],
				center: 	[this.pathPositionX[i],this.pathPositionY[i]],
				radius: 	this.element.clientWidth / 100 * this.options.ballSize
			});
			var goCenterPath = new Path.Circle({
				fillColor: 	this.options.cellColor[i],
				center: 	[this.pathPositionX[i],this.pathPositionY[i]],
				radius: 	this.element.clientWidth / 100 * (this.options.ballSize / 1.1)
			});
			this.circlePaths.push(circlePath);
			this.goCenterPaths.push(goCenterPath);
		}
	},

	_getDistanceToCenter : function() {
		var i, thisDistance, topPosition, leftPosition, updateX, updateY, toCenter, ball, vector_x, vector_y;
		this.distanceToCenter = [];
		for(i in this.goCenterPaths){
			ball = this.goCenterPaths[i];
			vector_x 				= ball.position._x;
			vector_y 				= ball.position._y;
			this.tx.push(vector_x);
			this.ty.push(vector_y);
			thisDistance 			= this.goCenterPaths[i];
			topPosition  			= this.ty[i];
			leftPosition 			= this.tx[i];
			updateX		 			= this.elementWidth / 2 - this.tx[i];
			updateY		 			= this.elementHeight / 2 - this.ty[i];
			toCenter 	 			= Math.sqrt((Math.pow(updateX,2)+Math.pow(updateY,2)));
			this.distanceToCenter.push(toCenter);
		}
	},

	_detectActiveBall : function(x, y) {
		var i, item_posY, item_posX, radius;
		for(i in this.circlePaths){
			item_posY = this.circlePaths[i].position._y;
			item_posX = this.circlePaths[i].position._x;
			radius = this.element.clientWidth / 100 * (this.options.ballSize * 1.2);
			if( x >= item_posX - radius &&
				x <= item_posX + radius &&
				y >= item_posY - radius &&
				y <= item_posY + radius
			){
				this.collision 	 = true;
				this.activeHover = i;
				break;
			} else {
				this.activeHover = null;
				this.collision 	 = false;
			}
		}
	},

	_generateConnections : function() {
		var i, thisConnection, center, active;
		for(i in this.goCenterPaths){
			if(this.path[i]){
				this.path[i].remove();
			}
			active 			= this.circlePaths[i];
			center 			= this.goCenterPaths[i];
			this.path[i] 	= this._metaball(center, active, .55, this.options.handleRate,	 this.elementWidth);
		}
	},

	_metaball : function(ball1, ball2, v, handleRate,	 maxDistance) {
		var center1 = ball1.position;
		var center2 = ball2.position;
		var radius1 = ball1.bounds.width / 2;
		var radius2 = ball2.bounds.width / 2;
		var pi2     = Math.PI / 2;
		var d       = center1.getDistance(center2);
		var u1, u2;
		if (radius1 === 0 || radius2 === 0){
			return;
		}
		if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
			return;
		} else if (d < radius1 + radius2) {
			u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
					(2 * radius1 * d));
			u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
					(2 * radius2 * d));
		} else {
			u1 = 0;
			u2 = 0;
		}
		var angle1 		= (center2 - center1).getAngleInRadians();
		var angle2 		= Math.acos((radius1 - radius2) / d);
		var angle1a 	= angle1 + u1 + (angle2 - u1) * v;
		var angle1b 	= angle1 - u1 - (angle2 - u1) * v;
		var angle2a 	= angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
		var angle2b 	= angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
		var p1a 		= center1 + this._getVector(angle1a, radius1);
		var p1b 		= center1 + this._getVector(angle1b, radius1);
		var p2a 		= center2 + this._getVector(angle2a, radius2);
		var p2b 		= center2 + this._getVector(angle2b, radius2);
		var totalRadius = (radius1 + radius2);
		var d2 			= Math.min(v * handleRate,	 (p1a - p2a).length / totalRadius);
		d2 		*= Math.min(1, d * 2 / (radius1 + radius2));
		radius1 *= d2;
		radius2 *= d2;
		var path = new Path({
			segments: [p1a, p2a, p2b, p1b],
			style: ball2.style,
			closed: true
		});
		var segments = path.segments;
		segments[0].handleOut = this._getVector(angle1a - pi2, radius1);
		segments[1].handleIn  = this._getVector(angle2a + pi2, radius2);
		segments[2].handleOut = this._getVector(angle2b - pi2, radius2);
		segments[3].handleIn  = this._getVector(angle1b + pi2, radius1);
		return path;
	},

	_getVector : function(radians, length) {
		return new Point({
			angle: radians * 180 / Math.PI,
			length: length
		});
	},

	set : function() {
		for(var i in this.options.cellColor) {
			iteration.push(0);
			ease.push(1);
		}
	},

	init : function() {
		this.center				= view.center;
		this.elementWidth		= this.element.clientWidth;
		this.elementHeight		= this.element.clientWidth;
		this._setTrajectory();
		this._setText();
		this._setMetaballAround();
		this._getDistanceToCenter();
	}
};

var process = new Metaball({
	cellColor : [
		'#3ECEAD',
		'#27CDCF',
		'#63C5E9',
		'#9FB9F6',
		'#CFABF4',
		'#EDA0E2'
	]
});
process.set();
process.init();

var onFrame = function(event){
	var i, thisStep, currentToCenter, updateY, updateX;
	var currentDistance = [];
	process._detectActiveBall(process.mouseX, process.mouseY);
	for (i in process.goCenterPaths){
		thisStep = process.goCenterPaths[i];
		updateX					= process.elementWidth / 2 - process.tx[i];
		updateY					= process.elementHeight / 2 - process.ty[i];
		currentToCenter			= Math.sqrt((Math.pow(updateX,2)+Math.pow(updateY,2)));
		currentDistance.push(currentToCenter);
		if(process.activeHover === i && process.collision === true){
			process.tx[i]		+= (process.elementWidth / 2 - process.tx[i]) * 0.08;
			process.ty[i]		+= (process.elementHeight / 2 - process.ty[i]) * 0.08;
			thisStep.position.x	= process.tx[i];
			thisStep.position.y	= process.ty[i];
			process._getDistanceToCenter();
			process._generateConnections(thisStep, process.circlePaths[i]);
			if(iteration[i] >= 53){
				thisStep.scale(1);
			}
			else if(iteration[i] <= 53) {
				iteration[i] = iteration[i] + 1;
				ease[i] = Math.sqrt(ease[i]) + 0.001;
				thisStep.scale(ease[i]);
			}
		}
		else if(process.activeHover !== i) {
			process.tx[i] 		-= (process.tx[i] - process.pathPositionX[i]) * 0.1;
			process.ty[i] 		-= (process.ty[i] - process.pathPositionY[i]) * 0.1;
			thisStep.position.x = process.tx[i];
			thisStep.position.y = process.ty[i];
			process._getDistanceToCenter();
			process._generateConnections(thisStep, process.circlePaths[i]);
			if(iteration[i] !== 1){
				iteration[i] = iteration[i] - 1;
				ease[i] = Math.sqrt(ease[i]) - 0.001;
				thisStep.scale(ease[i]);
				if(iteration[i] <= 1){
					iteration[i] = 1;
				}
			}
			if(currentDistance[i] > process.distanceToCenter[i]-0.05) { // -0.05 = hack for the animationFrame
				process.tx[i] 	= process.pathPositionX[i];
				process.ty[i] 	= process.pathPositionY[i];
			}
		}
	}
};

var onResize = function(event){
	process.init();
}

function detectMove(event){
	var adjustY, adjustX, posX, posY;
	event.preventDefault();
	adjustY 		= process.container.offsetTop;
	adjustX 		= process.container.offsetLeft;
	posX 			= (event.pageX-adjustX) + process.elementWidth / 2;
	posY 			= (event.pageY-adjustY) + process.elementHeight / 2;
	process.mouseX  = posX;
	process.mouseY  = posY;
}

var events = ["touchstart", "touchmove", "mousemove"];
events.forEach(function(event){
	process.container.addEventListener(event, detectMove, false);
});
