/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;


describe('docFind', function () {
    it('should execute a callback function on each instance of a node, and short circuit on the target', function () {
        var collection = [];
        var target = xml.docFind(xml.doc(xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])]))
                    , ['doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                        return xml.value(doll) === 'b';
                    });
        assert.equal(xml.value(target), 'b');
        assert.deepEqual(collection, ['a', 'b']);
    });

    it('should execute a callback function on each instance of a hierarchy of nodes, and short circuit on the target', function () {
        var collection = [];
        var target = xml.docFind(xml.doc(xml.elt('matroska'
                                    , [xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])])
                                       , xml.elt('doll', [xml.elt('doll', [xml.text('e')])
                                             , xml.elt('doll', [xml.text('f')])
                                             , xml.elt('doll', [xml.text('g')])
                                             , xml.elt('doll', [xml.text('h')])])]))
                    , ['matroska', 'doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                        return xml.value(doll) === 'f';
                    });
        assert.equal(xml.value(target), 'f');
        assert.deepEqual(collection, ['a', 'b', 'c', 'd', 'e', 'f']);
    });
});
