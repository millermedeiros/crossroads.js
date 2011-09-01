//::LICENSE:://
(function(def){
def(['signals'], function(signals){

//::INTRO_JS:://
//::CROSSROADS_JS:://
//::ROUTE_JS:://
//::LEXER_JS:://
    return crossroads;

});
}(
    // wrapper to run code everywhere
    // based on http://bit.ly/c7U4h5
    typeof require === 'undefined'?
        //Browser
        function(deps, factory){
            this.crossroads = factory(signals);
        } :
        ((typeof exports === 'undefined')?
            //AMD
            define :
            //CommonJS
            function(deps, factory){
                module.exports = factory.apply(this, deps.map(require));
            }
        )
));
