conAngular
    .controller('UserController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'UserService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, UserService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){
        
        var currentPath = $location.path();

        (function initController() {
            fetchNewNotifications();
            if( '/edit-profile' === currentPath || '/my-account' === currentPath ){
                getUser( $rootScope.globals.currentUser.id );
                $("#userImg").change(function(){
                    getUserImg();
                });
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

            var userImgName = $scope.firstName.toLowerCase() + '-' + $scope.lastName.toLowerCase() + '.' + $scope.userImgExt;
            UserService.update( $scope.id, $scope.email, $scope.firstName, $scope.lastName, $scope.userImg, userImgName, function ( response ){

                    if(response.errors) {
                        console.log(response.errors);
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    console.log( response.user )
                    if( '/images/thumb/missing.png' != response.user.avatar_thumb ){
                        $('#user-avatar').attr('src', response.user.avatar_thumb );
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
                if( '/images/thumb/missing.png' != user.avatar_thumb ){
                    $scope.avatarUrl = user.avatar_thumb;
                    return;
                }
                $scope.avatarUrl = 'assets/_con/images/new-user.jpg';
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

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function getUserImg(){
            var imgId = 'userImg';
            var fileInput = document.getElementById( imgId );
            file = fileInput.files[0];
            fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function(){
                $scope.userImg = fr.result;
                $scope.userImgExt = file.name.split('.').pop().toLowerCase();
            }

        }// getUserImg

    }]);