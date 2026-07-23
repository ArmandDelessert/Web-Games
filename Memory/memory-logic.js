/* Pure Memory logic — no DOM access. Loaded via <script src> before the
   page's main script, where these are called as plain (global) identifiers.
   Also require()-able from Node for unit tests. */

var PAIR_OPTIONS = [
    { pairs: 6,  cols: 4,  rows: 3  },
    { pairs: 8,  cols: 4,  rows: 4  },
    { pairs: 10, cols: 5,  rows: 4  },
    { pairs: 12, cols: 6,  rows: 4  },
    { pairs: 15, cols: 6,  rows: 5  },
    { pairs: 18, cols: 6,  rows: 6  },
    { pairs: 21, cols: 7,  rows: 6  },
    { pairs: 24, cols: 8,  rows: 6  },
    { pairs: 28, cols: 8,  rows: 7  },
    { pairs: 32, cols: 8,  rows: 8  },
    { pairs: 35, cols: 10, rows: 7  },
    { pairs: 40, cols: 10, rows: 8  },
    { pairs: 45, cols: 10, rows: 9  },
    { pairs: 50, cols: 10, rows: 10 },
    { pairs: 54, cols: 12, rows: 9  },
    { pairs: 60, cols: 12, rows: 10 },
    { pairs: 66, cols: 12, rows: 11 },
    { pairs: 72, cols: 12, rows: 12 }
];

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
}

// `landscape` is passed in (rather than read from `window` here) so this
// stays a pure function callable from Node tests without a DOM.
function computeGrid(option, landscape) {
    var cols = landscape ? Math.max(option.cols, option.rows) : Math.min(option.cols, option.rows);
    var rows = landscape ? Math.min(option.cols, option.rows) : Math.max(option.cols, option.rows);
    return { cols: cols, rows: rows };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PAIR_OPTIONS: PAIR_OPTIONS, shuffle: shuffle, computeGrid: computeGrid };
}
