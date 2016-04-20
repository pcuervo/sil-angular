conAngular
    .service('NotificationService', ['$http', '$rootScope', function( $http, $rootScope ){
        var service = {};
 
        service.getNumUnread = getNumUnread;
        service.getUnread = getUnread;
        service.getRead = getRead;
        service.destroy = destroy;
        service.markAsRead = markAsRead;
        return service;

        function getNumUnread( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'notifications/get_num_unread';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.unread_notifications );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getNumUnread

        function getUnread( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'notifications/get_unread';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.notifications );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getUnread

        function getRead( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'notifications/get_read';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response.notifications );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getRead

        function destroy( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'notifications/destroy';
            $http.post( serviceUrl, { id: id }
            )
               .success(function ( response ) {
                    console.log( response );
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// destroy

        function markAsRead( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'notifications/mark_as_read';
            $http.post( serviceUrl, {}
            )
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// markAsRead

    }]);
