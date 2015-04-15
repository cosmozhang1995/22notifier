module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			sass: {
				files: ['assets/stylesheets/**/*.scss'],
				tasks: ['sass']
			}
		},
		sass: {
			styles: {
				options: {
					style: 'expanded'
				},
				files: [{
					// 'public/stylesheets/**/*.css': 'public/stylesheets/'
					expand: true,
					cwd: 'assets/stylesheets',
					src: ['**/*.scss'],
					dest: 'public/stylesheets',
					ext: '.css'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('load_bower_components', 'Load bower components', function() {
		grunt.file.delete(__dirname + '/public/vendor');
		grunt.file.copy(__dirname + '/bower_components', __dirname + '/public/vendor')
	});

	grunt.registerTask('server', 'Launch express server', function() {
		var app = require('./app');
		app.listen(3000);
	});

	grunt.registerTask('default', ['sass', 'server', 'watch']);
}