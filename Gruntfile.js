module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		modules: [], // filled in by the build task
		dist: 'dist',
		filename: 'ui-cg',
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [], // filled in by the build task
				dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
			}
		},
		uglify: {
			dist: {
				src: ['<%= concat.dist.dest %>'],
				dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
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
		
		grunt.task.run(['concat', 'uglify']);		
	});

	return grunt;
}