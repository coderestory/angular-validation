(function () {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);
(function () {
    angular.module('validation.provider', [])
        .provider('$validation', function () {

            /**
             * true if the form is true, else false
             * @type {{}}
             */
            var valid = {};


            /**
             * Define validation type RegExp
             * @type {{required: RegExp, url: RegExp, email: RegExp}}
             */
            var expression = {
                required: /^.+$/,
                url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
                email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                number: /^\d+$/
            };


            /**
             * default error, success message
             * @type {{required: {error: string, success: string}, url: {error: string, success: string}, email: {error: string, success: string}, number: {error: string, success: string}}}
             */
            var defaultMsg = {
                required: {
                    error: 'This should be Required!!',
                    success: 'It\'s Required'
                },
                url: {
                    error: 'This should be Url',
                    success: 'It\'s Url'
                },
                email: {
                    error: 'This should be Email',
                    success: 'It\'s Email'
                },
                number: {
                    error: 'This should be Number',
                    success: 'It\'s Number'
                }
            };


            /**
             * Allow user to set a custom Expression, do remember set the default message using setupDefaultMsg
             * @param obj
             */
            var setupExpression = function (obj) {
                angular.extend(expression, obj);
            };


            /**
             * Allow user to set default message
             * @param obj
             */
            var setupDefaultMsg = function (obj) {
                angular.extend(defaultMsg, obj);
            };


            /**
             * Error message HTML, here's the default
             * @param message
             * @returns {string}
             */
            var errorHTML = function (message) {
                return '<p class="error">' + message + '</p>';
            };


            /**
             * Success message HTML, here's the default
             * @param message
             * @returns {string}
             */
            var successHTML = function (message) {
                return '<p class="success">' + message + '</p>';
            };


            /**
             * Check form valid, return true
             * checkValid(): Check the entire form valid from angular-validation `valid`
             * checkValid(Form): Check the specific form(Form) valid from angular `$valid`
             * @param form
             * @returns {boolean}
             */
            var checkValid = function (form) {

                if (form && form.$valid == false) {
                    return false;
                }

                // check if form not given
                for(var k in valid) {
                    if(valid[k] == false) {
                        return false;
                    }
                }

                return true;
            };


            /**
             * $get
             * @returns {{valid: {}, defaultMsg: {required: {error: string, success: string}, url: {error: string, success: string}}, errorHTML: Function, successHTML: Function}}
             */
            this.$get = function () {
                return {
                    valid: valid,
                    expression: expression,
                    defaultMsg: defaultMsg,
                    errorHTML: errorHTML,
                    successHTML: successHTML,
                    setupExpression: setupExpression,
                    setupDefaultMsg: setupDefaultMsg,
                    checkValid: checkValid
                }
            };


        });
}).call(this);
(function () {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['$validation', function ($validationProvider) {

            /**
             * Do this function iff validation valid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             */
            var validFunc = function (element, validMessage, validation, callback) {
                element.next().remove();
                element.after($validationProvider.successHTML(validMessage || $validationProvider.defaultMsg[validation].success));
                $validationProvider.valid[validation] = true;
                if (callback) callback();
            };


            /**
             * Do this function iff validation invalid
             * @param element
             * @param validMessage
             * @param validation
             */
            var invalidFunc = function (element, validMessage, validation, callback) {
                element.next().remove();
                element.after($validationProvider.errorHTML(validMessage || $validationProvider.defaultMsg[validation].error));
                $validationProvider.valid[validation] = false;
                if (callback) callback();
            };


            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    validCallback: '&',
                    invalidCallback: '&'
                },
                link: function (scope, element, attrs, ctrl) {
                    /**
                     * validator
                     * @type {*|Array}
                     *
                     * Convert user input String to Array
                     */
                    var validator = attrs.validator.split(',');

                    /**
                     * Valid/Invalid Message
                     */
                    element.after('<span></span>');

                    /**
                     * Check Every validator
                     */
                    validator.forEach(function (validation) {
                        var successMessage = validation + 'SuccessMessage',
                            errorMessage = validation + 'ErrorMessage';

                        /**
                         * Set Validity to false when Initial
                         */
                        ctrl.$setValidity(ctrl.$name, false);

                        scope.$watch('model', function (value) {
                            /**
                             * dirty, pristine, viewValue control here
                             */
                            if (ctrl.$pristine && ctrl.$viewValue) {

                            } else if (ctrl.$pristine) {
                                $validationProvider.valid[validation] = false;
                                return;
                            }

                            if ($validationProvider.expression[validation].test(value)) {
                                validFunc(element, attrs[successMessage], validation, scope.validCallback());

                                ctrl.$setValidity(ctrl.$name, true);
                                $validationProvider.valid[validation] = true;
                            } else {
                                invalidFunc(element, attrs[errorMessage], validation, scope.invalidCallback());

                                ctrl.$setValidity(ctrl.$name, false);
                                $validationProvider.valid[validation] = false;
                            }
                        });


                    });
                }
            }
        }]);
}).call(this);