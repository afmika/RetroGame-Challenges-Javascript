

const board = new Board (3);

// who won ?

// ---------
board.content = [
    -1, -9, -6,
    4, -6, 1,
    -3, 8, 0
];
assert (board.getWinner() === -1, 'Assertion failed, -1 expected');

// ---------
board.content = [
    1, -9, -6,
    4, -6, 1,
    3, 8, 0
];
assert (board.getWinner() === 1, 'Assertion failed, 1 expected');

// ---------
board.content = [
    -1, 3, -6,
    4, -2, 1,
    1, -4, 2
];
assert (board.getWinner() === 0, 'Assertion failed, 0 expected');

// ---------
board.content = [
    -1, 0, -6,
    3, -6, 1,
    0, 8, 0
];
assert (board.getWinner() === null, 'Assertion failed, null expected');