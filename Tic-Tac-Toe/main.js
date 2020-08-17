const canvas = document.getElementById("canvas");
const reload_btn = document.getElementById("reload_btn");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const log = document.getElementById("log");

const game_dim = 3;
const game = new Game(game_dim);
const dim = width / game.dim;
const computer =  1;
const player   = -1;
let cando_next_move = true;

function displayGame ( game ) {
	ctx.clearRect(0, 0, width, height);
	for (let y = 0; y < game.dim; y++) {
		for (let x = 0; x < game.dim; x++) {
			const v = game.board[y][x];
			ctx.strokeRect(x * dim, y * dim, dim, dim);
			let char = game.map[v];
			ctx.font = '60px Consolas';

			if ( v != 0 )
				ctx.fillText(char, x * dim + dim / 3.1, y * dim + dim / 2 + 15);
		}
	}
}

function playRandom(type) {
	let y = Math.random() * game.dim,
		x = Math.random() * game.dim;
	[y, x] = [y, x].map(t => Math.floor(t));
	game.put(y, x, type);
}

function play (...args) {
	let type = args.length == 1 ? args.pop() : args[args.length - 1];
	if ( type == player ) {
		game.put (...args);
	} else {
		const maxDepth = Infinity;
		let pos = AI.getBestMove (game, computer, maxDepth);
		console.log(pos);
		game.put(pos.y, pos.x, computer);
	}
	displayGame(game);


	let game_state = game.end();
	if ( Math.abs(game_state) == 1 ) {
		cando_next_move = false;
		log.innerText = `${game.map[type]} won !`;
	}
	if ( game_state == 0 ) {
		cando_next_move = false;
		log.innerText = "DRAW";
	}

	return cando_next_move;
}


canvas.addEventListener('click', e => {
	let rect = canvas.getBoundingClientRect();
	let y = e.clientY - rect.top;
	let x = e.clientX - rect.left;
	const [i, j] = [Math.floor(y/dim), Math.floor(x/dim)];
	if ( game.board[i][j] == 0 && cando_next_move ) {
		cando_next_move = play(i, j, player);
		if ( cando_next_move ) {
			play(computer);
		}	
	}
});
reload_btn.addEventListener('click', e => {
	window.location.reload();
});

// play(computer);
displayGame( game );
