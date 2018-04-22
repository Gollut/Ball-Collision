var canvas = $("#mainCanvas")[0];
canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.8;
var context = canvas.getContext('2d');
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

$("#startBtn").click(function() {
	start();
});

function start(){
	var radius = Math.max(0,Math.min($("#radius1").val(), canvas.width/2));
	canvas.width = window.innerWidth * 0.7;
	canvas.height = window.innerHeight * 0.8;
	var ball1 = {
	x: Math.min(Math.max($("#x1").val(), radius), canvas.width-radius),
	y: Math.max(Math.min(canvas.height-$("#y1").val(), canvas.height-radius), radius),
	v: $("#v1").val(),
	radius: radius,
	color: '#F44336'
	};

	var radius = Math.max(0,Math.min($("#radius2").val(), canvas.width/2));

	var ball2 = {
	x: Math.min(Math.max($("#x2").val(), 2*radius), canvas.width-2*radius),
	y: Math.max(Math.min(canvas.height-$("#y2").val(), canvas.height-radius), radius),
	v: $("#v2").val(),
	radius: radius,
	color: '#448AFF'
	};
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
	context.beginPath();
	context.arc(ball.x, ball.y, ball.radius, 0, 360, 0);
	context.fillStyle = ball.color;
	context.fill();
}

function animate(ball1, ball2, canvas, context, startTime) {
	var time = (new Date()).getTime() - startTime;
	var posChanged = false;
	var newX = ball1.x + ball1.v * time / 1000;
	if (newX < canvas.width - ball1.radius) {
		posChanged = true;
		ball1.x = newX;
	 }

	newX = ball2.x - ball2.v * time / 1000;
	if (newX > ball2.radius) {
		posChanged = true;
		ball2.x = newX;
	}
	if (posChanged){ 
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBall(ball1, context);
		drawBall(ball2, context);
		requestAnimFrame(function() {
			animate(ball1, ball2, canvas, context, startTime);
		});
	}
}