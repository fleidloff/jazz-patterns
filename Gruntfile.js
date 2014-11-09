module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
      concat: {
        options: {
          separator: '',
        },
        dist: {
          src: ['js/Tuba/Tuba.js', 'js/Tuba/Tuba.Format.js', 'js/Tuba/Tuba.Pattern.js', 'js/Tuba/Tuba.Scale.js', 'js/Tuba/Plugins/*.js'],
          dest: 'js/Tuba.js',
        },
      },
      less: {
          development: {
            files: {
              "css/style.css": "css/style.less"
            }
          }
      },
      watch: {
          scripts: {
            files: ['js/Tuba/**/*.js'],
            tasks: ['concat'],
            options: {
              spawn: false,
              livereload: true
            },
          },
          styles: {
            files: ['css/*.less'],
            tasks: ['less'],
            options: {
              spawn: false,
              livereload: true
            },
          },
        },
    });

    grunt.registerTask('default', ['concat', 'less', 'watch']);
}
