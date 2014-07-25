module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-ngdocs');	
	grunt.loadNpmTasks('grunt-open');

	grunt.initConfig({
		modules: [], // filled in by the build task
		dist: 'dist',
		filename: 'ui-cg',
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			modules: 'angular.module("ui.cg", [<%= srcModules %>]);',
			banner: ['/*',
					 ' * <%= pkg.name %>',
					 ' * <%= pkg.homepage %>',
					 ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
					 ' * License: <%= pkg.license %>',
					 ' */\n'].join('\n')
		},
		concat: {
			options: {
				banner: '<%= meta.banner %><%= meta.modules %>\n'
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
		clean: {
			all: ['<%= dist %>'],
			docs: ['<%= ngdocs.options.dest %>']
		},
		ngdocs: {
			options: {
				dest: 'dist/docs',
				scripts: ['angular.js', '<%= concat.dist.dest %>'],
				html5Mode: false,
				title: 'ui.cg',
			},
			all: ['<%= concat.dist.dest %>']
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
			srcFiles: grunt.file.expand('src/' + name + '/*.js')
		};

		grunt.config('modules', grunt.config('modules').concat(module));
	}
	
	grunt.registerTask('build', 'Build the distributable', function () {
		var _ = grunt.util._;
		
		// Search all modules inside of the src/ directory
		grunt.file.expand({
			filter: 'isDirectory', cwd: '.'
		}, 'src/*').forEach(function (dir) {
			findModule(dir.split('/')[1]);
		});
		
		var modules = grunt.config('modules');
		
		grunt.config('srcModules', _.pluck(modules, 'moduleName'));

		var srcFiles = _.pluck(modules, 'srcFiles');
		// Set the concat task to concatenate the given src modules
		grunt.config(
			'concat.dist.src', 
			grunt.config('concat.dist.src').concat(srcFiles));
		
		grunt.task.run(['clean', 'concat', 'uglify', 'ngdocs']);		
	});
	
	grunt.registerTask('show-docs', 'Open the API docs', function () {
		grunt.task.run(['clean:docs', 'ngdocs', 'open:docs', 'connect']);
	});
	
	grunt.registerTask('default', ['build', 'open:docs', 'connect']);

	return grunt;
}