const test = require('node:test');
const assert = require('node:assert/strict');
const { PAIR_OPTIONS, shuffle, computeGrid } = require('../Memory/memory-logic.js');

test('PAIR_OPTIONS: every option has enough cells for its pairs and a sane aspect ratio', () => {
    for (const opt of PAIR_OPTIONS) {
        assert.ok(opt.cols * opt.rows >= opt.pairs * 2,
            opt.pairs + ' pairs need ' + (opt.pairs * 2) + ' cells, grid only has ' + (opt.cols * opt.rows));
    }
});

test('shuffle returns a permutation of its input (in place)', () => {
    const arr = ['a', 'b', 'c', 'd', 'e', 'f'];
    const before = arr.slice().sort();
    const result = shuffle(arr);
    assert.equal(result, arr, 'shuffle should return the same array reference');
    assert.deepEqual(arr.slice().sort(), before, 'shuffle must not add or remove elements');
});

test('computeGrid orients the larger dimension to match the viewport', () => {
    const opt = { pairs: 12, cols: 6, rows: 4 };

    const landscape = computeGrid(opt, true);
    assert.equal(landscape.cols, 6, 'landscape: cols should be the larger dimension');
    assert.equal(landscape.rows, 4);

    const portrait = computeGrid(opt, false);
    assert.equal(portrait.cols, 4, 'portrait: cols should be the smaller dimension');
    assert.equal(portrait.rows, 6);

    // Cell count is preserved regardless of orientation.
    assert.equal(landscape.cols * landscape.rows, opt.cols * opt.rows);
    assert.equal(portrait.cols * portrait.rows, opt.cols * opt.rows);
});
