conAngular
    .controller('InventoryController', ['$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', 'ClientService', 'InventoryItemService', 'ProjectService', 'UserService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($rootScope, $scope, $state, $stateParams, $location, $filter, ClientService, InventoryItemService, ProjectService, UserService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            var currentPath = $location.path();
            initInventory( currentPath );
        })();

        
        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.getStatus = function( statusId ){
            switch( statusId ){
                case 1: return 'En existencia';
                case 2: return 'Sin existencias';
                case 3: return 'Existencia parcial';
                case 4: return 'Caducado';
                case 5: return 'Entrada pendiente';
                default: return 'Salida pendiente';
            }
        }// getStatus

        $scope.searchItem = function(){

            if( 6 === $scope.role ){ 
                $scope.selectedClient = $rootScope.globals.currentUser.id;
            }
            if( 2 === $scope.role ){ 
                $scope.selectedPM = $rootScope.globals.currentUser.id;
            }
            if( 3 === $scope.role ){ 
                $scope.selectedAE = $rootScope.globals.currentUser.id;
            }
            InventoryItemService.search( $scope.selectedProject, $scope.selectedClient, $scope.selectedPM, $scope.selectedAE, $scope.selectedStatus, $scope.itemType, $scope.storageType, $scope.keyword, function( inventoryItems ){
                $scope.inventoryItems = inventoryItems;
                console.log( inventoryItems );
            })
        }// searchItem

        $scope.getItemTypeIcon = function( type ){
            switch( type ){
                case 'UnitItem': return "[ fa fa-square ]";
                case 'BulkItem': return "[ fa fa-align-justify ]";
                case 'BundleItem': return "[ fa fa-th-large ]";
            }
        }// getItemTypeIcon

        $scope.getNameClass = function( type ){
            switch( type ){
                case 'UnitItem':
                case 'BundleItem': return "m6";
                case 'BulkItem': return "m4";
            }
        }

        $scope.getStateClass = function( type ){
            switch( type ){
                case 'UnitItem': return "m4";
                case 'BundleItem': return "m6";
                case 'BulkItem': return "m4";
            }
        }


        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initInventory( currentPath ){
            $scope.role = $rootScope.globals.currentUser.role;
            if( currentPath.indexOf( '/view-item' ) > -1 ){
                getItem( $stateParams.itemId );
                return;
            }

            switch( currentPath ){
                case '/my-inventory':
                    if( 1 === $scope.role ) {
                        fetchProjectManagers();
                        fetchAccountExecutives();
                        fetchClientContacts();
                    }
                    if( 6 === $scope.role ) {
                        $scope.selectedClient = $rootScope.globals.currentUser.id;
                    }
                    fetchInventory();
                    fetchProjects();
                    fetchStatuses();
                    initInventoryDataTable();
                    break;
            }
        }// initInventory

        function fetchInventory(){
            if( 1 === $scope.role ){
                InventoryItemService.getAll( function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
                return;
            }
            if( 2 === $scope.role ){ 
                $scope.selectedPM = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', '', $scope.selectedPM, '', '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
            }
            if( 3 === $scope.role ){ 
                $scope.selectedAE = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', '', '', $scope.selectedAE, '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
                return;
            }
            if( 6 === $scope.role ){ 
                $scope.selectedClient = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', $scope.selectedClient, '', '', '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                    console.log( inventoryItems );
                });
            }
        }// fetchInventory

        function initInventoryDataTable(){
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('pitp')
                .withOption('responsive', true)
                .withOption('order', []);
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');


        }// initInventoryDataTable

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con id: "' + id + '"', 4000, 'red');
                    return;
                }
                initItem( item );
                $scope.item = item;
                if( 'BundleItem' == item.actable_type ){
                    $scope.itemParts = item.parts;
                    $scope.hasPartsToWithdraw = false;
                }
                if( 'BulkItem' == item.actable_type ){
                    $scope.quantity = item.quantity;
                    console.log( $scope.quantity );
                }
            });
        }// getItem

        function initItem( item ){
            $scope.project = item.project;
            $scope.pm = item.pm;
            $scope.ae = item.ae;
            $scope.clientName = item.client;
            $scope.clientContact = item.client_contact;
            $scope.description = item.description;
            $scope.itemName = item.name;
            $scope.itemState = item.state;
            $scope.itemType = item.item_type;
            $scope.itemValue = $filter( 'currency' )( item.value );
            $scope.entryDate = new Date( $filter('date')(item.created_at, 'dd/MM/yyyy') );
            $scope.validityExpirationDate = new Date( $filter('date')(item.validity_expiration_date, 'dd/MM/yyyy') );;
            $('.js-barcode').JsBarcode( item.barcode );
        }// initItem

        function fetchProjects(){
            ProjectService.getAll( function( projects ){
                $scope.projects = projects;
            });
        }// fetchProjects

        function fetchStatuses(){
            InventoryItemService.getStatuses( function( statuses ){
                $scope.statuses = statuses;
            });
        }// fetchStatuses

        function fetchProjectManagers(){
            UserService.getProjectManagers( function( projectManagers ){
                $scope.projectManagers = projectManagers;
            });
        }// fetchProjectManagers

        function fetchAccountExecutives(){
            UserService.getAccountExecutives( function( accountExecutives ){
                $scope.accountExecutives = accountExecutives;
            });
        }// fetchAccountExecutives

        function fetchClientContacts(){
            UserService.getClientContacts( function( clientContacts ){
                $scope.clientContacts = clientContacts;
            });
        }// fetchClientContacts

    }]);