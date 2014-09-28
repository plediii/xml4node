/*jslint node: true */
"use strict";

var sax = require('sax');
var _ = require('underscore');

var escape = function (str, options) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g,'&lt;').replace(/>/g,'&gt;')
        // .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
    ;
};

var docToString = function (doc, options) {
    var s = '';
    if (doc.prolog) {
        s = '<?xml ' + doc.prolog.body + '?>';
    }
    return s + nodeToString(doc.root, options);
};

var doc = function (root) {
    return {
        root: root
    };
};

var text = function (str) {
    return {
        type: 'text'
        , name: 'text()'
        , body: '' + str
    };
};

var comment = function (str) {
    return {
        type: 'comment'
        , name: 'comment()'
        , body: '' + str
    };
};


var processinginstruction = function (name, body) {
    return {
        type: 'processing'
        , name: name
        , body: body
    };
};

var parseNode = function (str) {
    return parseString('<root>' + str + '</root>').root.children[0];
};

var appendNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node);
    }
    node.parent = parent;
    parent.children.push(node);
    (parent.hash[node.name] || (parent.hash[node.name] = [])).push(node);
};

var removeNode = function (parent, nodename) {
    if (parent.hash[nodename]) {
        parent.children = _.difference(parent.children, parent.hash[nodename]);
        delete parent.hash[nodename];
    }
};

var defaultNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node, parent);
    }
    node.parent = parent;
    if (!parent.hash.hasOwnProperty(node.name)) {
        appendNode(parent, node);
    }
};

var setNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node);
    }
    node.parent = parent;
    removeNode(parent, node.name);
    appendNode(parent, node);
};

var elt = function (options, attrs, children) {
    if (_.isString(options)) {
        var overrides = {
            name: options
        };

        if (_.isArray(attrs)) {
            overrides.children = attrs;
        }
        else if (_.isObject(attrs)) {
            overrides.attributes = attrs;
            if (_.isArray(children)) {
                overrides.children = children;
            }
        }
        
        return elt(overrides);
    }
    else {
        var n = _.extend({
            name: 'xmlnode'
            , attributes: {}
            , children: []
            , hash: {}
        }, _.omit(options, 'children')); 
        _.each(options.children, function (c) {
            appendNode(n, c);
        });
        return n;
    }
};

var value = function (node) {
    if (!node || !node.children || node.children.length < 1) {
        return void 0;
    }
    return node.children[0].body;
};

var indentToNextLine = function (parent) {
    var s = '';
    s += '\n';
    while (parent) {
        s += '    ';
        parent = parent.parent;
    }
    return s;
};

var nodeToString = function (node, options) {
    var pretty = options && options.pretty;
    var s = '<' + node.name;
    var attrs = _.map(node.attributes, function (v, k) {
        return k + '=' + '"' + escape(v) + '"';
    }).join(' ');
    if (attrs) {
        s += ' ' + attrs;
    }
    if (node.children.length === 0) {
        s += '/>';
    }
    else {
        s += '>';
        _.each(node.children, function (child, idx) {
            if (child.type === 'text') {
                s += escape(child.body);
            }
            else {
                if (pretty 
                    && ((idx === 0 && child.type !== 'text') 
                        || (idx > 0 && node.children[idx - 1].type !== 'text'))) {
                    s += indentToNextLine(node);
                }
                if (child.type === 'processing') {
                    s += '<?' + child.name + ' ' + child.body + '?>';
                }
                else if (child.type === 'comment') {
                    s += '<!--' + child.body + '-->';
                }
                else {
                    s += nodeToString(child, options);
                }
            }
            
        });
        if (pretty
            && _.any(node.children, function (child) {
                return child.type !== 'text';
            })) {
            s += indentToNextLine(node.parent);
        }
        s += '</' + node.name + '>';
    }

    return s;
};

var withoutBOM = function (str) {
    if (str[0] === '\uFEFF') {
        return str.slice(1);
    }
    else {
        return str;
    }
};

