const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSegments, hasIsolatedWhite, generateBlackPattern } = require('../Yakazu/yakazu-logic.js');

const SIZES = [5, 7, 9];

test('buildSegments splits a row/column correctly around black cells', () => {
    // 3x3 grid, black cell at the center (index 4):
    //  .  .  .
    //  .  #  .
    //  .  .  .
    const n = 3;
    const black = new Array(n * n).fill(false);
    black[4] = true;
    const { segments, cellRowSeg, cellColSeg } = buildSegments(black, n);

    // Middle row (indices 3,4,5) splits into two length-1 segments around the black cell.
    assert.notEqual(cellRowSeg[3], cellRowSeg[5], 'cells on either side of a black cell must be in different row segments');
    // Top and bottom rows (no black cells) are each one full length-3 segment.
    const topRowSeg = cellRowSeg[0];
    assert.equal(cellRowSeg[1], topRowSeg);
    assert.equal(cellRowSeg[2], topRowSeg);
    assert.equal(segments[topRowSeg].len, 3);

    // Middle column likewise splits around the black cell.
    assert.notEqual(cellColSeg[1], cellColSeg[7]);

    // Every white cell belongs to exactly one row segment and one column segment.
    for (let i = 0; i < n * n; i++) {
        if (black[i]) continue;
        assert.ok(cellRowSeg[i] >= 0, 'white cell ' + i + ' missing a row segment');
        assert.ok(cellColSeg[i] >= 0, 'white cell ' + i + ' missing a column segment');
    }
});

test('hasIsolatedWhite detects a cell fully boxed in by black cells', () => {
    // 3x3 grid: every neighbour of the center cell is black → center is
    // isolated (segment length 1 on both axes).
    const n = 3;
    const black = new Array(n * n).fill(false);
    black[1] = true; // above center
    black[3] = true; // left of center
    black[5] = true; // right of center
    black[7] = true; // below center
    assert.equal(hasIsolatedWhite(black, n), true);
});

test('hasIsolatedWhite returns false for an all-white grid', () => {
    const n = 5;
    const black = new Array(n * n).fill(false);
    assert.equal(hasIsolatedWhite(black, n), false);
});

test('generateBlackPattern keeps 180°-rotational symmetry and no isolated white cells', () => {
    for (const n of SIZES) {
        for (let trial = 0; trial < 10; trial++) {
            const black = generateBlackPattern(n);
            assert.equal(black.length, n * n);
            for (let idx = 0; idx < n * n; idx++) {
                const symIdx = n * n - 1 - idx;
                assert.equal(black[idx], black[symIdx],
                    'n=' + n + ': cell ' + idx + ' and its 180°-symmetric counterpart ' + symIdx + ' must match');
            }
            assert.equal(hasIsolatedWhite(black, n), false,
                'n=' + n + ': generated pattern must not isolate any white cell');
        }
    }
});
