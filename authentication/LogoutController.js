conAngular
	.controller('LogoutController', ['$state', '$location', '$rootScope', 'AuthenticationService', function($state, $location, $rootScope,AuthenticationService){
	 
		(function initController() {
			// TODO: Check CORS for DELETE
            AuthenticationService.logout( $rootScope.globals.currentUser.authdata );
            Materialize.toast('¡Adios ' + $rootScope.globals.currentUser.name + '! Vuelve pronto.', 4000);
	    	AuthenticationService.clearCredentials();
			$state.go('/login');

		})();

	}]);