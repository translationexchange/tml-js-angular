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

/* global describe, inject, module, before, beforeEach,beforeAll, afterEach, it, expect, spyOn, jasmine */

'use strict';

describe('module tmlTr', function () {
    var $rootScope, $compile, $window, $filter, tml;

    var cleared = false;
    var connected = false;

    beforeEach(module('tml'));

    beforeEach(inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        $compile = $injector.get('$compile');
        $window = $injector.get('$window');
        $filter = $injector.get('$filter');

        if (!cleared)
        {
            $window.localStorage.clear();
            cleared = true;
        }
    }));

    beforeEach(function (done)
    {
        if (connected)
            return done();

        connected = true;

        $window.tml.init({
            source: 'index',
            cache: {
                enabled: true,
                adapter: "browser",
                version: '20150902001636',
                path: 'base/fixtures'
            },
            agent: {
                enabled: false
            },
            debug: true,
            onLoad: function (app)
            {
                $window.tml.changeLanguage('ru');
            },
            onLoadChange: function (app)
            {
                // render page
            },
            onLanguageChange: function ()
            {
                done();
            }

        });
    });



    afterEach(function () {
        // Restore original configuration after each test
        jasmine.clock().uninstall();
    });

    describe('basic tests', function () {

        it('should compile simple directive', function ()
        {
            $rootScope.testVar = 'Hello world';
            var element = angular.element('<span tml-tr>{{testVar}}</span>');
            element = $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('Hello world');
        });

        it('should compile simple directive 2', function ()
        {
            $rootScope.player = {rank:1, name:'Michael'};
            var element = angular.element('<span tml-tr="tml-tr" name="player.name" rank="\'#\' + player.rank">{name}, you\'re ranked {rank}</span>');
            element = $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('Michael, you\'re ranked #1');
        });

        it('should translate simple string', function ()
        {
            $rootScope.testVar = 'Hello';
            var element = angular.element('<span tml-tr="Hello World"></span>');
            element = $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('Привет Mир');
        });

        it('should do number conversions with scope value', function ()
        {
            $rootScope.count = 0;
            var element = angular.element('<tml-tr>Michael uploaded {count} photos</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Майкл Загрузил 0 фотографий');

            $rootScope.count = 1;
            $rootScope.$digest();
            expect(element.text()).toBe('Майкл Загрузил 1 фотографию');

            $rootScope.count = 2;
            $rootScope.$digest();
            expect(element.text()).toBe('Майкл Загрузил 2 фотографии');

            $rootScope.count = 5;
            $rootScope.$digest();
            expect(element.text()).toBe('Майкл Загрузил 5 фотографий');

        });

        it('should bind to nested property in tml with custom object value', function ()
        {
            $rootScope.logged_in = { name: "Anna" };

            var element = angular.element('<tml-tr user="logged_in">Hello {user.name}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Anna');

            $rootScope.logged_in = { name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');

        });

        xit('should bind to update to nested property in tml with custom object value', function ()
        {
            $rootScope.logged_in = { name: "Anna" };

            var element = angular.element('<tml-tr user="logged_in">Hello {user.name}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Anna');

            $rootScope.logged_in.name = "Boris";

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');

        });

        it('should translate with simple filter', function ()
        {
            var element = angular.element('<input placeholder=\'{{"Hello World" | trl}}\' />');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.attr('placeholder')).toBe('Привет Mир');

        });

        it('should translate with simple filter with passed scope', function ()
        {
            $rootScope.user = { name: "Anna" };
            var element = angular.element('<input placeholder=\'{{ "Hello {user.name}" | trl:this }}\' />');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.attr('placeholder')).toBe('Привет, Anna');

            $rootScope.user = { name: "Boris" };

            $rootScope.$digest();
            expect(element.attr('placeholder')).toBe('Привет, Boris');
        });

        it('should translate with global function with passed object', function ()
        {
            $rootScope.logged_in = "Anna";

            var element = angular.element('<span>{{ trl("Hello {user.name}", { user: { name: logged_in } })  }}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Anna');

            $rootScope.logged_in = "Boris";

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');
        });

        it('should translate with global function with scope object', function ()
        {
            $rootScope.user = { name: "Anna" };

            var element = angular.element('<span>{{ trl("Hello {user.name}")  }}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Anna');

            $rootScope.user = { name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');
        });

        it('should translate with global function with description', function ()
        {
            $rootScope.user = { first_name: "Jenny" };

            var element = angular.element('<span>{{ trl("Hello {user.first_name}", "welcome the user")  }}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Jenny');

            $rootScope.user = { first_name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');
        });

        it('should translate with global function with scope object 2', function ()
        {
            $rootScope.user = { name: "Anna" };

            var element = angular.element('<span>{{ trl("Hello {user.name}")  }}</span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Anna');

            $rootScope.user.name = "Boris";

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');
        });

        it('should translate with global function with custom proxied scope vars', function ()
        {
            $rootScope.pageNumber = 1;
            $rootScope.totalPages = 50;

            var element = angular.element('<span tml-tr="Load page {num} of {count}" values="{ num: pageNumber+1, count: totalPages }"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Загрузить страницу 2 из 50');

            $rootScope.pageNumber = 2;

            $rootScope.$digest();
            expect(element.text()).toBe('Загрузить страницу 3 из 50');

        });

        it('should translate with attribute with description', function ()
        {
            $rootScope.user = { first_name: "Jenny" };
            var element = angular.element('<span tml-tr="Hello {user.first_name}" tml-description="welcome the user"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Jenny');

            $rootScope.user = { first_name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');

        });

        it('should translate with attribute with description', function ()
        {
            $rootScope.user = { first_name: "Jenny", description: "welcome the user" };
            var element = angular.element('<span tml-tr="Hello {user.first_name}" tml-description="{{user.description}}"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Jenny');

            $rootScope.user = { first_name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');

        });

        it('should translate with attribute with context', function ()
        {
            $rootScope.user = { first_name: "Helen" };
            var element = angular.element('<span tml-tr="Hello {user.first_name}" tml-context="welcome the user"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Helen');

            $rootScope.user = { first_name: "Boris" };

            $rootScope.$digest();
            expect(element.text()).toBe('Привет, Boris');

        });

        it('should use scope number formatter', function ()
        {
            $rootScope.bigNumber = 12000;
            $rootScope.formatNum = function (value) {
                return $filter('number')(value);
            }

            var element = angular.element('<span tml-tr="{count} people reached" count="bigNumber" count-format="formatNum"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();
            expect(element.text()).toBe('12,000 people reached');

            $rootScope.bigNumber = 1200000;

            $rootScope.$digest();
            expect(element.text()).toBe('1,200,000 people reached');
        });

        it('should not error on unparseable property expression', function ()
        {
            var element = angular.element('<span tml-tr="Load page {num} of {count}" num="¯\(ツ)/¯" count="(╯°□°）╯︵ ┻━┻"></span>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();

            expect(element.text()).toBe('Загрузить страницу {num} из {count}');
        });

        it('should not error on unparseable values expression', function ()
        {
            var element = angular.element('<tml-tr values="(╯°□°）╯︵ ┻━┻">Load page {num} of {count}</tml-tr>');
            element = $compile(element)($rootScope);

            $rootScope.$digest();

            expect(element.text()).toBe('Загрузить страницу {num} из {count}');
        });

    });
});
