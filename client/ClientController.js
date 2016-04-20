conAngular
    .controller('ClientController', ['$scope', '$state', 'ClientService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($scope, $state, ClientService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            getAllClients();
            getAllClientUsers();
            initClientDataTable();
            initClientUserDataTable();
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

            ClientService.registerUser( $scope.email, $scope.firstName, $scope.lastName, 4, $scope.password, $scope.phone, $scope.phoneExt, $scope.businessUnit, $scope.clientId, function ( response ){

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

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function getAllClients(){

            ClientService.getAll( function( clients ){

                $scope.clients = clients;
                
            }); 

        }// getAllClients

        function getAllClientUsers(){

            ClientService.getAllUsers( function( clientUsers ){

                $scope.clientUsers = clientUsers;
                
            }); 

        }// getAllClientUsers

        function initClientDataTable(){

            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
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
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtClientUserColumn = [
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];

            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initClientUserDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

    }]);