conAngular
    .service('InventoryTransactionService', ['$http', '$rootScope', function($http, $rootScope){
        var service = {};
 
        service.getAll = getAll;
        service.byType = byType;
        service.byId = byId;
        service.getCheckOuts = getCheckOuts;
        service.getTypeClass = getTypeClass;
        service.getCheckOutsByClient = getCheckOutsByClient;
        return service;

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function getAll( callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_transactions/';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_transactions );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getAll

        function byType( type, callback ) {
 
            var transactionType = type == 'checkIns' ? 'get_check_ins' : 'get_check_outs';
            var serviceUrl = $rootScope.apiUrl + 'inventory_transactions/' + transactionType;
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_transactions );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// byType

        function byId( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_transactions/' + id;
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_transaction );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// byId

        function getCheckOuts( callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_transactions/get_check_outs';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_transactions );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getCheckOuts

        function getCheckOutsByClient( clientId, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_transactions/get_check_outs_by_client/' + clientId;
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_transactions );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getCheckOutsByClient

        function getTypeClass( type ){
            if( 'CheckOutTransaction' == type ) return 'red lighten-3';
            return 'green lighten-3';
        }// getTypeClass



        /******************
        * PRIVATE FUNCTIONS
        *******************/

    }]);
