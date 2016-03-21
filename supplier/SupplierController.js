conAngular
    .controller('SupplierController', ['$scope', '$state', 'SupplierService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($scope, $state, SupplierService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            getAllSuppliers();
            initSupplierDataTable();
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



        /******************
        * PRIVATE FUNCTIONS
        *******************/

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

    }]);