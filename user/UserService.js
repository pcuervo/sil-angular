conAngular
    .service('UserService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.register = register;
        service.update = update;
        service.getAll = getAll;
        service.get = get;
        service.getProjectManagers = getProjectManagers
        service.getClientContacts = getClientContacts
        service.getAccountExecutives = getAccountExecutives
        service.getWarehouseAdmins = getWarehouseAdmins
        service.getDeliveryUsers = getDeliveryUsers
        service.getRole = getRole
        service.changePassword = changePassword
        service.deleteUser = deleteUser
        return service;



        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function register( email, firstName, lastName, role, password, callback ){

            var serviceUrl = $rootScope.apiUrl + 'users/';
            $http.post(serviceUrl, 
                {
                    user: {
                        email:                  email, 
                        first_name:             firstName,
                        last_name:              lastName,
                        role:                   role,
                        password:               password, 
                        password_confirmation:  password,

                    }
                })
               .success(function ( response ) {
                    console.log( response );
                    callback( response );
               })
               .error(function ( response ) {
                    console.log( response );
                    callback( response );
               });

        }// register

        function update( id, email, firstName, lastName, image, filename, callback ){

            var serviceUrl = $rootScope.apiUrl + 'users/update';
            $http.post(serviceUrl, 
                {
                    id:         id,
                    avatar:     image,
                    filename:   filename,
                    user: {
                        email:                  email, 
                        first_name:             firstName,
                        last_name:              lastName
                    }
                })
               .success(function ( response ) {
                    console.log( response );
                    callback( response );
               })
               .error(function ( response ) {
                    console.log( response );
                    callback( response );
               });

        }// update

        function getAll( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    console.log( response );
                    callback( response );
               });
        }// getAll

        function get( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.user );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// get

        function getProjectManagers( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/get_project_managers';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getProjectManagers

        function getClientContacts( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/get_client_contacts';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getClientContacts

        function getAccountExecutives( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/get_account_executives';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getAccountExecutives

        function getDeliveryUsers( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/get_delivery_users';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getDeliveryUsers

        function getWarehouseAdmins( callback ){
            var serviceUrl = $rootScope.apiUrl + 'users/get_warehouse_admins';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.users );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getWarehouseAdmins

        function getRole( roleId ){
            switch( roleId ){
                case 1: return 'Admin';
                case 2: return 'Project Manager';
                case 3: return 'Ejecutivo de cuenta';
                case 4: return 'Jefe almacén';
                case 5: return 'Repartidor';
                case 6: return 'Cliente';
            }
        }// getAccountExecutives

        function changePassword( password, passwordConfirmation, callback ){

            var serviceUrl = $rootScope.apiUrl + 'users/change_password';
            $http.post(serviceUrl, 
                {
                    user: {
                        password:               password,    
                        password_confirmation:  passwordConfirmation
                    }
                })
               .success(function ( response ) {
                    console.log( response );
                    callback( response );
               })
               .error(function ( response ) {
                    console.log( response );
                    callback( response );
               });

        }// changePassword

        function deleteUser( id, pm, ae, whAdmin, callback ){

            var serviceUrl = $rootScope.apiUrl + 'users/delete';
            $http.post(serviceUrl, 
            {
                id: id,
                pm: pm,
                ae: ae,
                wh_admin: whAdmin
            })
           .success(function ( response ) {
                console.log( response );
                callback( response );
           })
           .error(function ( response ) {
                console.log( response );
                callback( response );
            });

        }// deleteUser

    }]);

