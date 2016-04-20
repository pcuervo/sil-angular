// Sidebar Controller
conAngular.controller('SidebarController', ['$scope', '$rootScope', 'UserService', 'NotificationService', function( $scope, $rootScope, UserService, NotificationService ) {

    (function initController() {
        //fetchNewNotifications();
    })();

    $scope.$on('$includeContentLoaded', function() {
        conApp.initSidebar();
        $rootScope.$watch('loggedIn', function() {
            if( $rootScope.loggedIn ) {
                $scope.role = $rootScope.globals.currentUser.role;
                $scope.roleName = UserService.getRole( $scope.role );
            }
        });
    });

    function fetchNewNotifications(){
        NotificationService.getNumUnread( function( numUnreadNotifications ){
            $scope.unreadNotifications = numUnreadNotifications;
        });
    }
}]);