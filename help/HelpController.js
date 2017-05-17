conAngular
    .controller('HelpController', ['$scope', '$location', '$state', 'NotificationService', function($scope, $location, $state, NotificationService){

        (function initController() {
            fetchNewNotifications();
        })();

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

    }]);