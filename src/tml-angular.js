/**
 * Copyright (c) 2016 Translation Exchange, Inc.
 *
 *  _______                  _       _   _             ______          _
 * |__   __|                | |     | | (_)           |  ____|        | |
 *    | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___
 *    | | '__/ _` | '_ \/ __| |/ _` | __| |/ _ \| '_ \|  __| \ \/ / __| '_ \ / _` | '_ \ / _` |/ _ \
 *    | | | | (_| | | | \__ \ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/
 *    |_|_|  \__,_|_| |_|___/_|\__,_|\__|_|\___/|_| |_|______/_/\_\___|_| |_|\__,_|_| |_|\__, |\___|
 *                                                                                        __/ |
 *                                                                                       |___/
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function ()
{
    var moduleName = 'tml';
    var tml = require('tml-js-browser');

    function tmlAngular(angular)
    {
        function compileTranslation($parse, $compile, $rootScope, scope, elem, valueStr, argsStr)
        {
            function runTemplate(tplScope)
            {
                var params = {}, sKeys;
                tplScope = tplScope || {};
                sKeys = Object.keys(tplScope);
                for (var i = 0; i < sKeys.length; i++)
                {
                    var key = sKeys[i];
                    var value = tplScope[key]; 
                    if( Object.prototype.toString.call( value ) === '[object Array]' )
                    {
                        var paramVal = [value];
                        
                        if (tplScope[key + '-format'])
                            paramVal[1] = tplScope[key + '-format'];

                        if (tplScope[key + '-options'])
                            paramVal[2] = tplScope[key + '-options'];
                        
                        params[key] = paramVal;
                    }
                    else
                    {
                        params[key] = value;
                    }
                }
                //console.log('running template %s with %s', elem._template, JSON.stringify(params));
                elem.html(tml.tr(elem._template, params));
                $compile(angular.element(elem).contents())(scope);
            }

            elem._template = valueStr;

            var args = argsStr;
            if (args && angular.isString(args)) {
                var parsedArgs;
                try {
                    parsedArgs = $parse(args);
                }
                catch (err) {
                    //console.error('error parsing values argument', err);
                    //throw err;
                }
                if (parsedArgs) {
                    scope.$watch(parsedArgs, function (newVal)
                    {
                        runTemplate(newVal);
                    }, true);
                }
                
                $rootScope.$on('language-change', function (language)
                {
                    performTranslation(); 
                });

                var performTranslation = function()
                {
                    runTemplate(parsedArgs ? parsedArgs(scope) : {});
                }
                
                performTranslation();
            }
            else 
            {
                //get a list of token the translation needs
                var neededScopeTokens = new tml.tml.TranslationKey({label: valueStr});
                var tokenNames = neededScopeTokens.getDataTokens().map(function (item)
                {
                    return item.short_name;
                });
                var newNames = [];
                for (var i = 0; i < tokenNames.length; i++)
                {
                    var obj = tokenNames[i];
                    newNames.push(obj + '-format');
                    newNames.push(obj + '-options');
                }
                tokenNames = tokenNames.concat(newNames);

                var simpleTokenProxy = {
                    ____store: {}
                };

                //support values in arbitrary attribute names
                tokenNames.forEach(function (token)
                {
                    Object.defineProperty(simpleTokenProxy, token, {
                        get: function ()
                        {
                            //console.log('getting %s from %s', token, angular.isUndefined(simpleTokenProxy.____store[token]) ? 'scope' : 'proxy');

                            return angular.isUndefined(simpleTokenProxy.____store[token]) ? scope[token] :
                                   simpleTokenProxy.____store[token];
                        },
                        set: function (value)
                        {
                            //console.log('setting %s to %s', token, value);
                            simpleTokenProxy.____store[token] = value;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    var stopWatching = scope.$watch(
                        //watch attribute, try to evalute it's value on the scope.
                        function ()
                        {
                            var attrVal = elem.attr(token);

                            try {
                                if (attrVal) {
                                    var parsed = $parse(attrVal)
                                    if (parsed.literal)
                                        stopWatching();
                                    return parsed(scope);
                                }
                            }
                            catch (err) {
                                //we don't want to watch an unparseable expressions
                                //console.error('error parsing ' + attrVal + ': ' + token);
                                //throw err;
                                stopWatching();
                            }
                        },
                        function (newValue)
                        {
                            //console.log('%s changed, new value: %s', token,  newValue);
                            if (angular.isUndefined(newValue))
                                return;

                            simpleTokenProxy[token] = newValue;
                            runTemplate(simpleTokenProxy);
                        }
                    )
                });


                $rootScope.$on('language-change', function (language)
                {
                    performTranslation();
                });

                var performTranslation = function()
                {
                    runTemplate(simpleTokenProxy);
                }
                
                scope.$watch('[' + tokenNames.join(', ') + ']', function (newValuesArr, oldValuesArr)
                {
                    performTranslation();
                }, true);

                performTranslation();

            }
        }


        var app = angular.module(moduleName, [])
            .constant('tmlConfig', {})
            .run(['$rootScope', function ($rootScope)
            {
                $rootScope.tml = tml;
                tml.tml.config = tml.tml.config || {};
                //prevents auto refresh of the page on language change
                tml.tml.config.refreshHandled = true;
                
                //translate label function
                $rootScope.trl = function (template, values)
                {
                    return tml.trl(template, angular.isObject(values) ? values : this);
                };

                function setLanguage(language)
                {
                    if (language)
                    {
                        $rootScope.currentLanguage = language;
                        delete $rootScope.currentLanguage.application;
                        $rootScope.currentLocale = language.locale;
                        $rootScope.isRtl = !!language.right_to_left;
                    }
                }
                
                tml.tml.on('language-change', function (language)
                {
                    $rootScope.$emit('language-change', language);
                    var fn = setLanguage.bind(null, language);
                    var phase = $rootScope.$$phase;
                    if(phase == '$apply' || phase == '$digest')
                        $rootScope.$eval(fn);
                    else
                        $rootScope.$apply(fn);
                });
                
                $rootScope.$watch('tml.tml.getCurrentLanguage()', setLanguage);
                
                try
                {
                    setLanguage(tml.tml.getCurrentLanguage());
                }
                catch(er)
                {
                }
                
            }])
            //main tmlTr attribute directive
            .directive('tmlTr', ['tmlConfig', '$parse', '$compile', '$rootScope', function (tmlConfig, $parse, $compile, $rootScope)
            {
                return {
                    scope: true,
                    //priority: 10,
                    restrict: 'A',
                    link: function (scope, elm, attrs, ctrl)
                    {
                        var value = attrs.tmlTr && attrs.tmlTr != 'tml-tr' ? attrs.tmlTr : elm.html();
                        compileTranslation($parse, $compile, $rootScope, scope, elm, value, attrs.values);
                    }
                }
            }])
            //main tmlTr element directive
            .directive('tmlTr', ['tmlConfig', '$parse', '$compile', '$rootScope', function (tmlConfig, $parse, $compile, $rootScope)
            {
                return {
                    scope: true,
                    //priority: 10,
                    restrict: 'E',
                    link: function (scope, elm, attrs, ctrl)
                    {
                        compileTranslation($parse, $compile, $rootScope, scope, elm, attrs.translateStr || elm.html(), attrs.values);
                    }
                }
            }])
            //simple label filter
            .filter('trl', function ()
            {
                return function (template, values)
                {
                    return tml.trl(template, values);
                }
            })
            .directive('tmlLs', [function ()
            {
                return function (scope, element, attrs)
                {
                    attrs.$set('data-tml-language-selector', attrs.tmlLs);
                    attrs.$set('data-tml-language-selector-element', attrs.selectorElement);
                    attrs.$set('data-tml-toggle', 'true');
                    
                    if (Trex && Trex.language_selectors && Trex.language_selectors.transformElem)
                    {
                        Trex.language_selectors.transformElem(element[0]);
                    }
                };
            }]);

        return app;
    }

    //AMD/CommonJS support
    if ( typeof exports === 'object' ) {
        tmlAngular(angular);
        module.exports = moduleName;
    } else if (typeof define === 'function' && define.amd) {
        define(['angular'], tmlAngular);
    } else {
        tmlAngular(angular);
    }
})();


