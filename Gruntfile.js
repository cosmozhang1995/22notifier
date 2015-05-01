var fs = require('fs');

module.exports = function(grunt) {
	// grunt.global = {};
	// grunt.global.app = require('./app');
	// grunt.global.server = null;
	global.app = require('./app');
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			// options: { spawn: false },
			sass: {
				files: ['assets/stylesheets/**/*.scss'],
				tasks: ['sass']
			},
			// server: {
			// 	files: ['util/**/*.js', 'routes/**/*.js', 'app.js'],
			// 	tasks: ['server']
			// }
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

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
		// if (target == "server") {
		// 	var realFilepath = fs.realpathSync(filepath),
		// 		realApppath = fs.realpathSync('./app.js');
		// 	console.log(realFilepath);
		// 	delete require.cache[realFilepath];
		// 	delete require.cache[realApppath];
		// }
		if (target == "server") {
			// grunt.global.server.close();
			global.app.server && global.app.server._connections && global.app.server.close();
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('load_bower_components', 'Load bower components', function() {
		grunt.file.delete(__dirname + '/public/vendor');
		grunt.file.copy(__dirname + '/bower_components', __dirname + '/public/vendor')
	});

	grunt.registerTask('server', 'Launch express server', function() {
		// grunt.global.server = grunt.global.app.listen(3000);
		// global.app.server && global.app.server._connections && global.app.server.close();
		global.app.server = global.app.listen(3000);
	});

	grunt.registerTask('default', ['sass', 'server', 'watch']);
}