<p align="center">
  <img src="https://avatars0.githubusercontent.com/u/1316274?v=3&s=200">
</p>

# TML for Angular.JS
[![Build Status](https://travis-ci.org/translationexchange/tml-js.svg?branch=master)](https://travis-ci.org/translationexchange/tml-js-angular)
[![Coverage Status](https://coveralls.io/repos/translationexchange/tml-js-angular/badge.png?branch=master)](https://coveralls.io/r/translationexchange/tml-js-angular?branch=master)


This adds angular directives that allow you to perform seamless and advanced translations using TML from TranslationExchange.

Learn more about [TML](http://translationexchange.com/docs/tml/basics)

## Requirements

- AngularJS
- TranslationExchange account


## Getting started

You can get it from [Bower](http://bower.io/)

```sh
bower install tml-angular
```

Or on [NPM](http://npmjs.org/)

```sh
npm install tml-angular
```

### Include it on your app (regular script tag)

example is for bower, replace bower_components if you put it elsewhere.
Make sure to include it after the angular script tag

    <script src='bower_components/angular/angular.js'></script>
    <script src='bower_components/tml-angular/src/tml-angular.js'></script>

    angular.module('app', ['tml']);

### Include it on your page (browserify)

    angular.module('app', [require('tml-angular')]);

## Usage

#### As an element, with scope defined data
    
        <tml-tr>Welcome {user}</tml-tr>
    
    
This expects a `user` key to be defined on the scope where this directive is used.

    $scope.user = 'John Doe';
    
#### As an attribute, with scope defined data
    <h3 tml-tr>Welcome {user}</h3>
    
You can also specify the string to be translated as the value of the attribute:

    <h3 tml-tr="Welcome {user}"></h3>

#### As an element, with custom token associations

You can pass angular expressions in attributes wherever you use `tml-tr`

    $scope.stats = { visit_times: 240 };

    <h3 num='stats.visit_times' tml-tr>Welcome {user}, this is your {num} visit</h3>
    

#### As an element, using a values object

Instead of using scope names, it is possible to pass an object with token values, as custom as you make it

    $scope.userParams = { name: 'Steve', age: 28, birthday: true };

    <div class="user-profile">
        <h3 tml-tr values="{ user: userParams.name, age: userParams.age }">
            Hello {user}, you're {age} years old!
        </h3>
        <cake ng-if='userParams.birthday' />
    </div>

Note: this cannot be combined with scope parameters  
use either custom attributes + scope variables or a values object, not both.


### Some examples of advanced usage

#### Translate input placeholders and other special fields

There's a global function for translating labels, called `trl(template, values)`, it has access to the scope it runs from, so the `values` object is optional

    <input type="text" placeholder="{{ trl('Your username') }}" />
    <input type="password" placeholder="{{ trl('Your password') }}" />
    

You can also use `trl` as a filter, this is recommended for simple strings only, because filter doesn't have access to the scope by default.

    <input placeholder="{{ 'Your username' | trl }}" type="text" />
    <input placeholder="{{ 'Your password' | trl }}" type="password" />
    
Passing parameters is possible with filters:

Use the surrounding scope (pass the `this` keyword):

    {{ "Hello {user}" | trl:this }}
    
Pass a custom values object:

    {{ "Hello {user}, this is your {num} visit" | trl:{ user: logged_in_user, num: visitCounter } }}
    
The cool thing about filters is how easy it is to combine them (but otherwise - prefer to use the other options):

    <h3> {{ "Hello {user}" | trl:this | toUpper }} </h3>

<a name="language-options"></a>
### Accessing current language options ###

There are a few useful properties exposed on the `$rootScope`:

`currentLocale` - Language specific stylesheets

Dynamically replace the stylesheet based on locale of the language

     <link rel='stylesheet' href="/stylesheets/style-{{currentLocale}}.css"/>
     
Show a block for a specific locale

     <h5 ng-if="{{currentLocale == 'fr'}}">Hello French Speakers</h5> 

`isRtl` - Right to left stylesheets

Dynamically replace the stylesheet based on direction of the language

     <link rel='stylesheet' href="/stylesheets/style{{isRtl ? '.rtl' : ''}}.css"/>
     
     
Links
==================

* Register on TranslationExchange.com: http://translationexchange.com

* Read TranslationExchange's documentation: http://docs.translationexchange.com

* Follow TranslationExchange on Twitter: https://twitter.com/translationx

* Connect with TranslationExchange on Facebook: https://www.facebook.com/translationexchange

* If you have any questions or suggestions, contact us: feedback@translationexchange.com


Copyright and license
==================

Copyright (c) 2016 Translation Exchange, Inc

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.     
