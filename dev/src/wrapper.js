//::LICENSE:://
(function (define) {
define(['signals'], function (signals) {
//::INTRO_JS:://
//::CROSSROADS_JS:://
//::ROUTE_JS:://
//::LEXER_JS:://
    return crossroads;
});
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require(deps[0]));
    } else {
        /*jshint sub:true */
        window['crossroads'] = factory(window[deps[0]]);
    }
}));
