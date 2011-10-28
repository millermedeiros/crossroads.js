//::LICENSE:://
(function (define) {
    define('crossroads', function (require) {
        var signals = require('signals');
//::INTRO_JS:://
//::CROSSROADS_JS:://
//::ROUTE_JS:://
//::LEXER_JS:://
        return crossroads;
    });
}(typeof define === 'function' && define.amd ? define : function (id, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require);
    } else {
        window[id] = factory(function (value) {
            return window[value];
        });
    }
}));
