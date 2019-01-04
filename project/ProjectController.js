conAngular
    .controller('ProjectController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'ClientService', 'ProjectService', 'UserService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTColumnBuilder', 'DTDefaultOptions', function($scope, $rootScope, $state, $stateParams, $location, ClientService, ProjectService, UserService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, DTDefaultOptions){
        
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
          ProjectService.update( $scope.project.id, $scope.project.litobel_id, $scope.project.name, $scope.project.client_id, function ( response ){
            console.log( response );
            if(response.errors) {
              ErrorHelper.display( response.errors );
              return;
            }
            Materialize.toast('¡Proyecto "' + $scope.project.name + '" actualizado exitosamente!', 4000, 'green');
            $state.go('/view-project', { projectId: $scope.project.id }, { reload: true });
          });
        }// update

        $scope.destroyProject = function(projectId){
            var deleteProject = confirm('¿Seguro que deseas eliminar el proyecto? Todo el inventario asignado a este proyecto será eliminado también.');

            if( ! deleteProject ) return; 

            ProjectService.destroy( projectId, function ( response ){
                Materialize.toast('¡Proyecto borrado exitosamente!' , 4000, 'green');
                $state.go('/view-projects', {}, { reload: true });
            });
        }// addUsersToProject

        $scope.transferInventory = function(fromProjectId){
          var toProjectId = $scope.destinationProject;

          $scope.dtInstance.dataTable.fnFilter('');

          if( 'undefined' === typeof toProjectId ){
            Materialize.toast('Por favor selecciona el proyecto destino.' , 4000, 'red');
            return;
          }

          if( $scope.partialTransfer ){
            var itemsIds = getItemsIds();
            
            if( 0 == itemsIds.length ){
                Materialize.toast('Escoge al menos un artículo a transferir.' , 4000, 'red');
                return;
            }

            ProjectService.transferPartialInventory(fromProjectId, toProjectId, itemsIds, function(response){
              Materialize.toast(response.success , 4000, 'green');
              $state.go('/view-projects', {}, { reload: true });
              return;
            });
            return;
          }

          ProjectService.transferInventory(fromProjectId, toProjectId, function(response){
            Materialize.toast(response.success , 4000, 'green');
            $state.go('/view-projects', {}, { reload: true });
          });
        }

        $scope.resetInventory = function( projectId ){
            var confirmation = confirm( '¿Estás seguro que deseas reiniciar el inventario? Se perderá el historial de los productos y las existencias quedarán en 0' );
            if( confirmation ){
                LoaderHelper.showLoader('Reiniciando el inventario...');
                ProjectService.resetInventory( projectId, function( response ){
                   Materialize.toast( response.success, 4000, 'green');
                   $state.go('/view-project', {projectId: projectId}, { reload: true });
                   LoaderHelper.hideLoader();
                });   
            }   
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initProjects( currentPath ){
          $scope.role = $rootScope.globals.currentUser.role;

          if( currentPath.indexOf( '/edit-project' ) > -1 ){
            $scope.showDeleteBtn = false;
            getAllClients();
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
            $scope.dtInstance = {};
            $scope.partialTransfer = false;
            getProject( $stateParams.projectId );
            getProjectInventory( $stateParams.projectId );
            getAllProjects();
            initProjectInventoryDataTable();
            
            return;
          }
          if( currentPath.indexOf( '/view-project/' ) > -1 ){
            getProject( $stateParams.projectId );
            initProjectUsersDataTable();
            try{
                initProjectLeanInventoryDataTable();
            }
            catch(err){
                location.reload();
            }
            
            return;
          }

          switch( currentPath ){
            case '/view-projects':
              LoaderHelper.showLoader('Cargando proyectos...');

              if( $scope.role == 1 || $scope.role == 4 ){
                getAllProjects();
              } else {
                getUserProjects($rootScope.globals.currentUser.id);
              }
              
              
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
          ProjectService.all( function( projects ){
            $scope.projects = projects;
            LoaderHelper.hideLoader();
          });
        }// getAllProjects

        function getUserProjects(userId){
					ProjectService.byUser( userId, function( projects ){
						$scope.projects = projects;
						LoaderHelper.hideLoader();
					}); 
        }// getUserProjects

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
                    .withDOM('riftp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', true);
            $scope.dtProjectColumn = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initProjectDataTable

        function initProjectUsersDataTable(){
            $scope.dtProjectUsersOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('rift')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtProjectUsersColumn = [
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initProjectUsersDataTable
        
        function initProjectLeanInventoryDataTable(){
            $scope.dtProjectInventoryOptions = DTOptionsBuilder.newOptions()
              .withPaginationType('full_numbers')
              .withDisplayLength(100)
              .withDOM('riftp')
              .withButtons([
                {
                  extend: "csvHtml5",
                  fileName: "inventario_proyecto.csv",
                  exportOptions: {
                      columns: [0, 2, 3, 4, 5, 6]
                  },
                  exportData: {decodeEntities:true}
                }
              ])
              .withOption('responsive', true)
              .withOption('searching', false);
            $scope.dtProjectInventoryColumn = [
                DTColumnDefBuilder.newColumnDef(1).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initProjectLeanInventoryDataTable

        function getProject( id ){
          ProjectService.get( id, function( project ){
            if( project.errors ){
              Materialize.toast( 'No se encontró ningún proyecto con id: "' + id + '"', 4000, 'red');
              $state.go('/view-projects', {}, { reload: true });
              return;
            }
            //getAllClients();
            getClientContacts( project.client_id );

            $scope.project = project;
            $scope.clientId = project.client_id;
            $scope.projectUsers = project.users;
            console.log(project);

            if( ! project.has_inventory ) $scope.showDeleteBtn = true;
            if( $('[name="projectClient"]').length ) $('[name="projectClient"]').val( project.client_id );
          });
        }// getProject

        function getProjectInventory( id ){
            ProjectService.getInventory( id, function( items ){
                console.log(items);
              if( items.errors ){
                Materialize.toast( 'No se encontró el proyecto.', 4000, 'red');
                //$state.go('/view-projects', {}, { reload: true });
                return;
              }
              $scope.items = items;
            });
          }// getProjectInventory

          function initProjectInventoryDataTable(){
            $scope.dtProjectInventoryOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(200)
                    .withDOM('rift')
                    .withOption('responsive', true)
                    .withOption('searching', true);
            $scope.dtProjectInventoryColumn = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initProjectInventoryDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function getItemsIds(){
          var ids = [];
          $('.transferItem :checked').each(function(i, item){
            ids.push(item.value);
          });
          return ids;
        }

        function getClientContacts(clientId){
            ClientService.getContacts( clientId, function ( clientContacts ){
                console.log(clientContacts)
                $scope.clientContacts = clientContacts;
            });
        }
    }]);