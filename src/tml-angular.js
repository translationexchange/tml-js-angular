(function ()
{
    var moduleName = 'tml';
    var tml;

    if (typeof require == 'function')
    {
        tml = require('tml-js-browser');
    } 
    else
    {
        tml = {
            tml: window.tml,
            tr: window.tr,
            trl: window.trl
        }
    }

    function tmlAngular(angular)
    {
        function compileTranslation($parse, $rootScope, scope, elem, valueStr, argsStr)
        {
            function runTemplate(tplScope)
            {
                //console.log('running template %s with %s', elem._template, JSON.stringify(tplScope));
                    elem.html(tml.tr(elem._template, tplScope));
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
                
                function performTranslation()
                {
                    runTemplate(parsedArgs ? parsedArgs(scope) : {});
                }
                
                performTranslation();
            }
            else {
                //get a list of token the translation needs
                var neededScopeTokens = new tml.tml.TranslationKey({label: valueStr});
                var tokenNames = neededScopeTokens.getDataTokens().map(function (item)
                {
                    return item.short_name;
                });

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
                                    return $parse(attrVal)(scope);
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

                function performTranslation()
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
                    setLanguage(language);
                    $rootScope.$digest();
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
            .directive('tmlTr', ['tmlConfig', '$parse', '$rootScope', function (tmlConfig, $parse, $rootScope)
            {
                return {
                    scope: true,
                    //priority: 10,
                    restrict: 'A',
                    link: function (scope, elm, attrs, ctrl)
                    {
                        var value = attrs.tmlTr && attrs.tmlTr != 'tml-tr' ? attrs.tmlTr : elm.html();
                        compileTranslation($parse, $rootScope, scope, elm, value, attrs.values);
                    }
                }
            }])
            //main tmlTr element directive
            .directive('tmlTr', ['tmlConfig', '$parse', '$rootScope', function (tmlConfig, $parse, $rootScope)
            {
                return {
                    scope: true,
                    //priority: 10,
                    restrict: 'E',
                    link: function (scope, elm, attrs, ctrl)
                    {
                        compileTranslation($parse, $rootScope, scope, elm, attrs.translateStr || elm.html(), attrs.values);
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


