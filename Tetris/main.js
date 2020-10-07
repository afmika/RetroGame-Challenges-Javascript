const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cols = 15;
const dim = canvas.width / cols;
let rows = Math.floor(canvas.height / dim);

const board = new Board(cols, rows);

let current = null;
let score = 0;


const objects = [
	new Brick([
		[1, 0],
		[1, 0],
		[1, 1],
	]),
	new Brick([
		[0, 1],
		[0, 1],
		[1, 1],
	]),
	new Brick([
		[1, 1],
		[1, 1],
	]),
	new Brick([
		[1, 0],
		[1, 1],
		[1, 0],
	]),
	new Brick([
		[1],
		[1],
		[1],
		[1],
	])
];




function pickRandomBrick() {
	let r = Math.random() * objects.length;
	return new Brick( objects[ Math.floor(r) ].m );
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function displayInfos() {
	document.getElementById("infos").innerText = `Score ${ score }`;
}


function drawBrick( brick ) {
	let m = brick.m;
	ctx.fillStyle = 'white';
	for (let y = 0; y < m.length; y++) {
		for (let x = 0; x < m[y].length; x++) {
			if ( m[y][x] == 1 ) {
				ctx.fillRect((brick.x + x) * dim, (brick.y + y) * dim, dim, dim);
			}
		}
	}
}

function drawBoard() {
	let m = board.m;
	ctx.fillStyle = 'white';
	for (let y = 0; y < m.length; y++) {
		for (let x = 0; x < m[y].length; x++) {
			if ( m[y][x] == 1 ) {
				ctx.fillRect(x * dim, y * dim, dim, dim);
			}
		}
	}
}

current = pickRandomBrick();


function loopAndCheck() {
	current.y++;
	if ( board.collidesWith(current) ) {	
		current.y--;	
		board.fuse(current);
		current = pickRandomBrick();
	}

	let reduced_rows = board.checkAndReduce();
	if ( reduced_rows > 0 ) {
		score += reduced_rows * 50;
	}

	if ( board.checkGameOver(current) ) {
		alert('Game Over ! Score ' + score);
		document.location.reload();
	}
}

function draw() {
	clear();
	
	loopAndCheck();

	drawBoard();
	drawBrick(current);
	displayInfos();
}


document.body.addEventListener('keydown', e => {
	const keymap_rotate = [38, 40, 32];

	if ( board.collidesWith(current) ) return;

	if ( keymap_rotate.includes(e.keyCode) ) {
		let rotated = current.rotate();
		if ( board.fits(rotated) ) {
			current = rotated;
		}
	}

	if (e.keyCode == 37) {
		current.x--;
		if ( !board.fits(current) || board.collidesWith(current) )
			current.x++;
	}

	if (e.keyCode == 39) {
		current.x++;
		if ( !board.fits(current) || board.collidesWith(current) )
			current.x--;
	}

});


setInterval(draw, 1000 / 5);