/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
, testParents = require('./testParents')
;

var assertElt = function (node) {
    assert(_.isString(node.name), 'elt did not have name.');
    assert(_.isObject(node.attributes), 'elt.attributes was not an object');
    assert(_.isArray(node.children), 'elt.children was not an array.');
    testParents(node);
};


describe('elt', function () {

    describe('name constructor', function () {
        it('should construct an element with the given name', function () {
            var node = xml.elt('blurns');
            assertElt(node);
            assert.equal(node.name, 'blurns');
        });
    });

    describe('name/children constructor', function () {
        it('should construct an element with the given name', function () {
            var node = xml.elt('jets', [xml.elt('best')]);
            assertElt(node);
            assert.equal(node.name, 'jets');
        });

        it('should construct an element with the given child.', function () {
            var node = xml.elt('jets', [xml.elt('leela')]);
            assertElt(node);
            assert.equal(node.children[0].name, 'leela');
        });

    });

    describe('name/attributes constructor', function () {
        it('should construct an element with the given name', function () {
            var node = xml.elt('jackie', {lastname: 'anderson'});
            assertElt(node);
            assert.equal(node.name, 'jackie');
        });

        it('should construct an element with the given attribute.', function () {
            var node = xml.elt('retire', {game: 'blurnsball'});
            assertElt(node);
            assert.equal(node.attributes.game, 'blurnsball');
        });

    });


    describe('name/attributes/children constructor', function () {
        it('should construct an element with the given name', function () {
            var node = xml.elt('developer', {lastname: 'groening'}, [xml.elt('sink')]);
            assertElt(node);
            assert.equal(node.name, 'developer');
        });

        it('should construct an element with the given attribute.', function () {
            var node = xml.elt('bender', {muscular: 'true'}, [xml.elt('stuff')]);
            assertElt(node);
            assert.equal(node.attributes.muscular, 'true');
        });

        it('should construct an element with the given child.', function () {
            var node = xml.elt('mailbox', {empty: 'false'}, [xml.elt('foot')]);
            assertElt(node);
            assert.equal(node.children[0].name, 'foot');
        });

    });

    describe('extension ', function () {
        it('should construct an element with the given name', function () {
            var node = xml.elt({
                name: 'large'
            });
            assertElt(node);
            assert.equal(node.name, 'large');
        });

        it('should construct an element with the given attribute.', function () {
            var node = xml.elt({
                attributes: {
                    'first': 'work'
                }
            });
            assertElt(node);
            assert.equal(node.attributes.first, 'work');
        });

        it('should construct an element with the given child.', function () {
            var node = xml.elt({
                children: [xml.elt('cause')]
            });
            assertElt(node);
            assert.equal(node.children[0].name, 'cause');
        });

    });


});
