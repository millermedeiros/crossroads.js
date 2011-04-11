
 
//-------------------
//
//  This file is used only to study different kinds of APIs, CODE DESCRIBED HERE MAY **NEVER** BE IMPLEMENTED.
//
//------------------



//==== add new route ====//


//01 - config object + callback 

//params => {pattern:String, callback:Function, [id]:String, [rules]:Object, [separator]:String}
crossroads.add({
	id : 'foobar', //unique ID, not required. used as convenience to trigger/get routes later. 
	pattern : '/{foo}/{bar}/{ipsum}',
	rules : {
		foo : /\d{1,3}/, //custom regexp to validate segment
		bar : function(val, match, request){ //custom function to validate segment
			var val2 = match.bar; //match object contain all segments values
			return (typeof val === 'number' && val > 10); //if segment match rule
		},
		ipsum : ['qwerty', 'dvorak'] //allowed values
	},
	separator : '/', //default string used to separate segments
	callback : function(bar, ipsum){
		//do anything with values
	}
});


//02 - params

//params => id:String, pattern:String, [callback]:Function, [rules]:Object
crossroads.add('lipsum', 'lorem_{ipsum}', function(ipsum){
		//do anything with value
	}, {
		ipsum : /\w+/
	}
);


//03 - simplified params + public properties *** FAVORITE ***
var foo = crossroads.add('/{foo}/{bar}', myAwesomeCallback);
foo.id = 'foobar';


//04 - signals + public properties *** FAVORITE ***
var bar = crossroads.add('/{foo}');
bar.separator = '-'; //will match: [/lorem/, /lorem/ipsum/dolor, /lorem_ipsum_dolor], won't match: [/lorem-, /lorem-ipsum/dolor]
bar.matched.add(myAwesomeListener);



//05 - "classical"
var a = new crossroads.Route('/{foo}/{bar}/{ipsum}', myCallback);
a.rules = {
	bar : crossroads.INT,
	ipsum : crossroads.WORD
};
crossroads.addRoute(a);



//====== Trigger/Routing ======//

//possible method names: route, parse, run, 

//01 - plain string *** FAVORITE ***
crossroads.route('/foo/5/102'); //will trigger any route that matches this pattern 


//02 - id + segments *** FAVORITE ***
//params => routeId:string, [segments]:Object
crossroads.trigger('foobar', {
	bar : 5,
	ipsum : 102
});

//02_2 - route + segments *** FAVORITE ***
//params => routeId:string, [segments]:Object
crossroads.trigger(myRoute, {
	bar : 5,
	ipsum : 102
});


//03 - config object
crossroads.trigger({
	id : 'foobar',
	segments : {
		bar : 5,
		ipsum : 102
	}
});


//====== Get Route ======//

//01 - *** FAVORITE ***
var myRoute = crossroads.getById('foobar');
myRoute.matched.add(myOtherCallback);



//====== Remove/Destroy Route ======//

//01 - by id
crossroads.remove('foobar');

//02 - by route
crossroads.remove(myRoute);

//03 - dispose *** FAVORITE ***
myRoute.dispose();
