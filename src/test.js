// Services Section
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
	if(process.collision === true){
		document.querySelector('.overlay-metaball-item-center').style.color = 'white';
	}
	else {
		document.querySelector('.overlay-metaball-item-center').style.color = 'black';
	}
};


var onResize = function(event){
	process.init();
};


function detectMove(event){
	var adjustY, adjustX, posX, posY;
	event.preventDefault();
	var vw = (document.getElementById('services').offsetWidth - process.elementWidth) / 2;
	var vh = (document.getElementById('services').offsetHeight - process.elementHeight) / 2;
	var x = event.pageX - document.getElementById('services').offsetLeft - vw;
	var y = event.pageY - document.getElementById('services').offsetTop - vh;
	process.mouseX  = x;
	process.mouseY  = y;
}


var events = ["touchstart", "touchmove", "mousemove"];
events.forEach(function(event){
	document.body.addEventListener(event, detectMove, false);
});
