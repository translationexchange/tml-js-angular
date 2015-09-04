# TranslationExchange Angular directives [build status]

This adds angular directives that allow you to perform seamless and advanced translations using TML from TranslationExchange.

Learn more about [TML](http://translationexchange.com/docs/tml/basics)

## Requirements

- AngularJS
- TranslationExchange account


## How to get it

You can get it from [Bower](http://bower.io/)

```sh
bower install tml-js-angular
```

Or on [NPM](http://npmjs.org/)

```sh
npm install tml-js-angular
```

### Include it on your page (regular script tag)

### Include it on your page (AMD)


## Usage

#### As an element, with scope defined data
    <h3>
        <tml-tr>Welcome {user}</tml-tr>
    </h3>
    
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
    
The cool thing about filters is how easy it is to combine them:

    <h3> {{ "Hello {user}" | trl:this | toUpper }} </h3>
