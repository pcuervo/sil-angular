conAngular
    .controller('ProjectController', ['$scope', '$state', '$stateParams', '$location', 'ClientService', 'ProjectService', 'UserService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTColumnBuilder', 'DTDefaultOptions', function($scope, $state, $stateParams, $location, ClientService, ProjectService, UserService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, DTDefaultOptions){
        
        (function initController() {
            var currentPath = $location.path();
            initProjects( currentPath );
            fetchNewNotifications();
        })();

        
        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.register = function(){

            ProjectService.register( $scope.litobelId, $scope.projectName, $scope.clientId, $scope.clientContactId, $scope.projectManagerId, $scope.accountExecutiveId, function ( response ){

                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                
                    Materialize.toast('¡Proyecto "' + $scope.projectName + '" registrado exitosamente!', 4000, 'green');
                    $state.go('/view-projects', {}, { reload: true });

            });

        }// register

        $scope.getClientName = function( clientId ){

            var client = 'Google';

            for( var i in $scope.clients ){
                if( clientId === $scope.clients[i].id ) return $scope.clients[i].name
            }

        }// getClientName

        $scope.fillClientContact = function(){

            ClientService.getContacts( $scope.clientId, function ( clientContacts ){
                $scope.clientContacts = clientContacts;
            });

        }// fillClientContact

        $scope.addUsersToProject = function(){
            ProjectService.addUsers( $scope.project.id, $scope.projectManagerId, $scope.accountExecutiveId, $scope.clientContactId, function ( response ){

                if(response.errors) {
                    ErrorHelper.display( response.errors );
                    return;
                }
                
                Materialize.toast( response.success , 4000, 'green');
                $state.go('/add-user-to-project', { projectId: $scope.project.id }, { reload: true });
            });
        }// addUsersToProject

        $scope.getUserRole = function( roleId ){
            var role;
            switch( roleId ){
                case 2:
                    role = 'Project Manager';
                    break;
                case 3:
                    role = 'Ejecutivo de cuenta';
                    break;
                default:
                    role = 'Cliente';
            }

            return role;
        }// getUserRole

        $scope.removeUserFromProject = function( projectId, userId ){
            ProjectService.removeUser( projectId, userId, function( response ){
                Materialize.toast( response.success , 4000, 'green');
                $state.go('/add-user-to-project', { projectId: $scope.project.id }, { reload: true });
            });
        }// removeUserFromProject

        $scope.update = function(){
            ProjectService.update( $scope.project.id, $scope.project.litobel_id, $scope.project.name, function ( response ){
                    console.log( response );
                    if(response.errors) {
                        ErrorHelper.display( response.errors );
                        return;
                    }
                    Materialize.toast('¡Proyecto "' + $scope.project.name + '" actualizado exitosamente!', 4000, 'green');
                    $state.go('/view-projects', {}, { reload: true });
            });
        }// update

        $scope.destroyProject = function(projectId){
            var deleteProject = confirm('¿Seguro que deseas eliminar el proyecto? Todo el inventario asignado a este proyecto será eliminado también.');

            if( ! deleteProject ) return; 

            ProjectService.destroy( projectId, function ( response ){
                console.log(response);
                Materialize.toast('¡Proyecto borrado exitosamente!' , 4000, 'green');
                $state.go('/view-projects', {}, { reload: true });
            });
        }// addUsersToProject

        $scope.transferInventory = function(fromProjectId){
          var toProjectId = $scope.destinationProject;

          if( 'undefined' === typeof toProjectId ){
            Materialize.toast('Por favor selecciona el proyecto destino.' , 4000, 'red');
            return;
          }
          
          ProjectService.transferInventory(fromProjectId, toProjectId, function(response){
            console.log(response);
            Materialize.toast(response.success , 4000, 'green');
            //$state.go('/view-projects', {}, { reload: true });
          });
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initProjects( currentPath ){
          if( currentPath.indexOf( '/edit-project' ) > -1 ){
            $scope.showDeleteBtn = false;
            getProject( $stateParams.projectId );
            getProjectManagersAndAccountExecutives();
            initProjectUsersDataTable()
            return;
          }
          if( currentPath.indexOf( '/add-user-to-project' ) > -1 ){
            getProject( $stateParams.projectId );
            getProjectManagersAndAccountExecutives();
            initProjectUsersDataTable()
            return;
          }
          if( currentPath.indexOf( '/transfer-inventory' ) > -1 ){
            getProject( $stateParams.projectId );
            getAllProjects();
            return;
          }
          switch( currentPath ){
            case '/view-projects':
              getAllProjects();
              initProjectDataTable();
              break;
            case '/add-project':
              getAllClients();
              getProjectManagersAndAccountExecutives();
              break;
          }
        }// initProjects

        function getAllClients(){
            ClientService.getAll( function( clients ){
                $scope.clients = clients;
            }); 
        }// getAllClients

        function getAllProjects(){

            ProjectService.getAll( function( projects ){
                console.log( projects );
                $scope.projects = projects;
            }); 
        }// getAllProjects

        function getProjectManagersAndAccountExecutives(){
            UserService.getProjectManagers( function( pms ){
                $scope.projectManagers = pms;
            }); 
            UserService.getAccountExecutives( function( aes ){
                $scope.accountExecutives = aes;
            });
            UserService.getClientContacts( function( cc ){
                $scope.clientContacts = cc;
            }); 
        }// getProjectManagersAndAccountExecutives

        function initProjectDataTable(){

            $scope.dtProjectOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtProjectColumn = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initProjectDataTable

        function initProjectUsersDataTable(){
            $scope.dtProjectUsersOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtProjectUsersColumn = [
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initProjectUsersDataTable

        function getProject( id ){
          ProjectService.get( id, function( project ){
            if( project.errors ){
              Materialize.toast( 'No se encontró ningún proyecto con id: "' + id + '"', 4000, 'red');
              $state.go('/view-projects', {}, { reload: true });
              return;
            }
            getAllClients();
            $scope.project = project;
            $scope.clientId = project.client_id;
            $scope.projectUsers = project.users;

            console.log(project);

            if( ! project.has_inventory ) $scope.showDeleteBtn = true;
          });
        }// getProject

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

    }]);