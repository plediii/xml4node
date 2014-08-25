/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;


describe('docEach', function () {
    it('should execute a callback function on each instance of a node', function () {
        var collection = [];
        xml.docEach(xml.doc(xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])]))
                    , ['doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                    });
        assert.deepEqual(collection, ['a', 'b', 'c', 'd']);
    });

    it('should execute a callback function on each instance of a node in a level hierarchy', function () {
        var collection = [];
        xml.docEach(xml.doc(xml.elt('matroska'
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
                    });
        assert.deepEqual(collection, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    });
});

