module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          './src/j/calculator.min.js': ['./src/j/extensions.js','./src/j/namespace.js', './src/j/helpers.js','./src/j/calculator.js']
        }
      }
    },
    cssmin: {
      compress:{
        files: {
          './src/c/calculator.min.css':['./src/c/calculator.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default',['uglify','cssmin']);
};
