/* Pure Sudoku generation logic — no DOM access.
   Loaded via <script src> before the page's main script, where these
   functions are called as plain (global) identifiers. Also require()-able
   from Node for unit tests. */

// Proportion of cells kept as givens per [size][diff]
var REVEAL_RATIO = {
    4: [0.70, 0.60, 0.50],
    6: [0.60, 0.50, 0.40],
    8: [0.55, 0.45, 0.36],
    9: [0.50, 0.42, 0.33]
};

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
}

function isValid(grid, n, boxR, boxC, row, col, val) {
    for (var i = 0; i < n; i++) {
        if (grid[row * n + i] === val) return false;
        if (grid[i * n + col] === val) return false;
    }
    var br = Math.floor(row / boxR) * boxR;
    var bc = Math.floor(col / boxC) * boxC;
    for (var r = 0; r < boxR; r++) {
        for (var c = 0; c < boxC; c++) {
            if (grid[(br + r) * n + (bc + c)] === val) return false;
        }
    }
    return true;
}

function solveRandom(grid, n, boxR, boxC) {
    for (var i = 0; i < n * n; i++) {
        if (grid[i] === 0) {
            var row = Math.floor(i / n);
            var col = i % n;
            var nums = [];
            for (var k = 1; k <= n; k++) nums.push(k);
            shuffle(nums);
            for (var k = 0; k < nums.length; k++) {
                if (isValid(grid, n, boxR, boxC, row, col, nums[k])) {
                    grid[i] = nums[k];
                    if (solveRandom(grid, n, boxR, boxC)) return true;
                    grid[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

// Count solutions up to `limit`, using MRV heuristic for speed
function countSolutions(grid, n, boxR, boxC, limit) {
    var bestIdx = -1;
    var bestCands = null;
    for (var i = 0; i < n * n; i++) {
        if (grid[i] === 0) {
            var row = Math.floor(i / n);
            var col = i % n;
            var cands = [];
            for (var k = 1; k <= n; k++) {
                if (isValid(grid, n, boxR, boxC, row, col, k)) cands.push(k);
            }
            if (cands.length === 0) return 0;
            if (bestCands === null || cands.length < bestCands.length) {
                bestIdx = i;
                bestCands = cands;
                if (cands.length === 1) break;
            }
        }
    }
    if (bestIdx === -1) return 1;
    var count = 0;
    for (var k = 0; k < bestCands.length; k++) {
        grid[bestIdx] = bestCands[k];
        count += countSolutions(grid, n, boxR, boxC, limit - count);
        grid[bestIdx] = 0;
        if (count >= limit) return count;
    }
    return count;
}

function generatePuzzle(cfg, diffIdx) {
    var n = cfg.n;
    var sol = new Array(n * n).fill(0);
    solveRandom(sol, n, cfg.boxR, cfg.boxC);

    var puz = sol.slice();
    var indices = [];
    for (var i = 0; i < n * n; i++) indices.push(i);
    shuffle(indices);

    var targetReveal = Math.round(REVEAL_RATIO[n][diffIdx] * n * n);
    var toRemove = n * n - targetReveal;

    var removed = 0;
    for (var i = 0; i < indices.length && removed < toRemove; i++) {
        var idx = indices[i];
        var backup = puz[idx];
        if (backup === 0) continue;
        puz[idx] = 0;
        var testGrid = puz.slice();
        if (countSolutions(testGrid, n, cfg.boxR, cfg.boxC, 2) === 1) {
            removed++;
        } else {
            puz[idx] = backup;
        }
    }

    return { solution: sol, puzzle: puz };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { REVEAL_RATIO: REVEAL_RATIO, shuffle: shuffle, isValid: isValid,
        solveRandom: solveRandom, countSolutions: countSolutions, generatePuzzle: generatePuzzle };
}
