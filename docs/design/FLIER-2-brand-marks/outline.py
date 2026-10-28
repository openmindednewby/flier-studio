# -*- coding: utf-8 -*-
"""Wordmark text -> SVG path outlines from Jost (OFL, already hosted at public/fonts/jost-latin-wght.woff2)."""
import io, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'fonts', 'jost-latin-wght.woff2')
_cache = {}


def _font(w):
    if w not in _cache:
        _cache[w] = instancer.instantiateVariableFont(TTFont(FONT), {'wght': w})
    return _cache[w]


def runs(parts, x, y, size, tracking=0.0):
    """parts: [(text, weight)]. Returns (path d, advance width in px)."""
    d, cx = '', x
    for text, w in parts:
        f = _font(w); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm; s = size / upm
        hm = f['hmtx']
        for ch in text:
            g = cmap[ord(ch)]
            pen = SVGPathPen(gs)
            gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
            d += pen.getCommands()
            cx += hm[g][0] * s + tracking * size
    return d, cx - x


def word(parts, x, y, size, c, tracking=0.0):
    d, _ = runs(parts, x, y, size, tracking)
    return f'<path d="{d}" fill="{c}"/>'
