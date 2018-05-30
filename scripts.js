var canvas = $("#mainCanvas")[0];
canvas.width = Math.ceil(window.innerWidth * 0.7 - (window.innerWidth * 0.7) % 100);
canvas.height = Math.ceil(window.innerHeight * 0.7 - (window.innerHeight * 0.7) % 100);
var sizeY = canvas.height;
var sizeX = canvas.width;
var canvasRatio = canvas.width/canvas.height;
var showingRatio = 1;
var globalID;
var context = canvas.getContext('2d');
var k = 0, u = 0;
var stop = false;
var animation = false;
const CENTER_CONST = 8, MS = 1000, SPREAD_CONST = 2, G_CONST = 9.8;
var showingSpeed = MS/Math.pow(10,$("#speedRange").val());
var walls = true;
const PI = Math.PI;
start();
window.requestAnimationFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
		  window.setTimeout(callback, 1000 / 60);
		};
})();
window.performance = window.performance || {};
performance.now = (function() {
return performance.now       ||
    performance.mozNow    ||
    performance.msNow     ||
    performance.oNow      ||
    performance.webkitNow ||
    function() {
        return new Date().getTime(); 
    };
})();

$(".randomize").click(function() {
	$(this).siblings().children("input").each(function() { 
		$(this).val(Math.random() * Math.floor(360));   
	});
});

$("#speedRange").on('input', function () {
	showingSpeed = MS/Math.pow(10,$("#speedRange").val());
});

$("#startBtn").click(function() {
	animation = false;
	window.setTimeout(function(){start()}, 100);
});


function drawAxisLines(){
	context.beginPath();
	context.font = ".8rem Roboto";
	context.fillStyle = "#303030";
	context.strokeStyle = "#303030";
	context.lineWidth=1;
	var shift = 0;
	for(var y = sizeY; y>=0; y-=sizeY/10)
	{
		if(y != sizeY)
		{
			context.moveTo(0,y*showingRatio);
			context.lineTo(10,y*showingRatio);
			context.fillText(Math.floor(sizeY-y),20,y*showingRatio);
		}
		else{
			context.fillText(0,2,sizeY*showingRatio - 2);
		}
		for(var y_m = y - sizeY/20; y_m > y - sizeY/10; y_m-=sizeY/20)
	{
		context.moveTo(0,y_m*showingRatio);
		context.lineTo(5,y_m*showingRatio);
	}
	}
	for(var x = 0; x<sizeX; x+=sizeX/10)
	{
		if(x != 0)
		{
			context.moveTo(x*showingRatio, canvas.height);
			context.lineTo(x*showingRatio, canvas.height-10);
			context.fillText(Math.floor(x), x*showingRatio - 10,canvas.height-20);
		}
		for(var x_m = x+sizeX/20; x_m<x+sizeX/10; x_m+=sizeX/20)
	{
		context.moveTo(x_m*showingRatio, canvas.height);
		context.lineTo(x_m*showingRatio, canvas.height-5);
	}
	}
	context.stroke();
}

function start(){
	var radius = Math.max(0,Math.min($("#radius1").val(), canvas.width/2));
	canvas.width = Math.ceil(window.innerWidth * 0.7 - (window.innerWidth * 0.7) % 100);
	canvas.height = Math.ceil(window.innerHeight * 0.7 - (window.innerHeight * 0.7) % 100);
	sizeY = canvas.height;
	sizeX = canvas.width;
	canvasRatio = canvas.width/canvas.height;
	u = parseFloat($("#u").val().replace(/,/g, "."));
	k = parseFloat($("#k").val().replace(/,/g, "."));

	var x1 = Math.max($("#x1").val(), radius), y1 = Math.max($("#y1").val(), radius);
	var angle = parseFloat($("#angle1").val() * PI/180);
	var ball1 = {
	sT: performance.now(),
	sX: x1,
	sY: y1,
	x: x1,
	y: y1,
	v: parseFloat($("#v1").val().replace(/,/g, ".")),
	vX: $("#v1").val() * Math.cos(angle),
	vY: $("#v1").val() * Math.sin(angle),
	cos: Math.cos(angle),
	sin: Math.sin(angle),
	angle: parseFloat(angle),
	radius: parseFloat(radius),
	m: parseFloat($("#mass1").val()),
	mainColor: '#F44336',
	subColor: '#962921',
	};

	radius = Math.max(0,Math.min($("#radius2").val(), canvas.width/2));
	x2 = Math.max($("#x2").val(), radius);
	y2 = Math.max($("#y2").val(), radius);
	angle = parseFloat($("#angle2").val() * PI/180);
	var ball2 = {
	sT: performance.now(),
	sX: x2,
	sY: y2,
	x: x2,
	y: y2,
	v: parseInt($("#v2").val()),
	vX: $("#v2").val() * Math.cos(angle),
	vY: $("#v2").val() * Math.sin(angle),
	cos: Math.cos(angle),
	sin: Math.sin(angle),
	angle: angle,
	radius: parseFloat(radius),
	m: parseInt($("#mass2").val()),
	mainColor: '#448AFF',
	subColor: '#275299',
	};
	var maxPoint = Math.max(x1,x2,y1*canvasRatio,y2*canvasRatio) * SPREAD_CONST;
	sizeY = maxPoint/canvasRatio;
	sizeX = maxPoint;
	showingRatio = canvas.width/sizeX;
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBalls(context, [ball1, ball2]);
	animation = true;
	$("#angle-info0").val("");
	animate(ball1, ball2, canvas, context, performance.now());
}

