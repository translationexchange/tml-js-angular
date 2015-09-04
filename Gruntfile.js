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
            if (error)
            {
                console.error('error building tml-js-browser', error.message || err);
            }
            console.log(result.stdout);
            cb();
        });
    });
    grunt.registerTask('test', [
        'auto_install',
        'build_tml_js',
        'karma'
    ]);
    grunt.registerTask('buildandtest', [
        'build_tml_js',
        'karma'
    ]);
    grunt.registerTask('justtest', [
        'karma'
    ]);
};
