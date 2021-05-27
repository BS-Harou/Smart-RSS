/**
 * @module BgProcess
 * @submodule modules/toDataURI
 */
define(function () {
    async function checkFavicon(source) {
        if (typeof Promise.any !== 'function') {
            Promise.any = (promises) => {
                return new Promise((resolve, reject) => {
                    let hasResolved = false;
                    let processedPromises = 0;
                    const rejectionReasons = [];
                    const resolveOnce = (value) => {
                        if (!hasResolved) {
                            hasResolved = true;
                            resolve(value);
                        }
                    };
                    const rejectionCheck = (reason) => {
                        rejectionReasons.push(reason);
                        if (rejectionReasons.length >= processedPromises) {
                            reject(rejectionReasons);
                        }
                    };
                    for (const promise of promises) {
                        processedPromises++;
                        promise.then((result) => {
                            resolveOnce(result);
                        }).catch((reason) => {
                            rejectionCheck(reason);
                        });
                    }
                });
            };
        }

        return new Promise((resolve, reject) => {
            const baseUrl = new URL(source.get('base'));

            async function getFaviconAddress(baseUrl) {
                return new Promise((resolve, reject) => {
                    if (settings.get('faviconSource') === 'duckduckgo') {
                        resolve('https://icons.duckduckgo.com/ip3/' + baseUrl.host + '.ico');
                        return;
                    }

                    if (settings.get('faviconsSource') === 'google') {
                        resolve('https://www.google.com/s2/favicons?domain=' + baseUrl.host);
                        return;
                    }

                    let xhr = new XMLHttpRequest();
                    xhr.ontimeout = () => {
                        reject('timeout');
                    };
                    xhr.onloadend = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            reject('network error');
                            return;
                        }
                        if (xhr.status !== 200) {
                            reject('Encountered non-200 response trying to parse ' + baseUrl.origin);
                            return;
                        }
                        const baseDocumentContents = xhr.responseText.replace(/<body(.*?)<\/body>/gm, '');
                        const baseDocument = new DOMParser().parseFromString(baseDocumentContents, 'text/html');
                        const linkElements = [...baseDocument.querySelectorAll('link[rel*="icon"][href]')];

                        const links = [];

                        linkElements.forEach((link) => {
                            const favicon = link.getAttribute('href');
                            if (!favicon) {
                                return;
                            }
                            if (favicon.includes('svg')) {
                                return;
                            }
                            if (favicon.startsWith('http')) {
                                links.push(favicon);
                            }
                            if (favicon.startsWith('//')) {
                                links.push(baseUrl.protocol + favicon);
                                return;
                            }
                            if (favicon.startsWith('data')) {
                                links.push(favicon);
                                return;
                            }
                            if (favicon.startsWith('/')) {
                                links.push(baseUrl.origin + favicon);
                                return;
                            }

                            links.push(baseUrl.origin + '/' + favicon);
                        });

                        links.push(baseUrl.origin + '/favicon.ico');

                        resolve(links);
                    };

                    xhr.open('GET', baseUrl.origin);
                    xhr.timeout = 1000 * 30;
                    xhr.send();
                });
            }

            getFaviconAddress(baseUrl)
                .then((faviconAddresses) => {
                    const promises = faviconAddresses.map((favicon) => {
                        return toDataURI(favicon);
                    });
                    Promise.any(promises)
                        .then((dataURI) => {
                            resolve(dataURI);
                        }).catch((errors) => {
                        reject(errors);
                    });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }


    // /**
    //  * Image specific data URI converter
    //  * @class toDataURI
    //  * @constructor
    //  * @extends Object
    //  */
    function toDataURI(favicon) {
        return new Promise((resolve, reject) => {
            if (favicon.startsWith('data')) {
                resolve(favicon);
            }
            const xhr = new window.XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.onerror = () => {
                reject('[modules/toDataURI] error on: ' + favicon);
            };
            xhr.ontimeout = () => {
                reject('timeout');
            };
            xhr.onloadend = function () {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    reject('[modules/toDataURI] network error on: ' + favicon);
                    return;
                }
                if (xhr.status !== 200) {
                    reject('[modules/toDataURI] non-200 on: ' + favicon);
                    return;
                }
                const type = xhr.getResponseHeader('content-type');
                if (!~type.indexOf('image') || xhr.response.byteLength < 10) {
                    reject('[modules/toDataURI] Not an image on: ' + favicon);
                    return;
                }
                const imgData = 'data:' + type + ';base64,' + AB2B64(xhr.response);

                const expiresHeader = xhr.getResponseHeader('expires');

                let expires = 0;
                if (expiresHeader) {
                    expires = parseInt(Math.round((new Date(expiresHeader)).getTime() / 1000));
                } else {
                    const cacheControlHeader = xhr.getResponseHeader('cache-control');
                    let maxAge = 60 * 60 * 24 * 7;
                    if (cacheControlHeader && cacheControlHeader.includes('max-age=')) {
                        const newMaxAge = parseInt(/max-age=([0-9]+).*/gi.exec(cacheControlHeader)[1]);
                        maxAge = newMaxAge > 0 ? newMaxAge : maxAge;
                    }
                    expires = parseInt(Math.round((new Date()).getTime() / 1000)) + maxAge;
                }

                resolve({favicon: imgData, faviconExpires: expires});
            };
            xhr.open('GET', favicon);
            xhr.timeout = 1000 * 30;
            xhr.send();
        });
    }


    /* Custom Base64 encoder. */
    function AB2B64(arrayBuffer) {
        let base64 = '';
        const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        const bytes = new Uint8Array(arrayBuffer);
        const byteLength = bytes.byteLength;
        const byteRemainder = byteLength % 3;
        const mainLength = byteLength - byteRemainder;

        let a, b, c, d;
        let chunk;

        for (let i = 0; i < mainLength; i = i + 3) {
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63; // 63       = 2^6 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        if (byteRemainder === 1) {
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
            b = (chunk & 3) << 4; // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '==';
        } else if (byteRemainder === 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
            c = (chunk & 15) << 2; // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }

        return base64;
    }

    return {
        image: function () {
            return toDataURI.apply(null, arguments);
        },
        checkFavicon: function () {
            return checkFavicon.apply(null, arguments);
        }
    };
});
