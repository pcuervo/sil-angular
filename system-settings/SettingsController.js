conAngular
    .controller('SettingsController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'SettingsService', 'NotificationService', 'ClientService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, SettingsService, NotificationService, ClientService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){
        


        (function initController() {
            var currentPath = $location.path();
            initSettingsOptions( currentPath ); 
            fetchNewNotifications();
        })();



        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.getStatusClass = function( status ){

            switch( status ){
                case STATUS_EMPTY:
                    $scope.statusDescription = 'Vacío';
                    return '[ green white-text lighten-1 ]';
                    break;
                case STATUS_OCCUPIED:
                    $scope.statusDescription = 'Parcial';
                    return '[ yellow lighten-1 ]';
                    break;
                case STATUS_FULL:
                    $scope.statusDescription = 'Ocupado';
                    return '[ red white-text lighten-1 ]';
            }

        }// getStatusClass

        $scope.getItemTypeIcon = function( type ){
            switch( type ){
                case 'UnitItem': return "[ fa fa-square ]";
                case 'BulkItem': return "[ fa fa-align-justify ]";
                case 'BundleItem': return "[ fa fa-th-large ]";
            }
        }// getItemTypeIcon

        $scope.updateLocations = function( rackId ){
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.locations = locations;
            } )
        }// updateLocations

        $scope.updateLocationSelect = function( rackId, index ){
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.multipleLocations[index] = locations;
            } )
        }// updateLocations

        $scope.showLocationDetails = function( locationId ){
            $.each( $scope.locations, function( i, location ){
                if( location.id != locationId ) return true;
                $scope.hasSameLocation = true;
                $scope.sameLocationType = true;
                $scope.currentLocation = location;
            });
        }// showLocationDetails

        $scope.addToLocation = function(){

            LoaderHelper.showLoader( 'Agregando artículo a ubicación...' );
            if( $scope.sameLocationType && ! $scope.multipleLocationsType ){
                switch( $scope.item.actable_type ){
                    case 'UnitItem': 
                        var quantity = 1;
                        break;
                    case 'BulkItem': 
                        var quantity = this.quantity;
                        break;
                    default:
                        var quantity = $scope.parts.length;
                }
                WarehouseService.locateItem( $scope.item.id, this.selectedLocation, this.units, quantity, true, $scope.item.actable_type, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                    $state.go('/wh-dashboard', {}, { reload: true });
                });
                return;
            }

            if( 'BundleItem' == $scope.item.actable_type )
            {
                var partsLocation = [];
                $.each($scope.currentLocations, function(i, location){
                    partsLocation[i] = {
                        partId:      $('#parts-' + i).val(),
                        locationId: location.id,
                        units:      $('#units-' + i).val()
                    }
                }); 
                WarehouseService.locateBundle( $scope.item.id, partsLocation, $scope.parts.length, true, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                    $state.go('/wh-dashboard', {}, { reload: true });
                });
                return;
            }
            WarehouseService.locateBulk( $scope.item.id, $scope.bulkLocations, true, function( response ) {
                Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                $state.go('/wh-dashboard', {}, { reload: true });
            });

        }// addToLocation

        $scope.showLocationForm = function( type ){
            if( 'same' === type ){
                $scope.sameLocationType = true;
                $scope.multipleLocationsType = false;
                return;
            }
            $scope.sameLocationType = false;
            $scope.multipleLocationsType = true;

            if( 'BundleItem' == $scope.item.actable_type ){
                $scope.partsToLocate = $scope.parts;
                return;
            }
            $scope.pendingUnitsToLocate = $scope.quantity;
            $scope.bulkLocations = [];
        }

        $scope.restrictUnits = function( locationId, index ){
            $.each( $scope.multipleLocations[index], function( i, location ){
                if( location.id != locationId ) return true;

                $scope.hasMultipleLocations = true;
                $scope.currentLocations[index] = location;
            });
        }// restrictUnits

        $scope.createRack = function(){
            WarehouseService.createRack( $scope.rackName, $scope.rows, $scope.columns, $scope.units, function( rack ){
                Materialize.toast('¡Se ha creado el rack: "' + rack.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-rack', { 'rackId' : rack.id }, { reload: true });
            });
        }// createRack

        $scope.editLocation = function(){
            WarehouseService.editLocation( $scope.locationId, $scope.locationName, $scope.units, function( location ){
                Materialize.toast('¡Se ha editado la ubicación: "' + $scope.locationName + '" exitosamente!', 4000, 'green');
                $state.go('/view-location', { 'locationId' : location.id  }, { reload: true });
            });
        }// editLocation

        $scope.getEntryType = function( type ){
            switch( type ){
                case 'UnitItem': return 'Unitaria';
                case 'BulkItem': return 'Granel';
                case 'BundleItem': return 'Paquete'
            }
        }// getEntryType

        $scope.addUnitsToLocation = function(){

            var bulkLocation = {
                locationId:     this.selectedLocation,
                quantity:       this.unitsToLocate,
                units:          this.units,
                rackLocation:   $('[name="rack"] option:selected').first().text() + ' / ' + $('[name="location"] option:selected').first().text()
            }
            console.log( bulkLocation );
            $scope.bulkLocations.push( bulkLocation );
            this.pendingUnitsToLocate -= this.unitsToLocate;
            $scope.hasMultipleLocations = true;
            this.selectedLocation = '';
            this.selectedRack = '';
            this.unitsToLocate = '';
            this.units = '';
        }

        $scope.changeRack = function( rackId ){
            getRackRelocation( rackId );
        }// changeRack
 
        $scope.deleteRack = function( rackId ){
            WarehouseService.deleteRack( rackId, function(){
                Materialize.toast('¡Se ha eliminado el rack!', 4000, 'red');
                $('#'+rackId).remove();
            });
        }// deleteRack

        $scope.updateRows = function( column ){
            if( 1 == column ){
                $scope.rows = 1;
                $scope.units = 100000;
                $scope.isFloor = true;
                return;
            }   

            $scope.rows = '';
            $scope.units = '';
            $scope.isFloor = false;
        }// updateRows

        $scope.getTransactionType = function( type ){
            switch( type ){
                case 'UnitItem':
                    return 'Unitaria'
                case 'BulkItem':
                    return 'Granel'
                case 'BundleItem':
                    return 'Paquete'
            }
        }// getTransactionType

        $scope.getTransactionTypeClass = function( concept ){
            switch( concept ){
                case 'Entrada':
                    return 'green lighten-3';
                case 'Salida':
                    return 'red lighten-3';
                default:
                    return 'yellow lighten-3';
            }
        }// getTransactionTypeClass

        $scope.updateSettings = function(){
            SettingsService.update( 1, $scope.unitsPerLocation, $scope.costPerLocation, $scope.costHighValue, function( settings ){
                Materialize.toast( 'Ajustes generales guardados con éxito.', 4000, 'green');
            }); 
        }// updateSettings

        $scope.updateDiscount = function( userId ){
            var discount = $( '#'+userId ).val();
            ClientService.updateUser( userId, discount, function( clientUser ){
                Materialize.toast( 'Se actualizó el descuento del usuario "' + clientUser.first_name + ' ' + clientUser.last_name + '"', 4000, 'green');
            }); 
        }// updateDiscount



        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initSettingsOptions( currentPath ){
            if( currentPath.indexOf('system-settings') > -1 ){
                getSettings( 1 );
                initClientsDataTable(); 
                return;
            }
        }// initWarehouseOptions

        function initClientsDataTable(){
            $scope.dtClientsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength( 25 )
                .withDOM('it')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingLocationDataTable
  
        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function getSettings( id ){
            SettingsService.get( id, function( settings ){
                $scope.unitsPerLocation = settings.units_per_location;
                $scope.costPerLocation = settings.cost_per_location;
                $scope.costHighValue = settings.cost_high_value;
            }); 
        }

}]);