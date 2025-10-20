// 브라우저 호환성 Polyfills

// ===== Array.prototype polyfills =====

// Array.prototype.includes (IE11)
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) return false;
        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (o[k] === searchElement) return true;
            k++;
        }
        return false;
    };
}

// Array.from (IE11)
if (!Array.from) {
    Array.from = (function() {
        var toStr = Object.prototype.toString;
        var isCallable = function(fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function(value) {
            var number = Number(value);
            if (isNaN(number)) return 0;
            if (number === 0 || !isFinite(number)) return number;
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };
        return function from(arrayLike) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            A.length = len;
            return A;
        };
    }());
}

// ===== String.prototype polyfills =====

// String.prototype.includes (IE11)
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (search instanceof RegExp) {
            throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) start = 0;
        return this.indexOf(search, start) !== -1;
    };
}

// String.prototype.startsWith (IE11)
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(search, pos) {
        pos = !pos || pos < 0 ? 0 : +pos;
        return this.substring(pos, pos + search.length) === search;
    };
}

// String.prototype.endsWith (IE11)
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

// String.prototype.padStart (IE11, Edge <15)
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

// String.prototype.repeat (IE11)
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var maxCount = str.length * count;
        count = Math.floor(Math.log(count) / Math.log(2));
        while (count) {
            str += str;
            count--;
        }
        str += str.substring(0, maxCount - str.length);
        return str;
    };
}

// ===== Object polyfills =====

// Object.assign (IE11)
if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

// Object.keys (IE8)
if (!Object.keys) {
    Object.keys = (function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
                'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
            ],
            dontEnumsLength = dontEnums.length;
        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }
            var result = [], prop, i;
            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }
            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// Object.values (IE11, Edge <14)
if (!Object.values) {
    Object.values = function(obj) {
        if (obj == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var values = [];
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                values.push(obj[key]);
            }
        }
        return values;
    };
}

// Object.entries (IE11, Edge <14)
if (!Object.entries) {
    Object.entries = function(obj) {
        if (obj == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var entries = [];
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                entries.push([key, obj[key]]);
            }
        }
        return entries;
    };
}

// ===== Math polyfills =====

// Math.sign (IE11)
if (!Math.sign) {
    Math.sign = function(x) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}

// Math.trunc (IE11)
if (!Math.trunc) {
    Math.trunc = function(x) {
        if (isNaN(x)) {
            return NaN;
        }
        if (x > 0) {
            return Math.floor(x);
        }
        return Math.ceil(x);
    };
}

// ===== Number polyfills =====

// Number.isNaN (IE11)
if (!Number.isNaN) {
    Number.isNaN = function(value) {
        return typeof value === 'number' && isNaN(value);
    };
}

// Number.isFinite (IE11)
if (!Number.isFinite) {
    Number.isFinite = function(value) {
        return typeof value === 'number' && isFinite(value);
    };
}

// Number.isInteger (IE11)
if (!Number.isInteger) {
    Number.isInteger = function(value) {
        return typeof value === 'number' && 
               isFinite(value) && 
               Math.floor(value) === value;
    };
}

// ===== Canvas API polyfills =====

// CanvasRenderingContext2D.roundRect (Safari <15, Firefox <89)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// ===== Promise polyfill =====
// Promise (IE11)
if (typeof Promise === 'undefined') {
    // 간단한 Promise polyfill
    window.Promise = function(executor) {
        var self = this;
        self.status = 'pending';
        self.value = undefined;
        self.handlers = [];

        function resolve(result) {
            if (self.status !== 'pending') return;
            self.status = 'fulfilled';
            self.value = result;
            self.handlers.forEach(handle);
        }

        function reject(error) {
            if (self.status !== 'pending') return;
            self.status = 'rejected';
            self.value = error;
            self.handlers.forEach(handle);
        }

        function handle(handler) {
            if (self.status === 'pending') {
                self.handlers.push(handler);
            } else {
                if (self.status === 'fulfilled' && handler.onFulfilled) {
                    handler.onFulfilled(self.value);
                }
                if (self.status === 'rejected' && handler.onRejected) {
                    handler.onRejected(self.value);
                }
            }
        }

        self.then = function(onFulfilled, onRejected) {
            return new Promise(function(resolve, reject) {
                handle({
                    onFulfilled: function(result) {
                        try {
                            if (typeof onFulfilled === 'function') {
                                resolve(onFulfilled(result));
                            } else {
                                resolve(result);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    },
                    onRejected: function(error) {
                        try {
                            if (typeof onRejected === 'function') {
                                resolve(onRejected(error));
                            } else {
                                reject(error);
                            }
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            });
        };

        self.catch = function(onRejected) {
            return self.then(null, onRejected);
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    };

    Promise.resolve = function(value) {
        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    };

    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            if (!Array.isArray(promises)) {
                return reject(new TypeError('Promise.all accepts an array'));
            }
            var results = [];
            var remaining = promises.length;
            if (remaining === 0) {
                return resolve(results);
            }
            function resolver(index) {
                return function(value) {
                    results[index] = value;
                    if (--remaining === 0) {
                        resolve(results);
                    }
                };
            }
            for (var i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(resolver(i), reject);
            }
        });
    };
}

// ===== Console polyfill =====
// console (IE9 이하)
if (typeof console === 'undefined') {
    window.console = {
        log: function() {},
        error: function() {},
        warn: function() {},
        info: function() {},
        debug: function() {}
    };
}

// ===== requestAnimationFrame polyfill =====
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
                                       window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { 
                callback(currTime + timeToCall); 
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// ===== CustomEvent polyfill =====
// CustomEvent (IE9-11)
(function() {
    if (typeof window.CustomEvent === 'function') return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    window.CustomEvent = CustomEvent;
}());

console.log('✅ Polyfills loaded successfully');
