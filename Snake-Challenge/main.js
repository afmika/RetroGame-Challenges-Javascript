const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const div = 25;
const dim = canvas.width / div;
let snake = [];
let peach = null;
let queue = null;
let dx = 0;
let dy = 1;


function square(x, y, color) {
	ctx.fillStyle = color || 'black';
	ctx.fillRect(x * dim, y * dim, dim, dim);
}

function rand() {
	return Math.floor(Math.random() * canvas.width / div);
}

function newPeach() {
	peach = { x : rand(), y : rand()};
}

function newGame() {
	snake = [];
	peach = null;
	queue = null;
	dx = 0;
	dy = 1;
	newPeach();
	for (let i = 5; i <= 5 + 2; i++) {
		snake.push({x : i, y : 5});
	}
}

function udpate () {
	let result = [];
	let head = {x : snake[0].x + dx, y : snake[0].y + dy };
	queue = snake.pop();
	result.push(head);
	for (let i = 0; i < snake.length; i++ ) {
		result.push( snake[i] );
	}
	snake = result;

	if ( head.x == peach.x && head.y == peach.y ) {
		result.push(queue);
		newPeach();
	}
}

function draw () {
	for (let i = 0; i < snake.length; i++) {
		const s = snake[i];
		square(s.x, s.y);
	}
}

function collides() {
	let head = snake[0];
	for (let i = 1; i < snake.length; i++) {
		if ( head.x == snake[i].x && head.y == snake[i].y ) {
			return true;
		}
	}
	let xx = head.x * dim;
	let yy = head.y * dim;
	if ( xx < 0 || yy < 0 || xx + dim >= canvas.width || yy + dim >= canvas.height ) {
		return true;
	}
	return false;
}

function animate() {
	if ( peach == null ) {
		newGame();
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	square(peach.x, peach.y, 'red');
	if ( !collides() ) {
		udpate();
	} else {
		newGame();
	}
	draw();

	document.getElementById("text").innerHTML = snake.length;
}

document.addEventListener('keyup', e => {
	let up = 38, down = 40, 
		left = 37, right = 39;
	switch(e.keyCode) {
		case up:
			if ( dy <= 0 ) dy = -1;
			dx = 0;
			break;
		case down:
			if ( dy >= 0 ) dy = 1;
			dx = 0;
			break;
		case left:
			dy = 0;
			if ( dx <= 0 ) dx = -1;
			break;
		case right:
			dy = 0;
			if ( dx >= 0 ) dx = 1;
			break;
	}
});

setInterval(animate, 80);