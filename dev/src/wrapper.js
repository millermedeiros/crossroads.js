//::LICENSE:://
(function () {
var factory = function (signals, async) {
//::INTRO_JS:://
//::CROSSROADS_JS:://
//::ROUTE_JS:://
//::LEXER_JS:://
    return crossroads;
};

if (typeof define === 'function' && define.amd) {
    define(['signals', 'async'], factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory(require('signals'), require('async'));
} else {
    /*jshint sub:true */
    window['crossroads'] = factory(window['signals'], window['async']);
}

}());

