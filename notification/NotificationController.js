conAngular.controller('NotificationController', ['$scope', '$rootScope', '$state', 'NotificationService', function( $scope, $rootScope, $state, NotificationService ) {

    (function initController() {
        fetchUnreadNotifications();
        fetchReadNotifications();
        markAllAsRead();
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

    $scope.deleteNotification = function( id ){
        NotificationService.destroy( id, function(){
            $('#' + id).remove();
            Materialize.toast('¡Notificación eliminada!', 4000, 'red');
        });
    }

    $scope.getNotificationUrl = function( title, id ){
        var url;
        switch( title ){
            case 'Solicitud de entrada':
                url = '#/pending-entry-requests';
                break;
            default:
                url = '#/view-item/'+id;
        }
        return url;
    }

    function fetchUnreadNotifications(){
        NotificationService.getUnread( function( unreadNotifications ){
            $scope.unreadNotifications = unreadNotifications;
            NotificationHelper.updateNotifications( 0 );
            if( 0 == unreadNotifications.length ) $('.notification-text').text('No tienes notificaciones nuevas.')
        });
    }

    function fetchReadNotifications(){
        NotificationService.getRead( function( readNotifications ){
            $scope.readNotifications = readNotifications;
        });
    }

    function markAllAsRead(){ NotificationService.markAsRead( function(){}); }

}]);