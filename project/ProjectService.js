conAngular
    .service('ProjectService', ['$http', '$q', '$rootScope', function($http, $q, $rootScope ){
        var service = {};
 
        service.getAll = getAll;
        service.get = get;
        service.byUser = byUser;
        service.getProjectUsers = getProjectUsers;
        service.getProjectClient = getProjectClient;
        service.register = register;
        service.addUsers = addUsers;
        service.removeUser = removeUser;
        service.update = update;
        service.destroy = destroy;

        return service;

        function getAll(callback) {
 
            var serviceUrl = $rootScope.apiUrl  + 'projects/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.projects );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getAll

        function get( id, callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'projects/'+id;
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.project );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// get

        function byUser( userId, callback) {
 
            var serviceUrl = $rootScope.apiUrl  + 'projects/by_user/' + userId;
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.projects );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// byUser

        function getProjectUsers( projectId, callback ) {
 
            var serviceUrl = $rootScope.apiUrl  + 'projects/get_project_users/' + projectId;
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getProjectUsers

        function getProjectClient( projectId, callback ) {
 
            var serviceUrl = $rootScope.apiUrl  + 'projects/get_project_client/' + projectId;
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getProjectClient

        function register( litobelId, projectName, clientId, clientContactId, pmId, aeId, callback ){
            var serviceUrl = $rootScope.apiUrl  + 'projects/';
            $http.post(serviceUrl, {
                    litobel_id: litobelId,
                    name:       projectName,
                    client_id:  clientId,
                    client_contact_id: clientContactId,
                    pm_id:      pmId,
                    ae_id:      aeId,
                })
               .success(function ( response ) {
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// register

        function addUsers( projectId, projectManagerId, accountExecutiveId, clientContactId, callback ){
            var serviceUrl = $rootScope.apiUrl  + 'projects/add_users';
            $http.post(serviceUrl, {
                project_id:         projectId,
                new_pm_id:          projectManagerId,
                new_ae_id:          accountExecutiveId,
                client_contact_id:  clientContactId
            })
           .success(function ( response ) {
                callback ( response );
           })
           .error(function ( response ) {
                callback ( response );
           });
        }// addUsers

        function removeUser( projectId, userId, callback ){
            var serviceUrl = $rootScope.apiUrl  + 'projects/remove_user';
            $http.post(serviceUrl, {
                user_id:     userId,
                project_id:  projectId,
            })
           .success(function ( response ) {
                console.log( response )
                callback ( response );
           })
           .error(function ( response ) {
                callback ( response );
           });
        }// removeUser

        function update( id, litobelId, projectName, callback ){
            var serviceUrl = $rootScope.apiUrl + 'projects/update';
            $http.post(serviceUrl, {
                    id: id,
                    project: {
                        litobel_id: litobelId,
                        name:       projectName
                    }
                })
               .success(function ( response ) {
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// update

        function destroy( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'projects/destroy';
            $http.post(serviceUrl, { id: id })
               .success(function ( response ) {
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// destroy

    }]);
