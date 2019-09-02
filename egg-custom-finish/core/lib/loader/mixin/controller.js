const path = require('path');
const is = require('is-type-of');
const FULLPATH = require('../file_loader').FULLPATH;
const utils = require('../../utils');
module.exports = {
    loadController(opt = {}) {
        opt = Object.assign({
                caseStyle: 'lower',
                directory: path.join(this.options.baseDir, 'app/controller'),
                initializer: (obj, opt) => {
                    // if (is.function(obj) && !is.generatorFunction(obj) && !is.class(obj) && !is.asyncFunction(obj)) {
                    //     obj = obj(this.app);
                    // }

                    if (is.class(obj)) {
                        obj.prototype.pathName = opt.pathName;
                        obj.prototype.fullPath = opt.path;
                        return wrapClass(obj);
                    } else {
                        throw new Error('now only support Class type in controller');
                    }

                    // if (is.object(obj)) {
                    //     return wrapObject(obj, opt.path);
                    // }
                    // // support generatorFunction for forward compatbility
                    // if (is.generatorFunction(obj) || is.asyncFunction(obj)) {
                    //     return wrapObject({
                    //         'module.exports': obj
                    //     }, opt.path)['module.exports'];
                    // }
                    // return obj;
                }
            },
            opt
        );
        const controllerBase = opt.directory;
        this.loadToApp(controllerBase, 'controller', opt);
    }
};

// wrap the class, yield a object with middlewares
function wrapClass(Controller) {
    let proto = Controller.prototype;
    const ret = {};
    // tracing the prototype chain
    while (proto !== Object.prototype) {
        const keys = Object.getOwnPropertyNames(proto);
        for (const key of keys) {
            // getOwnPropertyNames will return constructor
            // that should be ignored
            if (key === 'constructor') {
                continue;
            }
            // skip getter, setter & non-function properties
            const d = Object.getOwnPropertyDescriptor(proto, key);
            // prevent to override sub method
            if (is.function(d.value) && !ret.hasOwnProperty(key)) {
                ret[key] = methodToMiddleware(Controller, key);
                ret[key][FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return ret;

    function methodToMiddleware(Controller, key) {
        return function classControllerMiddleware(...args) {
            const controller = new Controller(this);
            // if (!this.app.config.controller || !this.app.config.controller.supportParams) {
            //     args = [this];
            // }
            return utils.callFn(controller[key], args, controller);
        };
    }
}