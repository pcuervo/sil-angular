conAngular
	.controller('LoginController', ['$scope', '$location', '$state', 'AuthenticationService', function($scope, $location, $state, AuthenticationService){
	 
		(function initController() {
	    	// reset login status
	        AuthenticationService.clearCredentials();
		})();

		$scope.login = function(){

			$scope.dataLoading = true;
			AuthenticationService.login($scope.email, $scope.password, function (response) {

                if( null === response ){
                    $scope.dataLoading = false;
                    Materialize.toast('No se ha podido establecer conexión con el servidor.', 4000, 'red');
                    return;
                }

                if( response.errors ){
                    $scope.dataLoading = false;
                    Materialize.toast(response.errors, 4000, 'red');
                    return;
                }

				var userObj = response.user;
				var userName = userObj.first_name + ' ' + userObj.last_name;
			    AuthenticationService.setCredentials(userObj.id, userName, $scope.email, userObj.role, userObj.auth_token, $scope.password);
				$scope.logged_in = true;

                // toast
                Materialize.toast('¡Hola ' + userName + ' bienvenido al SIL!', 4000);
				$state.go('/dashboard');

			});
		}// login

	}]);