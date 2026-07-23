/* Pure Yakazu logic: shuffling, segment computation, and black-cell pattern
   generation — no DOM access. Loaded via <script src> before the page's main
   script, where these are called as plain (global) identifiers. Also
   require()-able from Node for unit tests.

   The backtracking solver (solveRandom/countSolutions and friends) stays
   inline in index.html: it closes over module-level state (blackCells,
   segData, solveBudget) that would need a larger refactor to extract safely. */

var BLACK_DENSITY = 0.26;

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
}

/* ── Segment computation ──
 * A "segment" is a maximal run of white cells along a row or column,
 * bounded by black cells or the grid edge. Kakuro-style clues live on
 * these segments implicitly (via cellMaxVal in the solver).
 */
function buildSegments(black, n) {
    var segments = [];
    var cellRowSeg = new Array(n * n).fill(-1);
    var cellColSeg = new Array(n * n).fill(-1);

    // Horizontal segments (scan row by row)
    for (var r = 0; r < n; r++) {
        var c = 0;
        while (c < n) {
            if (black[r * n + c]) { c++; continue; }
            var cells = [];
            while (c < n && !black[r * n + c]) {
                var idx = r * n + c;
                cells.push(idx);
                cellRowSeg[idx] = segments.length;
                c++;
            }
            segments.push({ cells: cells, len: cells.length, dir: 'h' });
        }
    }

    // Vertical segments (scan column by column)
    for (var c = 0; c < n; c++) {
        var r = 0;
        while (r < n) {
            if (black[r * n + c]) { r++; continue; }
            var cells = [];
            while (r < n && !black[r * n + c]) {
                var idx = r * n + c;
                cells.push(idx);
                cellColSeg[idx] = segments.length;
                r++;
            }
            segments.push({ cells: cells, len: cells.length, dir: 'v' });
        }
    }

    return { segments: segments, cellRowSeg: cellRowSeg, cellColSeg: cellColSeg };
}

/* ── Black cell pattern generation ──
 * Places black cells pairwise with 180° rotational symmetry and
 * rejects any placement that would create a white cell isolated on
 * both axes (segment of length 1 horizontally AND vertically).
 */
function hasIsolatedWhite(black, n) {
    for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
            if (black[r * n + c]) continue;
            // Horizontal length
            var hLen = 1;
            var cc = c - 1;
            while (cc >= 0 && !black[r * n + cc]) { hLen++; cc--; }
            cc = c + 1;
            while (cc < n && !black[r * n + cc]) { hLen++; cc++; }
            if (hLen > 1) continue;
            // Vertical length
            var vLen = 1;
            var rr = r - 1;
            while (rr >= 0 && !black[rr * n + c]) { vLen++; rr--; }
            rr = r + 1;
            while (rr < n && !black[rr * n + c]) { vLen++; rr++; }
            if (vLen <= 1) return true;
        }
    }
    return false;
}

function generateBlackPattern(n) {
    var target = Math.round(n * n * BLACK_DENSITY);
    var black = new Array(n * n).fill(false);

    var pairs = [];
    var centerIdx = -1;
    for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
            var idx = r * n + c;
            var symIdx = (n - 1 - r) * n + (n - 1 - c);
            if (idx < symIdx) pairs.push([idx, symIdx]);
            else if (idx === symIdx) centerIdx = idx;
        }
    }
    shuffle(pairs);

    var placed = 0;
    for (var i = 0; i < pairs.length && placed < target; i++) {
        black[pairs[i][0]] = true;
        black[pairs[i][1]] = true;
        if (hasIsolatedWhite(black, n)) {
            black[pairs[i][0]] = false;
            black[pairs[i][1]] = false;
        } else {
            placed += 2;
        }
    }

    if (centerIdx >= 0 && placed < target) {
        black[centerIdx] = true;
        if (hasIsolatedWhite(black, n)) {
            black[centerIdx] = false;
        }
    }

    return black;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BLACK_DENSITY: BLACK_DENSITY, shuffle: shuffle, buildSegments: buildSegments,
        hasIsolatedWhite: hasIsolatedWhite, generateBlackPattern: generateBlackPattern };
}
