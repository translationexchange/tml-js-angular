'use strict';

module.exports = function (config) {
    config.set({
        basePath: '.',
        //urlRoot: 'base',
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        //logLevel: config.LOG_DEBUG,
        browsers: ['PhantomJS'],
        autoWatch: true,
        reporters: ['dots', 'coverage', 'coveralls'],
        files: [
            { pattern: 'fixtures/**/*.json', included: false, served: true },
            'node_modules/karma-phantomjs-shim/shim.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'node_modules/tml-js-browser/dist/*.js',
            'src/tml-angular.js',
            'test/tests.js'
        ],
        exclude: [
            'node_modules/tml-js-browser/dist/*.min.js'
        ],
        preprocessors: {
            'src/tml-angular.js': 'coverage'
        },
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        }
    });
};
