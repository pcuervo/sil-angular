// Navbar Controller
conAngular.controller('NavbarController', ['$scope', '$rootScope', '$cookies', function($scope, $rootScope, $cookies) {
    $scope.$on('$includeContentLoaded', function() {

        $rootScope.$watch('loggedIn', function() {
            if( $rootScope.loggedIn ) $scope.role = $rootScope.globals.currentUser.role;
        });
    });
}]);
