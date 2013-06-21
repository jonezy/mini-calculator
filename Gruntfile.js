module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          './j/calculator.min.js': ['./j/extensions.js','./j/namespace.js', './j/helpers.js','./j/calculator.js']
        }
      }
      //build: {
        //src: './j/calculator.js',
        //dest: './j/calculator.min.js'
      //}
    },
    cssmin: {
      compress:{
        files: {
          './c/calculator.min.css':['./c/calculator.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default',['uglify','cssmin']);
};
