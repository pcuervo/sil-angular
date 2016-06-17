conAngular
    .controller('SupplierController', ['$scope', '$state', '$stateParams', '$location', 'SupplierService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($scope, $state, $stateParams, $location, SupplierService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            var currentPath = $location.path();
            initSupplier( currentPath );
            fetchNewNotifications();
        })();

        

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.registerSupplier = function(){
            SupplierService.register( $scope.supplierName, function ( response ){
                if(response.errors) {
                    ErrorHelper.display( response.errors );
                    return;
                }
                Materialize.toast('Proveedor "' + $scope.supplierName + '" registrado exitosamente!', 4000, 'green');
                $state.go('/view-suppliers', {}, { reload: true });
            });
        }// registerSupplier

        $scope.editSupplier = function(){
            SupplierService.edit( $scope.supplierId, $scope.supplierName, function ( response ){
                if( response.errors ) {
                    ErrorHelper.display( response.errors );
                    return;
                }
                Materialize.toast('¡Proveedor actualizado exitosamente!', 4000, 'green');
                $state.go('/view-suppliers', {}, { reload: true });
            });
        }



        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initSupplier( currentPath ){

            switch( currentPath ){
                case '/view-suppliers':
                    getAllSuppliers();
                    initSupplierDataTable();
                    break;
            }

            if( currentPath.indexOf( '/edit-supplier/' ) > -1 ){
                getSupplier( $stateParams.supplierId );
            }

        }// initSupplier

        function getAllSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            }); 
        }// getAllSuppliers

        function initSupplierDataTable(){
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
        }// initSupplierDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function getSupplier( id ){
            SupplierService.byId( id, function( supplier ){
               $scope.supplierName = supplier.name;
               $scope.supplierId = supplier.id;
            });
        }// getSupplier



    }]);