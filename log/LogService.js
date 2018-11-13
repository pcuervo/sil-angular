conAngular
.service('LogService', ['$http', '$rootScope', function( $http, $rootScope ){
  var service = {};
 
  service.getAll = getAll;
  return service;

  function getAll( callback ) {
    var serviceUrl = $rootScope.apiUrl + 'logs/';
    $http.get( serviceUrl)
    .success(function ( response ) {
        callback( response.logs );
    })
    .error(function ( response ) {
        callback( response );
    });
  }// getAll

}]);