function drawArrow(context, ball){
	context.beginPath();
	var N = 1000/showingSpeed;
	fromx = ball.x*showingRatio;
	fromy = (1-ball.y/sizeY)*canvas.height;
	tox = ball.x*showingRatio+ball.vX*N*showingRatio + ball.vX*ball.radius/CENTER_CONST*showingRatio;
	toy = (1-ball.y/sizeY)*canvas.height-ball.vY*N*showingRatio-ball.vY*ball.radius/CENTER_CONST*showingRatio;
    var headlen = 0;
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.beginPath();
    context.lineWidth=ball.radius/30;
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-PI/8),toy+headlen*Math.sin(angle-PI/8));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+PI/8),toy+headlen*Math.sin(angle+PI/8));
    context.strokeStyle = ball.subColor;
	context.stroke();
}

function drawBall(context, ball) {
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius*showingRatio, 0, 360, 0);
	context.fillStyle = ball.mainColor;
	context.fill();
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius/CENTER_CONST*showingRatio, 0, 360, 0);
	context.fillStyle = ball.subColor;
	context.fill();
}

function drawBalls(context, balls) {
	for(var i = 0; i < balls.length; i++)
	{
		drawBall(context, balls[i]);
	}
	for(var i = 0; i < balls.length; i++)
	{
		drawArrow(context, balls[i]);
	}
	drawAxisLines();
}

