module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.initConfig({
        modules: [], // filled in by the build task
        dist: 'dist',
        filename: 'ui-cg',
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            modules: 'angular.module("ui.cg", ["ui.cg.tpls", <%= srcModules %>]);',
            tplmodules: 'angular.module("ui.cg.tpls", [<%= tplModules %>])',
            banner: [
                '/*',
                ' * <%= pkg.name %>',
                ' * <%= pkg.homepage %>',
                ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * License: <%= pkg.license %>',
                ' */\n'
            ].join('\n')
        },
        concat: {
            options: {
                banner: '<%= meta.banner %><%= meta.modules %>\n<%= meta.tplmodules %>\n'
            },
            dist: {
                src: [], // filled in by the build task
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
            }
        },
        html2js: {
          dist: {
            options: {
                module: null, // no bundle module for all the html2js templates
                base: '.'
            },
            files: [{
                expand: true,
                src: ['template/**/*.html'],
                ext: '.html.js'
            }]
          }
        },
        clean: {
            dist: ['<%= dist %>'],
            docs: ['<%= ngdocs.options.dest %>']
        },
        ngdocs: {
            options: {
                dest: 'dist/docs',
                scripts: [
                    'angular.js',
                    '<%= concat.dist.dest %>'
                ],
                styles: [
                    'docs/css/style.css'
                ],
                navTemplate: 'docs/nav.html',
                title: 'ui.cg',
                html5Mode: false
            },
            api: {
                src: ['<%= concat.dist.dest %>', 'docs/index.ngdoc'],
                title: 'API Documentation'
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                base: '<%= ngdocs.options.dest %>',
                keepalive: true
            },
            server: {}
        },
        open: {
            docs: {
                path: 'http://localhost:8000',
                app: 'Chrome'
            }
        },
        'gh-pages': {
            options: {
                base: '<%= ngdocs.options.dest %>'
            },
            src: ['**']
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            continuous: {
                singleRun: true
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                js: {
                    indentSize: 4,
                    maxPreserveNewlines: 2,
                    jslintHappy: true
                }
            }
        }
    });

    var foundModules = {};

    function findModule(name) {
        if (foundModules[name]) {
            return;
        }

        function breakup(text, separator) {
            return text.replace(/[A-Z]/g, function (match) {
                return separator + match;
            });
        }

        function ucwords(text) {
            return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                return $1.toUpperCase();
            });
        }

        function enquote(value) {
            return '"' + value + '"';
        }

        var module = {
            name: name,
            moduleName: enquote('ui.cg.' + name),
            displayName: ucwords(breakup(name, '')),
            srcFiles: grunt.file.expand('src/' + name + '/*.js'),
            tpljsFiles: grunt.file.expand('template/' + name + '/*.html.js'),
            tplModules: grunt.file.expand('template/' + name + '/*.html').map(enquote),
            ngdocs: grunt.file.expand('src/' + name + '/docs/*.ngdoc')
        };

        grunt.config('modules', grunt.config('modules').concat(module));
    }

    function getFilename(path) {
        var index = path.lastIndexOf('/');
        var filename = index !== -1 ? path.substr(index + 1) : path;
        index = filename.lastIndexOf('.');
        filename = index !== -1 ? filename.substr(0, index) : filename;

        return filename;
    }

    grunt.registerTask('build', 'Build the distributable', function () {

        grunt.task.run(['pre-build']);

        var _ = grunt.util._;

        // Search all modules inside of the src/ directory
        grunt.file.expand({
            filter: 'isDirectory',
            cwd: '.'
        }, 'src/*').forEach(function (dir) {
            findModule(dir.split('/')[1]);
        });

        var modules = grunt.config('modules');

        grunt.config('srcModules', _.pluck(modules, 'moduleName'));
        grunt.config('tplModules', _.pluck(modules, 'tplModules').filter(function (tpls) { return tpls.length > 0; } ));

        var srcFiles = [];
        _.each(modules, function (module) {
            _.each(module.srcFiles, function (srcFile) {
                var ngdoc = _.find(module.ngdocs, function (ngdoc) {
                    return getFilename(srcFile) === getFilename(ngdoc);
                });

                if (ngdoc) {
                    srcFiles.push(ngdoc);
                }

                srcFiles.push(srcFile);
            });
        });

        var tpljsFiles = _.pluck(modules, 'tpljsFiles');

        // Set the concat task to concatenate the given src modules
        grunt.config(
            'concat.dist.src',
            grunt.config('concat.dist.src').concat(srcFiles).concat(tpljsFiles));

        grunt.task.run(['concat', 'uglify']);
    });

    grunt.registerTask(
        'pre-build',
        'Pre-build tasks for configuring the build environment',
        ['clean', 'test']
    );

    grunt.registerTask('test', 'Run the tests on a single-run karma server', ['html2js', 'karma']);

    grunt.registerTask('build-docs', 'Build the API reference', function () {
       grunt.task.run(['build', 'ngdocs']);
    });

    grunt.registerTask('show-docs', 'Open the API docs', function () {
        grunt.task.run(['build-docs', 'open:docs', 'connect']);
    });

    grunt.registerTask('publish-docs', 'Publish the API reference', ['build', 'ngdocs', 'gh-pages']);

    grunt.registerTask('default', 'Build the distributable', ['build']);

    return grunt;
}
