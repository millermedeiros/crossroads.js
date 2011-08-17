var signals = {};
signals.Signal = function(){};
signals.Signal.prototype = {
    dispatch : function(){},
    add : function(){},
    addOnce : function(){},
    remove : function(){},
    removeAll : function(){},
    getNumListeners : function(){},
    dispose : function(){}
};
