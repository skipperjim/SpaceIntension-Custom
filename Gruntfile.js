var properties = require('./src/js/game/properties.js');
/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        project: {
            src: 'src/js',
            js: '<%= project.src %>/game/{,*/}*.js',
            dest: 'build/js',
            bundle: 'build/js/app.min.js',
            port: properties.port,
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        },
        // Task configuration.
        clean: ['./build/'],
        jade: {
            compile: {
                options: {
                    data: {
                        properties: properties,
                        productionBuild: productionBuild
                    }
                },
                files: {
                    'build/index.html': ['src/templates/index.jade']
                }
            }
        },
        stylus: {
            compile: {
                files: {
                    'build/style/index.css': ['src/style/index.styl']
                },
                options: {
                    sourcemaps: !productionBuild
                }
            }
        },
        browserify: {
            app: {
                src: ['<%= project.src %>/game/app.js'],
                dest: '<%= project.bundle %>',
                options: {
                    transform: ['browserify-shim'],
                    watch: true,
                    bundleOptions: {
                        debug: !productionBuild
                    }
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 8
            },
            assets: {
                files: [
                    {
                        src: [
                        'build/index.html',
                        '<%= project.bundle %>'
                        ]
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '<%= project.banner %>',
                beautify: true
            },
            dist: {
                files: {
                    '<%= project.bundle %>': '<%= project.bundle %>'
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        pngmin: {
            options: {
                ext: '.png',
                force: true
            },
            compile: {
                files: [
                    {
                        src: 'src/assets/images/*.png',
                        dest: 'src/assets/images/'
                    }
                ]
            }
        },
        connect: {
            dev: {
                options: {
                    port: '<%= project.port %>',
                    base: './build'
                }
            },
            socket: {
                options: {
                    port: '<%= project.port %>',
                    base: './build',
                    socketio: true,
                    keepalive: true
                }
            }
        },
        express: {
            options: {
                // Setting to `false` will effectively just run `node path/to/server.js`
                background: false,
                // Called when the spawned server throws errors
                fallback: function () {},
                // Override node env's PORT
                port: '<%= project.port %>',
            },
            server: {
                options: {
                    script: './server.js'
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= project.port %>'
            }
        },
        watch: {
            options: {
                livereload: productionBuild ? false : properties.liveReloadPort
            },
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            },
            js: {
                files: '<%= project.dest %>/**/*.js',
                tasks: ['jade']
            },
            jade: {
                files: 'src/templates/*.jade',
                tasks: ['jade']
            },
            stylus: {
                files: 'src/style/*.styl',
                tasks: ['stylus']
            },
            images: {
                files: 'src/images/**/*',
                tasks: ['copy:images']
            },
            audio: {
                files: 'src/audio/**/*',
                tasks: ['copy:audio']
            }
        },
        compress: {
            options: {
                archive: '<%= pkg.name %>.zip'
            },
            zip: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*'],
                    dest: '<%= pkg.name %>/'
}]
            },
            cocoon: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*']
}]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-socket.io');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-pngmin');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Default task.
    grunt.registerTask('basic', ['jshint', 'qunit', 'concat', 'uglify']);
        grunt.registerTask('default', [
        'clean',
        'browserify',
        'jade',
        'stylus',
        'copy',
        'connect:socket',
        'express:server',
        'open',
        'watch',
    ]);

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'browserify',
        'jade',
        'stylus',
        'uglify',
        'copy',
        'cacheBust',
        'connect:socket',
        'express:server',
        'open',
        'watch'
    ]);
    
    grunt.registerTask('optimise', ['pngmin', 'copy:images']);
    grunt.registerTask('cocoon', ['compress:cocoon']);
    grunt.registerTask('zip', ['compress:zip']);

};