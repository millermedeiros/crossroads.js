# Crossroads.js Changelog #


## NEXT ##

## API Changes ##

 - added `crossroads.normalizeFn` (issue #31)



## v0.6.0 (2011/08/31) ##

## API Changes ##

 - changed `crossroads.shouldTypecast` default value to `false` (issue #23)
 - added magic rule to normalize route params before dispatch `rules.normalize_`. (#21)
 - added crossroads.VERSION

### Fixes ###

 - fix optional "/" between required params. (#25)
 - only test optional params if value != null. (#26)
 - fix CommonJS wrapper, wasn't exporting crossroads properly (#27)

### Other ###

 - Migrated unit tests from YUI to Jasmine to allow testing on nodejs and also 
   because it runs locally and gives better error messages. Increased a lot the
   number of tests that helped to spot a few edge cases. (#5)
 - Changed wrapper to generate a single distribution file that runs on all
   environments. (#27)



## v0.5.0 (2011/08/17) ##

### API Changes ###

 - added numbered rules for RegExp pattern and alias to segments (#16)
 - added support to optional segments (#17)
 - added property `crossroads.shouldTypecast` to enable/disable typecasting
   segments values. (#18)
 - added support to multiple instances (#19)

### Other ###

 - Refactored `crossroads` core object to make it cleaner.

### Fixes ###

 - fix trailing slash before optional param (#22)



## v0.4 (2011/06/06) ##

### API Changes ###

 - added magic rule to validate whole request `rules.request_`. (#14)

### Other ###

 - changed behavior of trailing slash at the end of string pattern so it doesn't affect route anymore (#12).
 - added NPM package.



## v0.3 (2011/05/03) ##

### API Changes ###

 - added support for RegExp route pattern. (#8)
 - added signal `routed` to crossroads. (#9)
 - added commonjs module wrapper.



## v0.2 (2011/04/14) ##

### API Changes ###
 
 - added priority param to `addRoute`. (#2) 

### Other ###

 - added "js-signals" as module dependency on AMD version.



## v0.1.1 (2011/04/14) ##

### Fixes ###

 - safe guarded from empty `parse` calls.



## v0.1 (2011/04/14) ##

 - initial release with basic features support.
