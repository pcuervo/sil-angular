conAngular.controller('NotificationController', ['$scope', '$rootScope', '$state', 'NotificationService', function( $scope, $rootScope, $state, NotificationService ) {

    (function initController() {
        fetchUnreadNotifications();
        fetchReadNotifications();
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
            case 'Solicitud de entrada rechazada':
                url = '#/pending-entry-requests';
                break;
            case 'Solicitud de salida':
            case 'Cancelación de solicitud salida':
                url = '#/pending-withdrawal-requests';
                break;
            case 'Solicitud de envío':
                url = '#/pending-deliveries';
                break;
            case 'Aprobación de envío':
                url = '#/delivery-dashboard';
                break;
            case 'Aprobación de salida':
                url = '#/check-out';
                break;
            case 'Nuevo envío':
                url = '#/delivery-dashboard';
                break;
            case 'Envío rechazado':
                url = '#/delivery-dashboard';
                break;
            case 'Envío entregado':
                url = '#/delivery-dashboard';
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
            markAllAsRead();
        });
    }

    function fetchReadNotifications(){
        NotificationService.getRead( function( readNotifications ){
            $scope.readNotifications = readNotifications;
        });
    }

    function markAllAsRead(){ NotificationService.markAsRead( function(){}); }

}]);