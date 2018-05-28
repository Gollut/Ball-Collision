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
var animation;
const MS = 1000, SPREAD_CONST = 2, G_CONST = 9.8;
var showingSpeed = MS/Math.pow(10,$("#speedRange").val());
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
	console.log(Math.pow(10,$("#speedRange").val()));
	showingSpeed = MS/Math.pow(10,$("#speedRange").val());
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
	clearTimeout(animation);
	var radius = Math.max(0,Math.min($("#radius1").val(), canvas.width/2));
	canvas.width = Math.ceil(window.innerWidth * 0.7 - (window.innerWidth * 0.7) % 100);
	canvas.height = Math.ceil(window.innerHeight * 0.7 - (window.innerHeight * 0.7) % 100);
	sizeY = canvas.height;
	sizeX = canvas.width;
	canvasRatio = canvas.width/canvas.height;
	//u = parseFloat($("#u").val().replace(/,/g, "."));
	k = parseFloat($("#k").val().replace(/,/g, "."));
	var x1 = Math.max($("#x1").val(), radius), y1 = Math.max($("#y1").val(), radius);
	var ball1 = {
	x: x1,
	y: y1,
	v: parseFloat($("#v1").val().replace(/,/g, ".")),
	vX: $("#v1").val() * Math.cos($("#angle1").val() * Math.PI/180),
	vY: $("#v1").val() * Math.sin($("#angle1").val() * Math.PI/180),
	cos: Math.cos($("#angle1").val() * Math.PI/180),
	sin: Math.sin($("#angle1").val() * Math.PI/180),
	angle: parseFloat($("#angle1").val() * Math.PI/180),
	radius: parseFloat(radius),
	m: parseFloat($("#mass1").val()),
	mainColor: '#F44336',
	subColor: '#962921',
	};

	radius = Math.max(0,Math.min($("#radius2").val(), canvas.width/2));
	x2 = Math.max($("#x2").val(), radius);
	y2 = Math.max($("#y2").val(), radius);
	var ball2 = {
	x: x2,
	y: y2,
	v: parseInt($("#v2").val()),
	vX: $("#v2").val() * Math.cos($("#angle2").val() * Math.PI/180),
	vY: $("#v2").val() * Math.sin($("#angle2").val() * Math.PI/180),
	cos: Math.cos($("#angle2").val() * Math.PI/180),
	sin: Math.sin($("#angle2").val() * Math.PI/180),
	angle: parseInt($("#angle2").val() * Math.PI/180),
	radius: parseInt(radius),
	m: parseInt($("#mass2").val()),
	mainColor: '#448AFF',
	subColor: '#275299',
	};
	console.log(ball1,ball2);
	var maxPoint = Math.max(x1,x2,y1*canvasRatio,y2*canvasRatio) * SPREAD_CONST;
	sizeY = maxPoint/canvasRatio;
	sizeX = maxPoint;
	showingRatio = canvas.width/sizeX;
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBalls(context, [ball1, ball2]);
	animate(ball1, ball2, canvas, context, performance.now());
}

function drawArrow(context, ball){
	context.beginPath();
	var N = 4;
	fromx = ball.x*showingRatio;
	fromy = (1-ball.y/sizeY)*canvas.height;
	tox = ball.x*showingRatio+ball.vX*N*showingRatio;
	toy = (1-ball.y/sizeY)*canvas.height-ball.vY*N*showingRatio;
    var headlen = 0;
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.beginPath();
    context.lineWidth=ball.radius/30;
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/8),toy+headlen*Math.sin(angle-Math.PI/8));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/8),toy+headlen*Math.sin(angle+Math.PI/8));
    context.strokeStyle = ball.subColor;
	context.stroke();
}

