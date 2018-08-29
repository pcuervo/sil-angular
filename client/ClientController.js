conAngular
    .controller('ClientController', ['$scope', '$rootScope', '$state', '$stateParams', 'ClientService', 'NotificationService', '$location', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($scope, $rootScope, $state, $stateParams, ClientService, NotificationService, $location, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            var currentPath = $location.path();
            initClients( currentPath );
            fetchNewNotifications();
        })();

        

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.registerClient = function(){

            ClientService.register( $scope.clientName, function ( response ){

                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                
                    Materialize.toast('¡Cliente "' + $scope.clientName + '" registrado exitosamente!', 4000, 'green');
                    $state.go('/view-clients', {}, { reload: true });
            });
        }// registerClient

        $scope.registerClientUser = function(){

            ClientService.registerUser( $scope.email, $scope.firstName, $scope.lastName, 6, $scope.password, $scope.phone, $scope.phoneExt, $scope.businessUnit, $scope.clientId, function ( response ){

                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                
                    Materialize.toast('¡Contacto de cliente "' + $scope.firstName + ' ' + $scope.lastName + '" registrado exitosamente!', 4000, 'green');
                    $state.go('/view-client-users', {}, { reload: true });
            });
        }// registerClientUser

        $scope.getClientName = function( clientId ){

            var client = 'Google';

            for( var i in $scope.clients ){
                if( clientId === $scope.clients[i].id ) return $scope.clients[i].name
            }

        }// getClientName

        $scope.updateClientUser = function(){

            ClientService.updateUser( $scope.client.id, $scope.client.discount, $scope.client.email,  $scope.client.first_name,  $scope.client.last_name,  $scope.client.business_unit, $scope.client.phone,  $scope.client.phone_ext, $scope.password, $scope.passwordConfirmation, function ( response ){

                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    Materialize.toast('¡Cliente "' + response.first_name + ' ' + response.last_name + '" actualizado exitosamente!', 4000, 'green');
                    $state.go('/view-client-users', {}, { reload: true });
            });
        }// updateClientUser

        $scope.updateClient = function(){

            ClientService.updateClient( $scope.client.id, $scope.client.name, function ( response ){

                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    Materialize.toast('¡Cliente "' + response.name + '" actualizado exitosamente!', 4000, 'green');
                    $state.go('/view-clients', {}, { reload: true });
            });
        }// registerClient

        $scope.deleteClientUser = function(){
            ClientService.deleteUser( $scope.client.id, function ( response ){

                if(response.errors) {
                    ErrorHelper.display( response.errors );
                    return;
                }
                Materialize.toast('¡Cliente "' + response.first_name + ' ' + response.last_name + '" eliminado exitosamente!', 4000, 'green');
                $state.go('/view-client-users', {}, { reload: true });
            });
        }// deleteClientUser

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initClients( currentPath ){
            $scope.role = $rootScope.globals.currentUser.role;

            if( currentPath.indexOf( '/edit-client-user' ) > -1 ){
                getClientUser( $stateParams.userId );
                return;
            }

            if( currentPath.indexOf( '/edit-client' ) > -1 ){
                getClient( $stateParams.clientId );
                return;
            }

            getAllClients();
            getAllClientUsers();
            initClientDataTable();
            initClientUserDataTable();

        }// initClients

        function getAllClients(){
            ClientService.getAll( function( clients ){
                $scope.clients = clients;
            }); 
        }// getAllClients

        function getAllClientUsers(){

            ClientService.getAllUsers( function( clientUsers ){

                $scope.clientUsers = clientUsers;
                console.log( clientUsers );
                
            }); 

        }// getAllClientUsers

        function getClientUser( userId ){
            ClientService.getClient( userId, function( client ){
                console.log( userId );
                $scope.client = client;
            }); 
        }// getClientUser

        function getClient( client ){
            ClientService.getClientById( client, function( client ){
                console.log( client );
                $scope.client = client;
            }); 
        }// getClient

        function initClientDataTable(){

            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('pitp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];

            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initClientDataTable

        function initClientUserDataTable(){
            $scope.dtClientUserOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('pitp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtClientUserColumn = [
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];

            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initClientUserDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

    }]);