var canvas = $("#mainCanvas")[0];
canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.7;
var sizeY = canvas.height;
var sizeX = canvas.width;
var canvasRatio = canvas.width/canvas.height;
var showingRatio = 1;
var context = canvas.getContext('2d');
const MS = 10100, SPREAD_CONST = 3, G_CONST = 9.8;
var showingSpeed = MS-$("#speedRange").val();
start();
window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
		  window.setTimeout(callback, 1);
		};
	  })();

$(".randomize").click(function() {
	$(this).siblings().children("input").each(function() { 
		$(this).val(Math.random() * Math.floor(30));   
	});
});

$("#speedRange").on('input', function () {
	showingSpeed = MS-$(this).val();
});

$("#startBtn").click(function() {
	start();
});

function drawAxisLines(){
	context.beginPath();
	context.moveTo(0,canvas.height);
	context.lineTo(canvas.width,canvas.height);
	context.fillStyle = "#303030";
	context.stroke();
	context.beginPath();
	context.moveTo(0,canvas.height);
	context.lineTo(0,0);
	context.fillStyle = "#303030";
	context.stroke();
	//for(var y = 0; y<canvas.height; y+=)
}

function start(){
	var radius = Math.max(0,Math.min($("#radius1").val(), canvas.width/2));
	canvas.width = window.innerWidth * 0.7;
	canvas.height = window.innerHeight * 0.7;
	var x1 = Math.max($("#x1").val(), radius), y1 = Math.max($("#y1").val(), radius);
	var ball1 = {
	x: x1,
	y: y1,
	v: $("#v1").val(),
	k: $("#k1").val(),
	angle: $("#angle1").val(),
	radius: radius,
	color: '#F44336'
	};

	radius = Math.max(0,Math.min($("#radius2").val(), canvas.width/2));
	x2 = Math.max($("#x2").val(), radius);
	y2 = Math.max($("#y2").val(), radius);
	var ball2 = {
	x: x2,
	y: y2,
	v: $("#v2").val(),
	k: $("#k2").val(),
	angle: $("#angle2").val(),
	radius: radius,
	color: '#448AFF'
	};
	var maxPoint = Math.max(x1,x2,y1*canvasRatio,y2*canvasRatio);
	sizeY = (maxPoint/canvasRatio) * SPREAD_CONST;
	sizeX = maxPoint * SPREAD_CONST;
	showingRatio = canvas.width/sizeX;
	//console.log(canvas.width,sizeX,sizeY,showingRatio);
	context.clearRect(0, 0, canvas.width, canvas.height);

	drawBall(ball1, context);
	drawBall(ball2, context);

	var startTime = (new Date()).getTime();
	animate(ball1, ball2, canvas, context, startTime);
}

function drawBall(ball, context) {
	drawAxisLines();
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius*showingRatio, 0, 360, 0);
	context.fillStyle = ball.color;
	context.fill();
}

function animate(ball1, ball2, canvas, context, startTime) {
	console.log(Math.pow(ball1.x - ball2.x, 2), Math.pow(ball1.y - ball2.y, 2), Math.pow(ball1.radius + ball2.radius, 2));
	if (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) <= Math.pow(ball1.radius + ball2.radius, 2))
	{
		ball2.angle = [ball1.angle, ball1.angle = ball2.angle][0];
		ball2.v = [ball1.v, ball1.v = ball2.v][0];
	}
	var time = (new Date().getTime() - startTime) / showingSpeed;
	var posChanged = false;

	var newX = ball1.x + Math.cos(ball1.angle) * (ball1.v * time + ball1.k * G_CONST * Math.pow(time, 2) / 2);
	var newY = ball1.y + Math.sin(ball1.angle) * (ball1.v * time + ball1.k * G_CONST * Math.pow(time, 2) / 2);
	if (newX <= sizeX + 3*ball1.radius && newX > -3*ball1.radius && newY >= -3*ball1.radius && newY <= sizeY + 3*ball1.radius) {
		posChanged = true;
	}
	ball1.x = newX;
	ball1.y = newY;

	newX = ball2.x + Math.cos(ball2.angle) * (ball2.v * time + ball2.k * G_CONST * Math.pow(time, 2) / 2);
	newY = ball2.y + Math.sin(ball2.angle) * (ball2.v * time + ball2.k * G_CONST * Math.pow(time, 2) / 2);
	if (newX <= sizeX + 3*ball2.radius && newX > -3*ball2.radius && newY >= -3*ball2.radius && newY <= sizeY +3* ball2.radius) {
		posChanged = true;
	}
	ball2.x = newX;
	ball2.y = newY;
	if (posChanged){ 
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBall(ball1, context);
		drawBall(ball2, context);
		requestAnimationFrame(function() {
			animate(ball1, ball2, canvas, context, startTime);
		});
	}
}