function calculateCollision(ball1,ball2)
{
	while (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) <= Math.pow(ball1.radius + ball2.radius, 2))
		{
			ball1.x -= ball1.vX  * showingSpeed / 100000;
			ball1.y -= ball1.vY  * showingSpeed / 100000;
			ball2.x -= ball2.vX  * showingSpeed / 100000;
			ball2.y -= ball2.vY  * showingSpeed / 100000;
		}
		var newCoords = [ball1.x - ball2.x, ball1.y - ball2.y];
		var transAngle = Math.acos(newCoords[0] / Math.sqrt(newCoords[0] * newCoords[0] + newCoords[1] * newCoords[1]));
		$("#angle-info0").val(transAngle*180/PI);
		Math.sqrt(newCoords[0] * newCoords[0] + newCoords[1] * newCoords[1]);
		ball1.vX = (ball1.m * ball1.v * Math.cos(ball1.angle - transAngle) 
			+ ball2.m * ball2.v * Math.cos(ball2.angle-transAngle)
			- ball2.m*k*(ball1.v*Math.cos(ball1.angle-transAngle)-ball2.v*Math.cos(ball2.angle-transAngle)))
			/ (ball1.m + ball2.m) * Math.cos(transAngle) + ball1.v * Math.sin(ball1.angle-transAngle) * Math.cos(transAngle + PI/2);
		ball1.vY = (ball1.m * ball1.v * Math.cos(ball1.angle - transAngle) 
			+ ball2.m * ball2.v * Math.cos(ball2.angle-transAngle)
			- ball2.m*k*(ball1.v*Math.cos(ball1.angle-transAngle)-ball2.v*Math.cos(ball2.angle-transAngle)))
			/ (ball1.m + ball2.m) * Math.sin(transAngle) + ball1.v * Math.sin(ball1.angle-transAngle) * Math.sin(transAngle + PI/2);
		ball2.vX = (ball1.m * ball1.v * Math.cos(ball1.angle - transAngle) 
			+ ball2.m * ball2.v * Math.cos(ball2.angle-transAngle)
			- ball1.m*k*(ball2.v*Math.cos(ball2.angle-transAngle)-ball1.v*Math.cos(ball1.angle-transAngle)))
			/ (ball1.m + ball2.m) * Math.cos(transAngle) + ball2.v * Math.sin(ball2.angle - transAngle)*Math.cos(transAngle+PI/2);
		ball2.vY =  (ball1.m * ball1.v * Math.cos(ball1.angle - transAngle) 
			+ ball2.m * ball2.v * Math.cos(ball2.angle-transAngle)
			- ball1.m*k*(ball2.v*Math.cos(ball2.angle-transAngle)-ball1.v*Math.cos(ball1.angle-transAngle)))
			/ (ball1.m + ball2.m) * Math.sin(transAngle) + ball2.v * Math.sin(ball2.angle - transAngle)*Math.sin(transAngle+PI/2);
		ball1.angle = Math.atan(ball1.vY/ball1.vX);
		ball2.angle = Math.atan(ball2.vY/ball2.vX);
		ball1.cos = Math.cos(ball1.angle);
		ball2.cos = Math.cos(ball2.angle);
		ball1.sin = Math.sin(ball1.angle);
		ball2.sin = Math.sin(ball2.angle);
		ball1.v = Math.sqrt(ball1.vX*ball1.vX + ball1.vY*ball1.vY);
		ball2.v = Math.sqrt(ball2.vX*ball2.vX + ball2.vY*ball2.vY);
		ball1.sT = performance.now();
		ball2.sT = performance.now();
		ball1.sX = ball1.x;
		ball1.sY = ball1.y;
		ball2.sX = ball2.x;
		ball2.sY = ball2.y;
		console.log(ball1,ball2);
	return [ball1,ball2];
}
function wallCollision(balls)
{
	for(var i = 0; i < balls.length; i++)
	{
		if (balls[i].x > sizeX - balls[i].radius || balls[i].x < balls[i].radius)
		{
			if (balls[i].x > sizeX - balls[i].radius)
			{
				balls[i].x = sizeX - balls[i].radius;
			}
			else
				balls[i].x = balls[i].radius;
			balls[i].vX = -balls[i].vX;
			balls[i].sT = performance.now();
			balls[i].sX = balls[i].x;
			balls[i].sY = balls[i].y;
			balls[i].angle = Math.atan(balls[i].vY/balls[i].vX);
		}
		if (balls[i].y < balls[i].radius || balls[i].y > sizeY - balls[i].radius)
		{
			if (balls[i].y < balls[i].radius)
			{
				balls[i].y = balls[i].radius;
			}
			else
				balls[i].y = sizeY - balls[i].radius;
			balls[i].vY = -balls[i].vY;
			balls[i].sT = performance.now();
			balls[i].sY = balls[i].y;
			balls[i].sX = balls[i].x;
			balls[i].angle = Math.atan(balls[i].vY/balls[i].vX);
		}
	}
	return balls;
}
function animate(ball1, ball2, canvas, context) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	$("#angle-info1").val(Math.round(ball1.angle*180/PI*100)/100);
	$("#x-info1").val(ball1.x);
	$("#y-info1").val(ball1.y);
	$("#v-info1").val(Math.round(ball1.v*100)/100);
	$("#vX-info1").val(Math.round(ball1.vX*100)/100);
	$("#vY-info1").val(Math.round(ball1.vY*100)/100);

	$("#angle-info2").val(Math.round(ball2.angle*180/PI*100)/100);
	$("#x-info2").val(ball2.x);
	$("#y-info2").val(ball2.y);
	$("#v-info2").val(Math.round(ball2.v*100)/100);
	$("#vX-info2").val(Math.round(ball2.vX*100)/100);
	$("#vY-info2").val(Math.round(ball2.vY*100)/100);

	$("#distance-info").val(Math.sqrt(Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2)));

	time = (performance.now()-ball1.sT) / showingSpeed;
	ball1.x = ball1.sX + ball1.vX * time + u * G_CONST * Math.pow(time, 2) / 2;
	ball1.y = ball1.sY + ball1.vY * time + u * G_CONST * Math.pow(time, 2) / 2;
	time = (performance.now()-ball2.sT) / showingSpeed;
	ball2.x = ball2.sX + ball2.vX * time + u * G_CONST * Math.pow(time, 2) / 2;
	ball2.y = ball2.sY + ball2.vY * time + u * G_CONST * Math.pow(time, 2) / 2;
	if (walls)
		[ball1, ball2] = wallCollision([ball1, ball2]);
	if (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) <= Math.pow(ball1.radius + ball2.radius, 2))
	{
		[ball1,ball2] = calculateCollision(ball1,ball2);
	}
	drawBalls(context, [ball1, ball2]);
	if (animation)
		window.requestAnimationFrame(function() {animate(ball1, ball2, canvas, context)});
}