
 
//-------------------
//
//  This file is used only to study different kinds of APIs, CODE DESCRIBED HERE MAY **NEVER** BE IMPLEMENTED.
//
//------------------



//==== add new route ====//


//01 - config object + callback => ugly and unorganized

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


//02 - params => ugly

//params => id:String, pattern:String, [callback]:Function, [rules]:Object
crossroads.add('lipsum', 'lorem_{ipsum}', function(ipsum){
		//do anything with value
	}, {
		ipsum : /\w+/
	}
);


//03 - simplified params + public properties - probably most popular usage *** FAVORITE ***
var foo = crossroads.add('/{foo}/{bar}', myAwesomeCallback);
foo.id = 'foobar';


//04 - signals + public properties - flexible (multiple listeners) *** FAVORITE ***
var bar = crossroads.addRoute('/{foo}');
bar.separator = '-'; //will match: [/lorem/, /lorem/ipsum/dolor, /lorem_ipsum_dolor], won't match: [/lorem-, /lorem-ipsum/dolor]
bar.matched.add(myAwesomeListener);



//05 - "classical" => uncool, overly verbose.. no need to create a route without adding it to the router.
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


//02 - id + segments => easy to pass parameters in case you forget order, not a huge fan of strings for ids tho.. *** FAVORITE ***
//params => routeId:string, [segments]:Object
crossroads.route('foobar', {
	bar : 5,
	ipsum : 102
});

//02_2 - route + segments => if method accepts a string it should also accept a reference to the route..  *** FAVORITE ***
//params => routeId:string, [segments]:Object
crossroads.route(myRoute, {
	bar : 5,
	ipsum : 102
});


//03 - config object => unnecessary
crossroads.trigger({
	id : 'foobar',
	segments : {
		bar : 5,
		ipsum : 102
	}
});


//====== Get Route ======//

//01 - I can't see myself using the ID but it may be useful for someone... *** FAVORITE ***
var myRoute = crossroads.getRouteById('foobar');
myRoute.matched.add(myOtherCallback);



//====== Remove/Destroy Route ======//

//01 - by id
crossroads.removeRoute('foobar');

//02 - by route
crossroads.removeRoute(myRoute);

//03 - dispose *** FAVORITE ***
myRoute.dispose();



//====== Not-found / default route ======//



crossroads.notMatched.add(listener);
crossroads.notFound.add(listener);
crossroads.notRouted.add(listener); //strange
crossroads.routed.add(listener); // maybe keep this one, can be useful in some weird scenarios *** FAVORITE ***
crossroads.failed.add(listener); //not matching a route isn't a failure
crossroads.bypassed.add(listener); // simple name *** FAVORITE ***

crossroads.setDefault(listener);



//====== Config ======//

crossroads.openTag = '{';
crossroads.closeTag = '}';

crossroads.paramRegexp = /{[^}]+}/; //no need to create new regexp object every time, harder to customize but not that much.. *** FAVORITE ***

crossroads.separator = '/'; //used to divide route segments *** FAVORITE ***

