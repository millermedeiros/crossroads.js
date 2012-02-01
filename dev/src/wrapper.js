//::LICENSE:://
(function (define) {
define('crossroads', ['signals'], function (signals) {
//::INTRO_JS:://
//::CROSSROADS_JS:://
//::ROUTE_JS:://
//::LEXER_JS:://
    return crossroads;
});
}(typeof define === 'function' && define.amd ? define : function (id, deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        var signals = require(deps[0]);
        module.exports = factory(signals);
    } else {
        window[id] = factory((function (value) {
            return window[value];
        }(deps[0])));
    }
}));
