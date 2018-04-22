var canvas = $("#mainCanvas")[0];
canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.7;
var sizeY = canvas.height;
var sizeX = canvas.width;
var canvasRatio = canvas.width/canvas.height;
var showingRatio = 1;
var context = canvas.getContext('2d');
const MS = 10100, SPREAD_CONST = 3;
var showingSpeed = MS-$("#speedRange").val();
start();
window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
		  window.setTimeout(callback, 1000 / 60);
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
	angle: $("#angle2").val(),
	radius: radius,
	color: '#448AFF'
	};
	var maxPoint = Math.max(x1,x2,y1*canvasRatio,y2*canvasRatio);
	sizeY = (maxPoint/canvasRatio) * SPREAD_CONST;
	sizeX = maxPoint * SPREAD_CONST;
	showingRatio = canvas.width/sizeX;
	console.log(canvas.width,sizeX,sizeY,showingRatio);
	context.clearRect(0, 0, canvas.width, canvas.height);

	drawBall(ball1, context);
	drawBall(ball2, context);

	setTimeout(function() {
	var startTime = (new Date()).getTime();
	animate(ball1, ball2, canvas, context, startTime);
	}, 100);
}

function drawBall(ball, context) {
	console.log(ball);
	drawAxisLines();
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius*showingRatio, 0, 360, 0);
	context.fillStyle = ball.color;
	context.fill();
}

function animate(ball1, ball2, canvas, context, startTime) {
	var time = (new Date()).getTime() - startTime;
	var posChanged = false;

	/* Здесь обработка движения и позиционирования */

	var newX = ball1.x + ball1.v * time / showingSpeed;
	if (newX <= sizeX - ball1.radius) {
		posChanged = true;
		ball1.x = newX;
	 }

	newX = ball2.x - ball2.v * time / showingSpeed;
	if (newX > ball2.radius) {
		posChanged = true;
		ball2.x = newX;
	}
	
	/* Конец */

	if (posChanged){ 
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBall(ball1, context);
		drawBall(ball2, context);
		requestAnimFrame(function() {
			animate(ball1, ball2, canvas, context, startTime);
		});
	}
}