var parseString = function (str) {

    var parser = sax.parser(true, {
        trim: false
        , normalize: false
    });


    var nodestack = [];
    var nodes = [];
    var xmldoc = {};
    parser.onerror = function (e) {
        throw e;
        // this._parser.error = null
        // this._parser.resume()
    };
    parser.onprocessinginstruction = function (node) {
        var parent = _.last(nodestack);
        if (!parent) {
            xmldoc.prolog = node;
        }
        else {
            node.type = 'processing';
            parent.children.push(node);
        }
        node.parent = parent;
    };
    parser.oncomment = function (body) {
        var parent = _.last(nodestack);
        var node = comment(body);
        parent.children.push(node);
        node.parent = parent;
    };

    parser.onopentag = function (node) {
        nodestack.push(node);
        nodes.push(node);
        node.children = [];
        node.hash = {};
    };
    parser.ontext = function (str) {
        var parent = _.last(nodestack);
        if (!parent) {
            console.log('spare text: ', str);
        }
        else {
            var node = text(str);
            parent.children.push(node);
            node.parent = parent;
            var hash = parent.hash[node.name] || (parent.hash[node.name] = []);
            hash.push(node);            
        }
    };

    parser.onclosetag =function (nodename) {
        var node = nodestack.pop();
        var parent = _.last(nodestack);
        node.parent = parent;
        if (parent) {
            parent.children.push(node);
            var hash = parent.hash[node.name] || (parent.hash[node.name] = []);
            hash.push(node);
        }
        else {
            xmldoc.root = node;
        }
    };

    var ended = false;
    parser.onend = function () {
        ended = true;
    };

    parser
        .write(withoutBOM(str.toString()))
        .close();
    if (!ended) {
        throw 'Premature end.';
    }
    return xmldoc;
};

var nodeEach = function (node, route, cb) {
    if (route.length === 0) {
        return cb(node);
    }
    else {
        var routeHead = _.head(route);
        var routeRest = _.rest(route);
        if (node.hash.hasOwnProperty(routeHead)) {
            var routeNext = _.head(routeRest);
            if (_.isNumber(routeNext)) {
                return nodeEach(node.hash[routeHead][routeNext], _.rest(routeRest), cb);
            }
            else {
                _.each(node.hash[routeHead], function (subnode, idx) {
                    nodeEach(subnode, routeRest, cb);
                });
            }
        }
    }
};

var nodeFind = function (node, route, test) {
    if (route.length === 0) {
         if (test(node)) {
             return node;
         }
    }
    else {
        var routeHead = _.head(route);
        var routeRest = _.rest(route);
        if (node.hash.hasOwnProperty(routeHead)) {
            var routeNext = _.head(routeRest);
            if (_.isNumber(routeNext)) {
                return nodeFind(node.hash[routeHead][routeNext], _.rest(routeRest), test);
            }
            else {
                var res;
                if (_.find(node.hash[routeHead], function (subnode, idx) {
                    res = nodeFind(subnode, routeRest, test);
                    return res;
                })) {
                    return res;
                }
            }
        }
    }
};

var docFind = function (doc, route, test) {
    var routeHead = _.head(route);
    var routeRest = _.rest(route);
    if (routeHead === doc.root.name) {
        return nodeFind(doc.root, route.slice(1), test);
    }
};

var docGet = function (doc, route) {
    var res;
    docFind(doc, route, function (node) {
        res = node;
        return true;
    });
    return res;
};

var nodeGet = function (node, route) {
    var res;
    nodeEach(node, route, function (subnode) {
        res = subnode;
    });
    return res;
};

var docEach = function (doc, route, cb) {
    var routeHead = _.head(route);
    var routeRest = _.rest(route);
    if (routeHead === doc.root.name) {
        nodeEach(doc.root, route.slice(1), cb);
    }
};

var docAction = function (doc, route, action) {
    if (module.exports.hasOwnProperty(action[0])) {
        var method = module.exports[action[0]];
        var args = _.rest(action);
        docEach(doc, route, function (node) {
            method.apply(null, [node].concat(args));
        });
    }
};


var copyNS = function (parent, child) {
    _.each(parent.attributes, function (val, name) {
        if (name.indexOf('xmlns:') === 0) {
            child.attributes[name] = val;
        }
    });
};

_.extend(module.exports, {
    parseString: parseString
    , parseNode: parseNode
    , docToString: docToString
    , nodeToString: nodeToString
    , elt: elt
    , text: text
    , appendNode: appendNode
    , setNode: setNode
    , nodeSet: setNode
    , defaultNode: defaultNode
    , doc: doc
    , value: value
    , docEach: docEach
    , docAction: docAction
    , docGet: docGet
    , nodeGet: nodeGet
    , docFind: docFind
    , nodeFind: nodeFind
    , processinginstruction: processinginstruction
    , comment: comment
    , copyNS: copyNS
});
