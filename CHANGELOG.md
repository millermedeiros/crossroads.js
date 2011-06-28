# Crossroads.js Changelog #


## NEXT ##

### API Changes ###

 - added property `crossroads.shouldTypecast` to enable/disable typecasting
   segments values. (issue #18)
 - added support to optional segments (issue #17)
 - added support to multiple instances (issue #19)

### Other ###

 - Refactored `crossroads` core object to make it cleaner.



## v0.4 (2011/06/06) ##

### API Changes ###

 - added magic rule to validate whole request `rules.request_`. (issue #14)

### Other ###

 - changed behavior of trailing slash at the end of string pattern so it doesn't affect route anymore (issue #12).
 - added NPM package.


## v0.3 (2011/05/03) ##

### API Changes ###

 - added support for RegExp route pattern. (issue #8)
 - added signal `routed` to crossroads. (issue #9)
 - added commonjs module wrapper.



## v0.2 (2011/04/14) ##

### API Changes ###
 
 - added priority param to `addRoute`. (issue #2) 

### Other ###

 - added "js-signals" as module dependency on AMD version.



## v0.1.1 (2011/04/14) ##

### Fixes ###

 - safe guarded from empty `parse` calls.



## v0.1 (2011/04/14) ##

 - initial release with basic features support.
