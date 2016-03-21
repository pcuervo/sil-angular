// Sidebar Controller
conAngular.controller('SidebarController', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
    $scope.$on('$includeContentLoaded', function() {
        conApp.initSidebar();

        $rootScope.$watch('loggedIn', function() {
            if( $rootScope.loggedIn ) {
                $scope.role = $rootScope.globals.currentUser.role;
                $scope.roleName = UserService.getRole( $scope.role );
            }
        });

    });
}]);