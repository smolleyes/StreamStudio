'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      client: {
        src: ['index.js'],
        dest: 'dist/omdb-client.js',
        options: {
          browserifyOptions: {
            standalone: 'omdb'
          }
        }
      }
    },
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> <%= pkg.version %> */\n'
      },
      build: {
        src: 'dist/omdb-client.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      beforeconcat: ['lib/**/*.js']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'uglify', 'jshint']);

};