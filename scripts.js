var canvas = $("#mainCanvas")[0];
canvas.width = Math.ceil(window.innerWidth * 0.7 - (window.innerWidth * 0.7) % 100);
canvas.height = Math.ceil(window.innerHeight * 0.7 + 100 - (window.innerHeight * 0.7) % 100);
var sizeY = canvas.height;
var sizeX = canvas.width;
var canvasRatio = canvas.width/canvas.height;
var showingRatio = 1;
var globalID;
var context = canvas.getContext('2d');
var k = 0;
const MS = 10100, SPREAD_CONST = 2, G_CONST = 9.8;
var showingSpeed = MS-$("#speedRange").val();
start();
window.requestAnimFrame = (function(callback) {
		globalID = (
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimaationFrame ||
            function(callback, element) {
                //Doh! Crap browser!
                window.setTimeout(callback, 1000/60);
            }
        )
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
	showingSpeed = MS-$(this).val();
});

$("#startBtn").click(function() {
	start();
});

function findCloserTen(a){
	var res = 0, t = 1;
	while (t < a)
	{
		res += 1;
		t *= 10;
	}
	return t;
}
function drawAxisLines(){
	context.font = "12px Arial";
	context.fillStyle = "#303030";
	context.beginPath();
	context.moveTo(0,canvas.height);
	context.lineTo(canvas.width,canvas.height);
	context.moveTo(0,canvas.height);
	context.lineTo(0,0);
	//var ten = findCloserTen(sizeY);
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
	ten = findCloserTen(sizeX);
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
	canvas.height = Math.ceil(window.innerHeight * 0.7 + 100 - (window.innerHeight * 0.7) % 100);
	sizeY = canvas.height;
	sizeX = canvas.width;
	canvasRatio = canvas.width/canvas.height;
	k = parseFloat($("#k").val().replace(/,/g, "."));
	var x1 = Math.max($("#x1").val(), radius), y1 = Math.max($("#y1").val(), radius);
	var ball1 = {
	x: x1,
	y: y1,
	v: parseFloat($("#v1").val().replace(/,/g, ".")),
	u: parseFloat($("#u1").val().replace(/,/g, ".")),
	vX: $("#v1").val() * Math.cos($("#angle1").val()),
	vY: $("#v1").val() * Math.sin($("#angle1").val()),
	cos: Math.cos($("#angle1").val()),
	sin: Math.sin($("#angle1").val()),
	angle: parseFloat($("#angle1").val()),
	radius: parseFloat(radius),
	m: parseFloat($("#mass1").val()),
	color: '#F44336'
	};

	radius = Math.max(0,Math.min($("#radius2").val(), canvas.width/2));
	x2 = Math.max($("#x2").val(), radius);
	y2 = Math.max($("#y2").val(), radius);
	var ball2 = {
	x: x2,
	y: y2,
	v: parseInt($("#v2").val()),
	u: parseInt($("#u2").val()),
	vX: $("#v2").val() * Math.cos($("#angle2").val()),
	vY: $("#v2").val() * Math.sin($("#angle2").val()),
	cos: Math.cos($("#angle2").val()),
	sin: Math.sin($("#angle2").val()),
	angle: parseInt($("#angle2").val()),
	radius: parseInt(radius),
	m: parseInt($("#mass2").val()),
	color: '#448AFF'
	};
	var maxPoint = Math.max(x1,x2,y1*canvasRatio,y2*canvasRatio) * SPREAD_CONST;
	sizeY = maxPoint/canvasRatio;
	sizeX = maxPoint;
	showingRatio = canvas.width/sizeX;
	context.clearRect(0, 0, canvas.width, canvas.height);

	drawBall(ball1, context);
	drawBall(ball2, context);

	animate(ball1, ball2, canvas, context, performance.now());
}

function drawBall(ball, context) {
	drawAxisLines();
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius*showingRatio, 0, 360, 0);
	context.fillStyle = ball.color;
	context.fill();
}

function animate(ball1, ball2, canvas, context, startTime) {
	if (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) <= Math.pow(ball1.radius + ball2.radius, 2))
	{
		temp = ball1.cos;
		/*ball1.cos = (2 * ball2.m * Math.abs(ball2.v) * ball2.cos - Math.abs(ball1.v) * ball1.cos * (ball2.m - ball1.m)) 
		/ (Math.abs(ball1.v) * (ball1.m + ball2.m));
		ball2.cos = (2 * ball1.m * Math.abs(ball1.v) * temp - Math.abs(ball2.v) * ball2.cos * (ball1.m - ball2.m)) 
		/ (Math.abs(ball2.v) * (ball2.m + ball1.m));
		ball1.angle = Math.acos(ball1.cos);
		ball1.sin = Math.sin(ball1.angle);
		ball2.angle = Math.acos(ball2.cos);
		ball2.sin = Math.sin(ball2.angle);*/

		var v1 = ball1.v;
		ball1.v = (ball1.m * ball1.v + ball2.m * ball2.v - ball2.m * k * (ball1.v - ball2.v))/
		(ball1.m + ball2.m);
		ball2.v = (ball1.m * v1 + ball2.m * ball2.v - ball1.m * k * (ball2.v - v1))/
		(ball1.m + ball2.m);
		console.log(k, ball1, ball2);
		//ball2.angle = [ball1.angle, ball1.angle = ball2.angle][0];
		//ball2.v = [ball1.v, ball1.v = ball2.v][0];
	}
	var time = (performance.now() - startTime) / showingSpeed;
	var posChanged = false;

	var newX = ball1.x + ball1.cos * (ball1.v * time + k * G_CONST * Math.pow(time, 2) / 2);
	var newY = ball1.y + ball1.sin * (ball1.v * time + k * G_CONST * Math.pow(time, 2) / 2);
	if (newX <= sizeX + 10*ball1.radius && newX > -10*ball1.radius && newY >= -10*ball1.radius && newY <= sizeY + 10*ball1.radius) {
		posChanged = true;
	}
	ball1.x = newX;
	ball1.y = newY;

	newX = ball2.x + ball2.cos * (ball2.v * time + k * G_CONST * Math.pow(time, 2) / 2);
	newY = ball2.y + ball2.sin * (ball2.v * time + k * G_CONST * Math.pow(time, 2) / 2);
	ball2.x = newX;
	ball2.y = newY;
	if (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) < Math.pow(ball1.radius + ball2.radius, 2))
	{
		var new1X = ball1.x - (ball1.radius + ball2.radius - Math.abs(ball1.x - ball2.x)) * ball1.v / (Math.abs(ball1.v) + Math.abs(ball2.v)) * ball2.radius/ball1.radius;
		var new2X = ball2.x - (ball1.radius + ball2.radius - Math.abs(ball1.x - ball2.x)) * ball2.v / (Math.abs(ball1.v) + Math.abs(ball2.v)) * ball1.radius/ball2.radius;
		console.log(Math.abs(ball1.x - ball2.x), (ball1.radius + ball2.radius), 
			ball1.radius/ball2.radius, ball1.v, ball2.v);
		ball1.x = new1X;
		ball2.x = new2X;
	}
	if (newX <= sizeX + 10*ball2.radius && newX > -10*ball2.radius && newY >= -10*ball2.radius && newY <= sizeY + 10*ball2.radius)
	{
		posChanged = true;
	}
	if (posChanged)
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBall(ball1, context);
		drawBall(ball2, context);
		requestAnimationFrame(function() {
			animate(ball1, ball2, canvas, context, startTime);
		});
	}
	else{
		cancelAnimationFrame(globalID);
	}
}