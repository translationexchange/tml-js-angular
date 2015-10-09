'use strict';

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-auto-install');

    grunt.initConfig({
        auto_install: {
            local: {},
            subdir: {
                options: {
                    cwd: 'node_modules/tml-js-browser',
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    //npm: '--production'
                }
            }
        },

        browserify: {
            dist: {
                src: ['src/tml-angular.js'],
                dest: 'dist/tml-angular-latest.js',
                options: {
                    browserifyOptions: {}
                }
            }
        },
        clean: {
            options: {
                force: true
            },
            build: ["./dist/**", "./node_modules/tml-js-browser/dist/*"]
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    //build tml-js-browser
    grunt.registerTask('build_tml_js', function() {
        var cb = this.async();
        grunt.util.spawn({
            grunt: true,
            args: ['build'],
            opts: {
                cwd: 'node_modules/tml-js-browser'
            }
        }, function(error, result, code) {
            console.log(result.stdout);
            cb();
        });
    });
    grunt.registerTask('installandbuild', [
        'auto_install',
        'clean',
        'build_tml_js',
        'browserify'
    ]);
    grunt.registerTask('test', [
        'auto_install',
        'clean',
        'build_tml_js',
        'browserify',
        'karma'
    ]);
    grunt.registerTask('buildandtest', [
        'clean',
        'build_tml_js',
        'browserify',
        'karma'
    ]);
    grunt.registerTask('justtest', [
        'karma'
    ]);
};
