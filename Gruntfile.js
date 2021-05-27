module.exports = function (grunt) {

    const {join, dirname} = require('path');
    const {readdirSync, lstatSync} = require('fs');


    const cleanup = function () {
        const defaultConfig = {
            removeFromManifest: [],
        };
        const config = Object.assign(defaultConfig, this.data);
        const root = join(__dirname, 'dist', this.target);
        const manifestPath = join(root, 'manifest.json');
        const originalManifest = grunt.file.readJSON(manifestPath);
        let newManifest = Object.assign({}, originalManifest);
        if (config.csp) {
            newManifest['content_security_policy'] = originalManifest[config.csp];
            delete newManifest[config.csp];
        }
        if (config.permissions) {
            newManifest['permissions'] = originalManifest[config.permissions];
            delete newManifest[config.permissions];
        }
        if (config.removeFromManifest) {
            config.removeFromManifest.forEach((item) => {
                delete newManifest[item];
            });
        }
        console.log(newManifest);
        grunt.file.write(manifestPath, JSON.stringify(newManifest, null, 2));
    };

    const commit = function (level = 'patch') {
        let {exec} = require('child_process');
        let done = this.async();
        exec('git add *', (err, stdout, stderr) => {
            if (err) {
                console.log(`stderr: ${stderr}`);
                done(false);
                return;
            }
            exec(`git commit -m "auto version bump: ${level}"`, (err) => {
                if (err) {
                    done(false);
                    return;
                }
                done(true);
            });
        });
    };

    const bumpVersion = function (level = 'patch') {
        const semver = require('semver');
        const manifestPath = join(__dirname, 'src/manifest.json');
        const manifest = grunt.file.readJSON(manifestPath);
        manifest.version = semver.inc(manifest.version, level);
        grunt.file.write(manifestPath, JSON.stringify(manifest, null, 2));
    };


    const scan = (dir) => {
        const filesList = [];
        readdirSync(dir).forEach((file) => {
            if (file[0] === '.') {
                return;
            }
            const filePath = join(dir, file);

            if (lstatSync(filePath).isDirectory()) {
                filesList.push(...scan(filePath));
                return;
            }
            filesList.push(filePath);
        });
        return filesList;
    };

    const zip = function () {
        const defaultConfig = {
            dirname: this.target,
        };
        const config = Object.assign(defaultConfig, this.data);
        const root = join(__dirname, 'dist', config.dirname);
        const manifestPath = join(root, 'manifest.json');


        const filesList = scan(root);

        const version = getVersion(manifestPath);
        const AdmZip = require('adm-zip');
        const zipFile = new AdmZip();
        filesList.forEach((file) => {
            // TODO: shorten somehow, make sure that `path` doesn't contain leading slashes nor backslashes
            let path = dirname(file).replace(root + '/', '').replace(root + '\\', '').replace(root, '');

            zipFile.addLocalFile(file, path);
        });
        zipFile.writeZip(join(__dirname, 'dist', 'SmartRSS_v' + version + '_' + this.target + '.zip'));
    };

    const getVersion = function (manifest) {
        return grunt.file.readJSON(manifest).version;
    };

    const stripComments = function () {
        const defaultConfig = {
            dirname: this.target,
        };
        const config = Object.assign(defaultConfig, this.data);
        const multilineComment = /^[\t\s]*\/\*\*?[^!][\s\S]*?\*\/[\r\n]/gm
        const specialComments = /^[\t\s]*\/\*!\*?[^!][\s\S]*?\*\/[\r\n]/gm
        const singleLineComment = /^[\t\s]*(\/\/)[^\n\r]*[\n\r]/gm
        const root = join(__dirname, 'dist', config.dirname);

        const filesList = scan(root);

        filesList.forEach((filePath) => {
            if (!filePath.endsWith('.js')) {
                return;
            }
            const contents = grunt.file.read(filePath)
                .replace(multilineComment, '')
                .replace(singleLineComment, '')
                .replace(specialComments, '');

            grunt.file.write(filePath, contents);
        });
    }


// Project configuration.
    grunt.initConfig({
        watch: {
            scripts: {
                files: ['src/**/*'],
                tasks: ['prepare'],
                options: {
                    spawn: true
                }
            }
        },
        cleanup: {
            firefox: {
                removeFromManifest: [
                    'chromium_content_security_policy',
                    'chromium_permissions'
                ]
            },
            chromium: {
                removeFromManifest: [
                    'browser_specific_settings',
                    'developer'
                ],
                permissions: 'chromium_permissions',
                csp: 'chromium_content_security_policy'
            }
        },
        copy: {
            firefox: {
                files: [{
                    expand: true,
                    cwd: './src/',
                    src: [
                        '**/*',
                        '!images/chrome-small-tile.png'
                    ],
                    filter: 'isFile',
                    dest: './dist/firefox/'
                }]
            },
            chromium: {
                files: [{
                    expand: true,
                    cwd: './src/',
                    src: [
                        '**/*',
                        '!images/chrome-small-tile.png'
                    ],
                    filter: 'isFile',
                    dest: './dist/chromium/'
                }]
            }
        },
        zip: {
            firefox: {},
            chromium: {}
        },
        comments: {
            firefox: {},
            chromium: {}
        },
    });

    grunt.registerTask('bump-version', '', bumpVersion);
    grunt.registerTask('commit', '', commit);
    grunt.registerTask('package', ['prepare', 'zip']);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerMultiTask('cleanup', '', cleanup);
    grunt.registerMultiTask('zip', '', zip);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerMultiTask('comments', '', stripComments)
    grunt.registerTask('prepare', ['copy', 'cleanup', 'comments']);


    grunt.registerTask('release', '', function (level = 'patch') {
        if (!['major', 'minor', 'patch'].includes(level)) {
            console.error('Wrong update level, aborting');
            return false;
        }
        grunt.task.run(['bump-version:' + level, 'commit:' + level, 'copy', 'cleanup', 'comments', 'zip']);
    });
};

