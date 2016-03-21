conAngular
    .controller('UserController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'UserService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, UserService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){
        
        var currentPath = $location.path();

        (function initController() {
            if( '/edit-profile' === currentPath || '/my-account' === currentPath ){
                getUser( $rootScope.globals.currentUser.id );
                return;
            }
            if( 0 !== Object.keys($stateParams).length ) {
                getUser( $stateParams.userId ); 
                return;
            }
            getAllUsers();
            initUsersDataTable();
        })();

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.captureItemData = function(){
            $scope.currentStep = CONFIRMATION_STEP;
            getItemImg();
        }      

        $scope.registerUser = function(){

            // Add feedback saving
            console.log('registrando usuario...');

            UserService.register( $scope.email, $scope.firstName, $scope.lastName, $scope.role, $scope.password, function ( response ){

                    if(response.errors) {
                        console.log(response.errors);
                        ErrorHelper.display( response.errors );
                        return;
                    }
                
                    Materialize.toast('¡Usuario "' + $scope.firstName + ' ' + $scope.lastName + '" registrado exitosamente!', 4000, 'green');
                    $state.go('/view-users', {}, { reload: true });
            });
        }

        $scope.updateUser = function(){

            // Add feedback saving
            console.log('actualizando usuario...');

            UserService.update( $scope.id, $scope.email, $scope.firstName, $scope.lastName, function ( response ){

                    if(response.errors) {
                        console.log(response.errors);
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    Materialize.toast('¡Usuario "' + $scope.firstName + ' ' + $scope.lastName + '" actualizado exitosamente!', 4000, 'green');
                    if( '/edit-profile' === currentPath ){
                        $state.go('/my-account', {}, { reload: true });
                        return;
                    }
                    $state.go('/view-users', {}, { reload: true });
            });
        }// updateUser

        $scope.changePassword = function(){
            UserService.changePassword( $scope.password, $scope.passwordConfirmation, function ( response ){

                    if(response.errors) {
                        console.log(response.errors);
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    Materialize.toast('¡Se ha cambiado tu contraseña!', 4000, 'green');
                    $state.go('/my-account', {}, { reload: true });
            });
        }// changePassword

        $scope.getUserRole = function( role ){

            switch( role ){
                case 1:
                    return 'Administrador';
                case 2:
                    return 'Project Manager';
                case 3:
                    return 'Ejecutivo de cuenta';
                case 4:
                    return 'Jefe de almacén';
                case 5:
                    return 'Repartidor';
                case 6:
                    return 'Cliente';
            }

        }// getUserRole

        

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function getAllUsers(){

            UserService.getAll( function( users ){
                $scope.users = users;
            }); 

        }// getAllUsers

        function getUser( id ){

            UserService.get( id, function( user ){
                console.log( user );
                $scope.user = user;
                $scope.email = user.email;
                $scope.firstName = user.first_name;
                $scope.lastName = user.last_name;
                $scope.role = $scope.getUserRole( user.role );
                $scope.id = id;
            }); 

        }// getUser

        function initUsersDataTable(){

            $scope.dtUsersOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(10)
                    .withDOM('pit')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtUsersColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initUsersDataTable

    }]);