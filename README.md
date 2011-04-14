
# Crossroads - JavaScript Routes #

**IMPORTANT: API isn't totally defined yet, some features may be added/removed and methods/properties renamed.**


## Introduction ##

The main of idea behind Crossroads is that it should be a routing system that isn't strictly related with the 
URL, location.hash and/or server requests. The idea is to process any kind of string input and execute functions
that matches the desired patterns.

Crossroads shouldn't depend on any existing library or framework besides [JS-Signals](http://millermedeiros.github.com/js-signals/) 
(used for event dispatching), it should be a pluggable piece that can be used on many different kinds of projects, 
be it for a server-side or client-side application.

The syntax of the pattern matching will probably follow Rails and Pyramid style since those standards are being 
used broadly and are already familiar to a lot of people but it won't follow Rails/Pyramid mapping to *views* 
and *actions*, it will just dispatch an event triggering any listener for that specific *route*. It should be 
as flexible as possible while still being simple to use.


## Dependencies ##

**This library requires [JS-Signals](http://millermedeiros.github.com/js-signals/) to work.**



## Draft API ##

The `crossroads` object contain these public methods/properties:  

    crossroads.addRoute(pattern:String, callback:(Function|null));
    crossroads.removeRoute(myRoute:Route); //detroy route
    crossroads.removeAllRoutes();
    crossroads.parse(request:String); //parse string trying to find a route that matches it
    crossroads.getNumRoutes();
    crossroads.bypassed; //{Signal} : dispatched when can't find a route that match request

`crossrodas.addRoute()` returns a `Route` object which contains these public methods/properties:

    myRoute.match(request); //return boolean
    myRoute.dispose(); //remove route from `crossroads` and destroy it
    myRoute.matched; //{Signal} : dispatched when request match route
    myRoute.rules; //{Object|undefined} : validation rules for route params
    

### simple usage ###

    crossroads.addRoute('/news/{id}', function(id){
      alert(id);
    });
    crossroads.parse('/news/123'); //will match news/{id} route passing 123 as param


### storing route reference and attaching mutiple listeners ####

    var articleRoute = crossroads.addRoute('/article/{category}/{name}');
    articleRoute.matched.add(function(category, name){
      alert(category);
    });
    articleRoute.matched.add(function(category, name){
      alert(name);
    });
    crossroads.parse('/article/lol_catz/keyboard_cat'); //will match articleRoute passing "lol_catz" and "keyboard_cat" as param


### using RegExp to validate params ###

    var specialNews = crossroads.addRoute('/news/{id}');
    specialNews.matched.add(function(id){
      alert(id);
    });
    specialNews.rules = {
      id : /[0-9]+/ //match only numeric ids
    };
    crossroads.parse('/news/asd'); //won't match since ID isn't numeric
    crossroads.parse('/news/5'); //will match


### using functions to validate params ###

    var specialNews = crossroads.addRoute('/news/{id}');
    specialNews.matched.add(function(id){
      alert(id);
    });
    specialNews.rules = {
      id : function(value, request, matches){
        return value === 'asd';
      }
    };
    crossroads.parse('/news/asd'); //will match
    crossroads.parse('/news/5'); //won't match


### using arrays to validate params ###

    var specialNews = crossroads.addRoute('/news/{id}');
    specialNews.matched.add(function(id){
      alert(id);
    });
    specialNews.rules = {
      id : ['asd', 5, 123, 23456, 'qwerty']
    };
    crossroads.parse('/news/asd'); //will match
    crossroads.parse('/news/5'); //will match
    crossroads.parse('/news/loremipsum'); //won't match


### manually checking if route match a string ###

    var myRoute = crossroads.addRoute('/foo/{id}');
    var match = myRoute.match('/foo/bar'); //true


### disposing route ###

    var myRoute = crossroads.addRoute('/foo/{id}');
    myRoute.dispose(); //remove route from crossroads and also remove all listeners


## License ##

[MIT License](http://www.opensource.org/licenses/mit-license.php)