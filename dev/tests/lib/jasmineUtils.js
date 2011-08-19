define('jasmineUtils', [], function(){
    return {
        //should be only called after all specs are loaded
        runSpecs : function(){
            jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
            jasmine.getEnv().execute();
        }
    };
});