function drawBall(context, ball) {
	context.beginPath();
	context.arc(ball.x*showingRatio, (1-ball.y/sizeY)*canvas.height, ball.radius*showingRatio, 0, 360, 0);
	context.fillStyle = ball.mainColor;
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

function calculateCollision(balls)
{
	for(var i = 0; i < balls.length-1; i++)
	{
		var newCoords = [balls[i].x - balls[i+1].x, balls[i].y - balls[i+1].y];
		var transCos = [(balls[i].x * newCoords[0] + balls[i].y * newCoords[1]) / Math.sqrt(balls[i].vX * balls[i].vX + balls[i].vY * balls[i].vY) *
		Math.sqrt(newCoords[0] * newCoords[0] + newCoords[1] * newCoords[1]),
		(balls[i+1].x * newCoords[0] + balls[i+1].y * newCoords[1]) / Math.sqrt(balls[i+1].vX * balls[i+1].vX + balls[i+1].vY * balls[i+1].vY) *
		Math.sqrt(newCoords[0] * newCoords[0] + newCoords[1] * newCoords[1])];
		balls[i].vX = (balls[i].m * balls[i].vX + balls[i+1].m * balls[i+1].vX - balls[i+1].m * k * (balls[i+1].vX - balls[i].vX))
		/ (balls[i].m + balls[i+1].m);
		balls[i + 1].vX = (balls[i].m * balls[i].vX + balls[i+1].m * balls[i+1].vX - balls[i].m * k * (balls[i].vX - balls[i + 1].vX))
		/ (balls[i].m + balls[i+1].m);
		//balls[i].vX = balls[i].v * transCos[0];
		//balls[i+1].vX = balls[i+1].v * transCos[1];

		balls[i].angle = Math.atan(balls[i].vY/balls[i].vX);
		balls[i+1].angle = Math.atan(balls[i+1].vY/balls[i+1].vX);
		balls[i].cos = Math.cos(balls[i].angle);
		balls[i + 1].cos = Math.cos(balls[i + 1].angle);
		balls[i].sin = Math.sin(balls[i].angle);
		balls[i+1].sin = Math.sin(balls[i + 1].angle);
		console.log(balls, newCoords, transCos);
		/*if (balls[i].cos != 0)
		{
			balls[i].v = balls[i].vX/balls[i].cos;
			balls[i+1].v = balls[i+1].vX/balls[i+1].cos;
		}
		else {
			balls[i].v = balls[i].vY/balls[i].sin;
			balls[i+1].v = balls[i+1].vY/balls[i+1].sin;
		}
		ball1.vX = (ball1.vX * ball1.m + ball2.m * ball2.vX) / (ball1.m + ball2.m);
		ball1.vY = (ball1.vY * ball1.m + ball2.m * ball2.vY) / (ball1.m + ball2.m);
		ball2.vX = ball1.vX;
		ball2.vY = ball1.vY;
		ball1.angle = ball2.angle = Math.atan(ball1.vY/ball1.vX);
		ball1.cos = ball2.cos = Math.cos(ball1.angle);
		ball1.sin = ball2.sin = Math.sin(ball1.angle);
		if (ball1.cos != 0)
		{
			ball1.v = ball1.vX/ball1.cos;
			ball2.v = ball2.vX/ball2.cos;
		}
		else {
			ball1.v = ball1.vY/ball1.sin;
			ball2.v = ball2.vY/ball2.sin;
		}*/
	}
	return balls;
}
function animate(ball1, ball2, canvas, context, startTime, prior) {
	$("#angle-info1").val(ball1.angle*180/Math.PI);
	$("#x-info1").val(ball1.x);
	$("#y-info1").val(ball1.y);
	$("#v-info1").val(ball1.v);
	$("#vX-info1").val(ball1.vX);
	$("#vY-info1").val(ball1.vY);

	$("#angle-info2").val(ball2.angle*180/Math.PI);
	$("#x-info2").val(ball2.x);
	$("#y-info2").val(ball2.y);
	$("#v-info2").val(ball2.v);
	$("#vX-info2").val(ball2.vX);
	$("#vY-info2").val(ball2.vY);
	console.log(Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2), Math.pow(ball1.radius + ball2.radius, 2));
	if (Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2) <= Math.pow(ball1.radius + ball2.radius, 2))
	{
		[ball1,ball2] = calculateCollision([ball1,ball2]);
		console.log(ball1,ball2);
	}
	var time = (performance.now() - startTime) / showingSpeed;
	var posChanged = false;

	newX = ball1.x + ball1.vX * time;
	newY = ball1.y + ball1.vY * time;
	if (newX <= sizeX + 10*ball1.radius && newX > -10*ball1.radius && newY >= -10*ball1.radius && newY <= sizeY + 10*ball1.radius) {
		posChanged = true;
	}
	ball1.x = newX;
	ball1.y = newY;

	//newX = ball2.x + ball2.vX * time + k * G_CONST * Math.pow(time, 2) / 2;
	//newY = ball2.y + ball2.vY * time + k * G_CONST * Math.pow(time, 2) / 2;
	newX = ball2.x + ball2.vX * time;
	newY = ball2.y + ball2.vY * time;
	ball2.x = newX;
	ball2.y = newY;
	if (newX <= sizeX + 2*ball2.radius && newX > -10*ball2.radius && newY >= -2*ball2.radius && newY <= sizeY + 2*ball2.radius)
	{
		posChanged = true;
	}
	if (posChanged)
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBalls(context, [ball1, ball2]);
		animation = setTimeout(function(){
			animate(ball1, ball2, canvas, context, startTime, false);
		}, 1)
		/*requestAnimationFrame(function() {
			animate(ball1, ball2, canvas, context, startTime);
		});*/
	}
	else{
		cancelAnimationFrame(globalID);
	}
}