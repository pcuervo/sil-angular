conAngular
    .service('AuthenticationService', ['$http', '$cookies', '$rootScope', function($http, $cookies, $rootScope){

        var service = {};
        service.login = login;
        service.logout = logout;
        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;
        service.isLoggedIn = isLoggedIn;

        return service;

        function login(email, password, callback) {
 
            var serviceUrl = $rootScope.apiUrl  + 'sessions/';
            $http.post(serviceUrl, { email: email, password: password })
               .success(function (response) {
                    callback(response);
               })
               .error(function (response) {
                    callback(response);
               });
               
        }// login
    
        function setCredentials(id, name, email, role, authToken, password, avatar) {

            var authdata = Base64.encode(email + ':' + password);
 
            $rootScope.globals = {
                currentUser: {
                    id:             id,
                    name:           name,
                    email:          email,
                    authdata:       authToken,
                    role:           role,
                    avatarUrl:      avatar
                }
            };
 
            $http.defaults.headers.common['Authorization'] = authToken;
            $cookies.putObject('globals', $rootScope.globals);
            $cookies.put('loggedIn', true);
            
        }
 
        function clearCredentials() {
            $rootScope.globals = {};
            $rootScope.loggedIn = false;
            
            $cookies.remove('globals');
            $cookies.put('loggedIn', false);
            //$http.defaults.headers.common.Authorization = 'Basic';

        }

        function logout( authToken ){
            var serviceUrl = $rootScope.apiUrl  + 'sessions/destroy/';
            $http.post(serviceUrl,  { id: authToken })
               .success(function (response) {
                    location.reload();
               })
               .error(function (response) {
                    ErrorHelper.display( response.errors );
               });
        }

        function isLoggedIn(token, callback) {
            var serviceUrl = $rootScope.apiUrl  + 'sessions/is_active';
            $http.post(serviceUrl, { 
                auth_token: token
            })
           .success(function (response) {
                callback(response);
           })
           .error(function (response) {
                callback(response);
           });
        }// login

    }]);

// Base64 encoding service used by AuthenticationService
    var Base64 = {
 
        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
 
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };