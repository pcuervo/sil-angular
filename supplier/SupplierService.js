conAngular.service('SupplierService', ['$http', '$rootScope', function($http, $rootScope){

    var service = {};
    service.register = register;
    service.getAll = getAll;
    service.byId = byId;
    return service;



    /******************
    * PUBLIC FUNCTIONS
    *******************/

    function register( name, callback ){

        var serviceUrl = $rootScope.apiUrl + 'suppliers/';
        $http.post(serviceUrl, {
                supplier: {
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
        var serviceUrl = $rootScope.apiUrl + 'suppliers/';
        $http.get(serviceUrl)
           .success(function ( response ) {
                callback( response.suppliers );
           })
           .error(function ( response ) {
                callback( response );
           });
    }// getAll

    function byId( id, callback ){
        var serviceUrl = $rootScope.apiUrl + 'suppliers/' + id;
        $http.get(serviceUrl)
           .success(function ( response ) {
                callback( response.supplier );
           })
           .error(function ( response ) {
                callback( response );
           });
    }// byId

}]);

