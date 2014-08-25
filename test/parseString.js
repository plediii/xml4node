/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;

describe('parseString', function () {

    it('should correctly parse a root node', function () {
        var doc = xml.parseString('<server />');
        assert(doc.root);
        assert(!(doc.prolog));
        assert.equal(doc.root.name, 'server');
        assert.deepEqual(doc.root.children, []);
        assert.deepEqual(doc.root.hash, {});
        assert.deepEqual(doc.root.attributes, {});
    });

    it('should fail to parse an invalid root node', function () {
        assert.throws(function () {
            xml.parseString('<server');
        });
    });

    it('should correctly parse an xml prolog', function () {
        var doc = xml.parseString('<?xml version="6.0"?><server />');
        assert(doc.root);
        assert(doc.prolog);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.prolog.body, 'version="6.0"');
    });


    it('should correctly parse an xml prolog even in the presence of processing instructions', function () {
        var doc = xml.parseString('<?xml version="6.0"?><server><?xml version="7.1"?></server>');
        assert(doc.root);
        assert(doc.prolog);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.root.children.length, 1);
        assert.equal(doc.prolog.body, 'version="6.0"');
    });


});

