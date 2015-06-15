﻿var jsdom = require("jsdom-nogyp");

var ENVIORMENT_NOT_READY = "Angular enviorment not yet ready";

function ngCompile(modules, angularPath) {
    this.modules = modules || [], _self = this;
    this.modules.push(angularPath || "./public/angular.js");
    this.ready = false;


    this.env = jsdom.env({
        html: '<p></p>',
        done: function (errors, window) {
            if (errors)
                console.log(errors);
            else {
                global.window = window;
                global.document = window.document;

                _self.modules.forEach(function (module) { require(module); })

                _self.window = window;
                _self.angular = window.angular;
                window.angular.injector(['ng']).invoke(function ($rootScope, $compile, $interpolate) {
                    _self.services = { $rootScope: $rootScope, $compile: $compile, $interpolate: $interpolate };
                    this.ready = true;
                });
            }
        }
    });
}
ngCompile.prototype.$new = function () {
    if (!this.ready) throw new Error(ENVIORMENT_NOT_READY);
    return this.services.$rootScope.$new()
}
ngCompile.prototype.$interpolate = function (html) {
    if (!this.ready) throw new Error(ENVIORMENT_NOT_READY);
    return this.services.$interpolate(html)
}
ngCompile.prototype.$compile = function (html) {
    if (!this.ready) throw new Error(ENVIORMENT_NOT_READY);
    if (typeof html === "object") html = (html.length ? html[0].outerHTML : html.outerHTML);
    var $scope = this.$new(), _self = this;
    return function (context) {
        _self.angular.extend($scope, context);
        var elem = _self.services.$compile(html)($scope);
        elem = _self.angular.element('<div/>').append(elem);
        $scope.$apply();
        var str = elem[0].innerHTML;
        $scope.$destroy();
        elem = $scope = null;
        return str;
    }
}


module.exports = ngCompile;