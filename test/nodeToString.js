/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
, testParents = require('./testParents')
;


describe('nodeToString', function () {

    describe('not pretty', function () {

        it('should correctly output an empty node', function () {
            var elt = xml.elt('alien');
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<alien/>');
        });

        it('should correctly convert an element with a child to a string', function () {
            var elt = xml.elt('tag', [xml.elt('child')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<tag><child/></tag>');
            testParents(elt);
        });

        it('should correctly ignore isSelfClosing attribute', function () {
            var elt = xml.elt('tag', [xml.elt('child')]);
            elt.isSelfClosing = true;
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<tag><child/></tag>');
            testParents(elt);
        });

        it('should correctly output text nodes', function () {
            var elt = xml.elt('tag', [xml.text('child')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<tag>child</tag>');
            testParents(elt);
        });

        it('should correctly output an attribute', function () {
            var elt = xml.elt('alien', { type: 'extra'});
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<alien type="extra"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a quote', function () {
            var elt = xml.elt('character', { is: '"'});
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character is="&quot;"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a <', function () {
            var elt = xml.elt('character', { is: '<'});
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character is="&lt;"/>');
            testParents(elt);
        });


        it('should correctly escape an attribute with a >', function () {
            var elt = xml.elt('character', { is: '>'});
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character is="&gt;"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a &', function () {
            var elt = xml.elt('character', { is: '&'});
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character is="&amp;"/>');
            testParents(elt);
        });


        it('should correctly output an attribute and child node', function () {
            var elt = xml.elt('alien', { type: 'person'}, [xml.elt('sigourney')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<alien type="person"><sigourney/></alien>');
            testParents(elt);
        });

        it('should correctly escape text a quote', function () {
            var elt = xml.elt('character', [xml.text('"')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character>&quot;</character>');
            testParents(elt);
        });

        it('should correctly escape text with a <', function () {
            var elt = xml.elt('character', [xml.text('<')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character>&lt;</character>');
            testParents(elt);
        });


        it('should correctly escape text with a >', function () {
            var elt = xml.elt('character', [xml.text('>')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character>&gt;</character>');
            testParents(elt);
        });

        it('should correctly escape text with a &', function () {
            var elt = xml.elt('character', [xml.text('&')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<character>&amp;</character>');
            testParents(elt);
        });

        it('should correctly output a prolog processing instruction', function () {
            var elt = xml.elt('photoshoot', [xml.processinginstruction('super', 'model')]);
            assert.equal(xml.nodeToString(elt, { pretty: false }), '<photoshoot><?super model?></photoshoot>');
            testParents(elt);
        });

    });

    describe('pretty', function () {

        it('should correctly output an empty node', function () {
            var elt = xml.elt('alien');
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<alien/>');
        });

        it('should correctly convert an element with a child to a string', function () {
            var elt = xml.elt('tag', [xml.elt('child')]);
            assert.equal(xml.nodeToString(elt, { pretty: true})
                         , ['<tag>', '    <child/>', '</tag>'].join('\n'));
            testParents(elt);
        });

        it('should correctly ignore isSelfClosing attribute', function () {
            var elt = xml.elt('tag', [xml.elt('child')]);
            elt.isSelfClosing = true;
            assert.equal(xml.nodeToString(elt, { pretty : true})
                         , ['<tag>', '    <child/>', '</tag>'].join('\n'));
            testParents(elt);
        });

        it('should correctly output text nodes', function () {
            var elt = xml.elt('tag', [xml.text('child')]);
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<tag>child</tag>');
            testParents(elt);
        });

        it('should correctly output an attribute', function () {
            var elt = xml.elt('alien', { type: 'extra'});
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<alien type="extra"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a quote', function () {
            var elt = xml.elt('character', { is: '"'});
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character is="&quot;"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a <', function () {
            var elt = xml.elt('character', { is: '<'});
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character is="&lt;"/>');
            testParents(elt);
        });


        it('should correctly escape an attribute with a >', function () {
            var elt = xml.elt('character', { is: '>'});
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character is="&gt;"/>');
            testParents(elt);
        });

        it('should correctly escape an attribute with a &', function () {
            var elt = xml.elt('character', { is: '&'});
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character is="&amp;"/>');
            testParents(elt);
        });


        it('should correctly output an attribute and child node', function () {
            var elt = xml.elt('alien', { type: 'person'}, [xml.elt('sigourney')]);
            assert.equal(xml.nodeToString(elt, { pretty: true })
                         , ['<alien type="person">', '    <sigourney/>', '</alien>'].join('\n'));
            testParents(elt);
        });

        it('should correctly escape text a quote', function () {
            var elt = xml.elt('character', [xml.text('"')]);
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character>&quot;</character>');
            testParents(elt);
        });

        it('should correctly escape text with a <', function () {
            var elt = xml.elt('character', [xml.text('<')]);
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character>&lt;</character>');
            testParents(elt);
        });


        it('should correctly escape text with a >', function () {
            var elt = xml.elt('character', [xml.text('>')]);
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character>&gt;</character>');
            testParents(elt);
        });

        it('should correctly escape text with a &', function () {
            var elt = xml.elt('character', [xml.text('&')]);
            assert.equal(xml.nodeToString(elt, { pretty: true }), '<character>&amp;</character>');
            testParents(elt);
        });

        it('should correctly output a prolog processing instruction', function () {
            var elt = xml.elt('photoshoot', [xml.processinginstruction('super', 'model')]);
            assert.equal(xml.nodeToString(elt, { pretty: true })
                         , ['<photoshoot>', '    <?super model?>', '</photoshoot>'].join('\n'));
            testParents(elt);
        });

    });

});
