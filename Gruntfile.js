module.exports = function(grunt) {
    grunt.loadNpmTasks('gruntify-eslint');
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            main: {
                src: ['Gruntfile.js', 'src/**/*.js', '!src/**/**.min.js'],
            },
        },
        htmlmin: {
            main: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true,
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '**/*.html',
                    dest: 'build/src/',
                }],
            }
        },
        cssmin: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: 'build/src/',
                    ext: '.min.css',
                }],
            },
        },
        uglify: {
            options: {
                preserveComments: 'some',
            },
            main: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js', '!**/*.min.js'],
                    dest: 'build/src/',
                    ext: '.min.js',
                }],
            },
        },
        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/**', '!**/*.html', '!**/*.js', '**/*.min.js', '!**/*.css', '**/*.min.css'],
                    dest: 'build/src',
                }],
            },
            debug: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/**', '!**/*.js', '**/*.min.js', '!**/*.css', '**/*.min.css'],
                    dest: 'debug/src',
                }, {
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js', '!**/*.min.js'],
                    dest: 'debug/src',
                    ext: '.min.js',
                }, {
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: 'debug/src',
                    ext: '.min.css',
                }],
            },
        },
        manifestSync: {
            build: {
                options: {
                    syncManifestFields: ['description', 'version'],
                    manifests: {
                        chromeExtension: 'build/src/manifest.json',
                    },
                },
            },
            debug: {
                options: {
                    syncManifestFields: ['description', 'version'],
                    manifests: {
                        chromeExtension: 'debug/src/manifest.json',
                    },
                },
            },
        },
        crx: {
            zip: {
                src: 'build/src/**',
                dest: 'build/BilibiliHelper.zip',
            },
            crx: {
                options: {
                    privateKey: 'BilibiliHelper.pem',
                },
                src: 'build/src/**',
                dest: 'build/BilibiliHelper.crx',
            },
        },
        clean: {
            build: {
                src: ['build/**'],
            },
            debug: {
                src: ['debug/**'],
            },
        },
    });

    grunt.registerTask('default', 'build');
    grunt.registerTask('build', ['eslint', 'htmlmin', 'cssmin', 'uglify', 'copy:build', 'manifestSync:build', 'buildnumber:build', 'crx:crx', 'crx:zip', 'rename']);
    grunt.registerTask('buildnumber', function(arg) {
        var json = {buildnumber: arg == 'build' ? process.env.TRAVIS_BUILD_NUMBER : -1};
        grunt.file.write((arg == 'build' ? 'build' : 'debug') + '/src/info.json', JSON.stringify(json));
    });
    grunt.registerTask('rename', function() {
        var filename = 'build/BilibiliHelper-V' + grunt.config.get('pkg').version + '-Build' + process.env.TRAVIS_BUILD_NUMBER;
        grunt.file.copy('build/BilibiliHelper.crx', filename + '.crx');
        grunt.file.copy('build/BilibiliHelper.zip', filename + '.zip');
        grunt.file.delete('build/BilibiliHelper.crx');
        grunt.file.delete('build/BilibiliHelper.zip');
    });
    grunt.registerTask('debug', ['eslint', 'copy:debug', 'manifestSync:debug', 'buildnumber:debug']);
};
