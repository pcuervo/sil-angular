conAngular
    .service('ClientService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.register = register;
        service.getAll = getAll;
        service.updateClient = updateClient;
        service.getClientById = getClientById;
        service.getWithdrawRequests = getWithdrawRequests;
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

        function updateClient( id, name, callback ){
            var serviceUrl = $rootScope.apiUrl + 'clients/update';
            $http.post(serviceUrl, {
                    id: id,
                    client: { name: name }
                })
               .success(function ( response ) {
                    callback ( response.client );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// update

        function getClientById( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'clients/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.client );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getClientById

        function getWithdrawRequests( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/by_user/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.withdraw_requests );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getWithdrawRequests
    }]);

