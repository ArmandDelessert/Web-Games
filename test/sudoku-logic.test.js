const test = require('node:test');
const assert = require('node:assert/strict');
const { REVEAL_RATIO, isValid, solveRandom, countSolutions, generatePuzzle } = require('../Sudoku/sudoku-logic.js');

var SIZE_CONFIGS = [
    { n: 4, boxR: 2, boxC: 2 },
    { n: 6, boxR: 2, boxC: 3 },
    { n: 8, boxR: 2, boxC: 4 },
    { n: 9, boxR: 3, boxC: 3 }
];

function assertFullGridValid(grid, n, boxR, boxC) {
    for (var v = 1; v <= n; v++) assert.ok(grid.includes(v), 'grid missing value ' + v);
    for (var i = 0; i < n * n; i++) {
        var row = Math.floor(i / n), col = i % n, val = grid[i];
        grid[i] = 0;
        assert.ok(isValid(grid, n, boxR, boxC, row, col, val),
            'value ' + val + ' at (' + row + ',' + col + ') conflicts with the rest of the grid');
        grid[i] = val;
    }
}

test('solveRandom fills every configured grid size with a valid solution', () => {
    for (const cfg of SIZE_CONFIGS) {
        const grid = new Array(cfg.n * cfg.n).fill(0);
        const solved = solveRandom(grid, cfg.n, cfg.boxR, cfg.boxC);
        assert.equal(solved, true, 'size ' + cfg.n + ': solveRandom should succeed on an empty grid');
        assertFullGridValid(grid, cfg.n, cfg.boxR, cfg.boxC);
    }
});

test('countSolutions recognizes a fully-solved grid as exactly 1 solution', () => {
    const cfg = SIZE_CONFIGS[3]; // 9x9
    const grid = new Array(cfg.n * cfg.n).fill(0);
    solveRandom(grid, cfg.n, cfg.boxR, cfg.boxC);
    assert.equal(countSolutions(grid, cfg.n, cfg.boxR, cfg.boxC, 2), 1);
});

test('countSolutions returns 0 for a near-complete grid with no valid completion', () => {
    // Realistic shape: countSolutions is only ever called by generatePuzzle on
    // grids with a handful of empty cells, never near-empty ones (those are
    // pathologically slow for this non-randomized, non-cross-validating
    // candidate counter — it trusts already-filled cells are consistent and
    // never re-checks them against each other).
    const cfg = SIZE_CONFIGS[3]; // 9x9
    const grid = new Array(cfg.n * cfg.n).fill(0);
    solveRandom(grid, cfg.n, cfg.boxR, cfg.boxC);

    // Clear cell X, then move X's own (only valid, by row) value into another
    // cell Y of the same column. X's row now allows only its original value,
    // but that value is now already used in X's column → zero candidates.
    const x = 0, y = cfg.n; // same column (col 0), different row
    const origX = grid[x];
    grid[x] = 0;
    grid[y] = origX;

    assert.equal(countSolutions(grid, cfg.n, cfg.boxR, cfg.boxC, 2), 0);
});

test('generatePuzzle produces a puzzle with a unique solution, for every size and difficulty', () => {
    for (const cfg of SIZE_CONFIGS) {
        for (let diff = 0; diff < REVEAL_RATIO[cfg.n].length; diff++) {
            const { solution, puzzle } = generatePuzzle(cfg, diff);

            assertFullGridValid(solution.slice(), cfg.n, cfg.boxR, cfg.boxC);

            for (let i = 0; i < puzzle.length; i++) {
                assert.ok(puzzle[i] === 0 || puzzle[i] === solution[i],
                    'puzzle cell ' + i + ' disagrees with the solution');
            }

            assert.equal(countSolutions(puzzle.slice(), cfg.n, cfg.boxR, cfg.boxC, 2), 1,
                'size ' + cfg.n + ' diff ' + diff + ': puzzle must have exactly one solution');
        }
    }
});

test('shuffle returns a permutation of its input (in place)', () => {
    const { shuffle } = require('../Sudoku/sudoku-logic.js');
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const before = arr.slice().sort();
    const result = shuffle(arr);
    assert.equal(result, arr, 'shuffle should return the same array reference');
    assert.deepEqual(arr.slice().sort(), before, 'shuffle must not add or remove elements');
});
