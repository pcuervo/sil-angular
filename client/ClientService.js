conAngular
    .service('ClientService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.register = register;
        service.registerUser = registerUser;
        service.getAll = getAll;
        service.getAllUsers = getAllUsers;
        service.getContacts = getContacts;
        service.getInventoryItems = getInventoryItems;
        return service;



        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function register( name, callback ){

            var serviceUrl = $rootScope.apiUrl + 'clients/';
            $http.post(serviceUrl, {
                    client: {
                        name: name
                    }
                })
               .success(function ( response ) {
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });

        }// register

        function registerUser( email, firstName, lastName, role, password, phone, phoneExt, businessUnit, clientId, callback ){

            var serviceUrl = $rootScope.apiUrl + 'client_contacts/';
            $http.post(serviceUrl, 
                {
                    client_contact: {
                        email:                  email, 
                        first_name:             firstName,
                        last_name:              lastName,
                        role:                   role,
                        password:               password, 
                        password_confirmation:  password,
                        phone:                  phone, 
                        phone_ext:              phoneExt, 
                        business_unit:          businessUnit, 
                        client_id:              clientId, 
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

        }// registerUser

        function getAll( callback ){
            var serviceUrl = $rootScope.apiUrl + 'clients/';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.clients );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getAll

        function getAllUsers( callback ){
            var serviceUrl = $rootScope.apiUrl + 'client_contacts/';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    console.log(response);
                    callback( response.client_contacts );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getAllUsers

        function getContacts( clientId, callback ){
            var serviceUrl = $rootScope.apiUrl + 'client_contacts/get_by_client/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { id: clientId  } 
                })
               .success(function ( response ) {
                    callback( response.client_contacts );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getContacts

        function getInventoryItems( clientContactId, callback ){
            var serviceUrl = $rootScope.apiUrl + 'client_contacts/inventory_items/' + clientContactId;
            $http.get(serviceUrl)
            .success(function ( response ) {
                console.log( response );
                callback( response.client_contacts );
           })
           .error(function ( response ) {
                callback( response );
           });
        }

    }]);

