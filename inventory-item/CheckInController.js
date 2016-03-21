conAngular
	.controller('CheckInController', ['$scope', '$rootScope', '$state', '$stateParams', 'ProjectService', 'InventoryItemService', 'UnitItemService', 'BulkItemService', 'BundleItemService', 'WarehouseService', 'SupplierService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', '$interval', '$location', '$filter', function( $scope, $rootScope, $state, $stateParams, ProjectService, InventoryItemService, UnitItemService, BulkItemService, BundleItemService, WarehouseService, SupplierService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, $interval, $location, $filter ){

		/******************
        * CONSTANTS
        *******************/
		var CAPTURE_STEP = 1;
        var CONFIRMATION_STEP = 2;
        var LOCATION_STEP = 3;
		var PROGRAM_EXIT_STEP = 4;
		
		(function initController() {
            $scope.role = $rootScope.globals.currentUser.role;
            var currentPath = $location.path();
            initCheckIn( currentPath ); 
		})();

		
        /******************
        * PUBLIC FUNCTIONS
        *******************/

		$scope.captureItemData = function(){
            $scope.setActiveStep( CONFIRMATION_STEP );
            getItemImg();
            $scope.barCodeVal = FormatHelper.slug( $scope.itemName );
            $('.js-barcode').JsBarcode( $scope.barCodeVal );
		}      

		$scope.setActiveStep = function( step ){
            window.scrollTo(0, 0);
			$scope.currentStep = step;
		}// setActiveStep

		$scope.registerItem = function( type ){
            LoaderHelper.showLoader( 'Registrando entrada...' );
            switch( type ){
                case 'unit':
                    registerUnitItem();
                    break;
                case 'bulk':
                    registerBulkItem();
                    break;
                case 'bundle':
                    registerBundleItem();
                    break;
            }

		}// registerItem

        $scope.fillProjectData = function(){

            fillProjectUsersSelects();
            fillProjectClient();
                   
        }// fillProjectData

        $scope.getEntryType = function( type ){
            switch( type ){
                case 'UnitItem': return 'Unitaria';
                case 'BulkItem': return 'Granel';
                case 'BundleItem': return 'Paquete'
            }
        }// getEntryType

        $scope.addPart = function(){
            $scope.parts.push({
                name:           $scope.partName,
                serial_number:  $scope.partSerialNumber,
                brand:          $scope.partBrand,
                model:          $scope.partModel,
            });

            $scope.partName = null;
            $scope.partSerialNumber = null;
            $scope.partBrand = null;
            $scope.partModel = null;
        }// addPart

        $scope.removePart = function( index ){
            $scope.parts.splice( index, 1 );
        }// removePart

        $scope.updateExpirationDate = function( storageType ){

            switch( storageType ){
                case 'Permanente':
                    var currentDate = new Date();
                    currentDate.setMonth(currentDate.getMonth() + 6);
                    $scope.validityExpirationDate = currentDate;
                    $('.js-expiration-date-label').text('Fecha vigencia (mm/dd/aaaa)');
                    break;
                case 'Perecedero':
                    $('.js-expiration-date-label').text('Fecha de caducidad (mm/dd/aaaa)');
                    $scope.validityExpirationDate = '';
                    $scope.storageType = 'Temporal'
                    break;
                case 'Temporal':
                case 'Donación':
                    $('.js-expiration-date-label').text('Fecha vigencia (mm/dd/aaaa)');
                    $scope.validityExpirationDate = '';
            }
            
        }// updateExpirationDate

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

        $scope.restrictUnits = function( locationId, index ){
            $.each( $scope.multipleLocations[index], function( i, location ){
                if( location.id != locationId ) return true;

                $scope.hasMultipleLocations = true;
                $scope.currentLocations[index] = location;
            });
        }// updateLocations

        $scope.addToLocation = function( type ){
 
            LoaderHelper.showLoader( 'Ubicando en almacén...' );
            if( $scope.sameLocationType && ! $scope.multipleLocationsType ){
                switch( $scope.actable_type ){
                    case 'UnitItem': 
                        var quantity = 1;
                        break;
                    case 'BulkItem': 
                        var quantity = $scope.quantity;
                        break;
                    default:
                        var quantity = $scope.parts.length;
                }
                console.log( quantity );
                WarehouseService.locateItem( $scope.registeredItemId, $scope.selectedLocation, $scope.units, quantity, false, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                    $state.go('/check-in', {}, { reload: true });
                });
                return;
            }

            if( 'BundleItem' == type )
            {
                var partsLocation = [];
                $.each($scope.currentLocations, function(i, location){
                    partsLocation[i] = {
                        partId:      $('#parts-' + i).val(),
                        locationId: location.id,
                        units:      $('#units-' + i).val()
                    }
                }); 
                WarehouseService.locateBundle( $scope.registeredItemId, partsLocation, $scope.parts.length, false, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                    $state.go('/check-in', {}, { reload: true });
                });
                return;
            }
            WarehouseService.locateBulk( $scope.registeredItemId, $scope.bulkLocations, false, function( response ) {
                Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                $state.go('/check-in', {}, { reload: true });
            });
            
        }// addToLocation

        $scope.searchByBarcode = function(){

            InventoryItemService.byBarcode( $scope.barcode, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con código de barras: "' + $scope.barcode + '"', 4000, 'red');
                    return;
                }
                $scope.item = item;
                $scope.hasItem = true;
                $scope.exitDate = new Date();

                if( 'BundleItem' == item.actable_type ){
                    $scope.hasPartsToReturn = true;
                    $scope.parts = getBundleMissingParts( item.parts );
                }
            });

        }// searchByBarcode

        $scope.reEntry = function( type ){
            switch( type ){
                case 'UnitItem': 
                    reentryUnitItem( $scope.item.actable_id, $scope.entryDate, $scope.deliveryCompanyUnit, $scope.deliveryCompanyContact, $scope.itemState, $scope.additionalComments );
                    break;
                case 'BulkItem': 
                    reentryBulkItem( $scope.item.actable_id, $scope.entryDate, $scope.deliveryCompany, $scope.deliveryCompanyContact, $scope.itemState, $scope.additionalComments, $scope.quantity );
                    break;
                case 'BundleItem': 
                    reentryBundleItem( $scope.item.actable_id, $scope.exitDate, $scope.deliveryCompany, $scope.deliveryCompanyContact, $scope.itemState, $scope.additionalComments  );
                    break;
            }
        }// reentry

        $scope.showLocationForm = function( type ){
            
            if( 'same' === type ){
                $scope.sameLocationType = true;
                $scope.multipleLocationsType = false;
                return;
            }
            $scope.sameLocationType = false;
            $scope.multipleLocationsType = true;

            $scope.partsToLocate = $scope.parts;
            $scope.pendingUnitsToLocate = $scope.quantity;
            $scope.bulkLocations = [];
        }

        $scope.authorizeEntry = function( itemId ){
            InventoryItemService.authorizeEntry( itemId, function( response ){
                Materialize.toast(response.success, 4000, 'green');
                getPendingEntries(); 
            }); 
        }

        $scope.addUnitsToLocation = function(){
            var bulkLocation = {
                locationId:     $scope.selectedLocation,
                quantity:       $scope.unitsToLocate,
                units:          $scope.units,
                rack:           $scope.selectedRack
            }

            $scope.bulkLocations.push( bulkLocation );
            $scope.pendingUnitsToLocate -= $scope.unitsToLocate;
            $scope.hasMultipleLocations = true;
            $scope.selectedLocation = '';
            $scope.selectedRack = '';
            $scope.unitsToLocate = '';
            $scope.units = '';
        }


		/******************
        * PRIVATE FUNCTIONS
        *******************/

        function initCheckIn( currentPath ){

            switch( currentPath ){
                case '/pending-entries':
                    getPendingEntries();
                    initPendingEntriesDataTable();
                    break;
                case '/check-in':
                    getLatestEntries();
                    initLatestEntriesDataTable();
                    break;
                case '/add-bundle-item':
                    $scope.parts = [];
                    $scope.sameLocationType = false;
                    $scope.multipleLocationsType = false;
                    $scope.hasSameLocation = false;
                    $scope.hasMultipleLocations = false;
                    $scope.multipleLocations = [];
                    $scope.currentLocations = [];
                case '/add-unit-item':
                case '/add-bulk-item':
                    $scope.registeredItemId = 0;
                    $scope.showMoreActions = false;
                    $scope.currentStep = CAPTURE_STEP;
                    $scope.entryDate = new Date();
                    fetchProjects();
                    fetchWarehouseRacks();
                    $scope.validSelectedProject = false;
                    $scope.hasLocation = false;
                    fetchSuppliers();
                    break;
                case '/re-entry':
                    fetchSuppliers();
                    $scope.hasPartsToReturn = false;
                    $scope.entryDate = new Date();
                    break;
            }

            if( currentPath.indexOf( '/edit-item' ) > -1 ){
                getItem( $stateParams.itemId );
            }

        }// initCheckIn

		function fetchProjects(){

            switch( $scope.role  ){
                case 2:
                    ProjectService.byUser( $rootScope.globals.currentUser.id, function( projects ){
                        $scope.projects = projects;
                        $scope.projectManagerName = $rootScope.globals.currentUser.name;
                        $scope.projectManagerId = $rootScope.globals.currentUser.id;
                    });
                    break;
                case 3:
                    ProjectService.byUser( $rootScope.globals.currentUser.id, function( projects ){
                        $scope.projects = projects;
                        $scope.accountExecutiveName = $rootScope.globals.currentUser.name;
                        $scope.accountExecutiveId = $rootScope.globals.currentUser.id;
                    });
                    break;
                default:
                    ProjectService.getAll( function( projects ){
                        $scope.projects = projects;
                    });
            }

		}// fetchProjects

        function fetchWarehouseRacks(){

            WarehouseService.getRacks( function( racks ){
                $scope.racks = racks;
            });

        }// fetchWarehouseRacks

        function fillProjectUsersSelects(){

            ProjectService.getProjectUsers( $scope.selectedProject, function ( response ){

                if( response.users.length == 0 ) {
                    $scope.validSelectedProject = false; 
                    return;
                }

                $scope.projectManagers = [];
                $scope.accountExecutives = [];
                angular.forEach(response.users, function( user ) {

                    switch( user.role ){
                        case 2:
                            if( 2 == $scope.role ) break;
                            $scope.projectManagers.push( user );
                            break;
                        case 3:
                            if( 3 == $scope.role ) break;
                            $scope.accountExecutives.push( user );
                    }
                })
                $scope.validSelectedProject = true;  
            });

        }// fillProjectUsersSelects

        function fillProjectClient(){

            ProjectService.getProjectClient( $scope.selectedProject, function ( response ){

                $scope.clientName = response.client.name;
                $scope.clientContact = response.client.contact_name;

            } );

        }// fillProjectClient

        function getItemImg(){

            var fileInput = document.getElementById('itemImg');
            file = fileInput.files[0];
            fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function(){
                $scope.itemImg = fr.result;
                $scope.itemImgExt = file.name.split('.').pop().toLowerCase();
            }

        }// getItemImg

        function registerUnitItem(){

            var itemImgName = $scope.itemName + '.' + $scope.itemImgExt;
            UnitItemService.create( $scope.serialNumber, $scope.brand, $scope.model, $scope.itemName, $scope.itemState, $scope.description, $scope.selectedProject, $scope.itemType, $scope.itemImg, itemImgName, $scope.entryDate, $scope.storageType, $scope.deliveryCompany, $scope.deliveryCompanyContact, $scope.additionalComments, $scope.barCodeVal, $scope.validityExpirationDate, $scope.itemValue, function ( response ){

                LoaderHelper.hideLoader();
                if( response.errors ) {
                    ErrorHelper.display( response.errors );
                    $scope.currentStep = 1;
                    return;
                }

                $scope.registeredItemId = response.unit_item.id;
                $scope.showMoreActions = true;
                Materialize.toast('Entrada unitaria: "' + $scope.itemName + '" registrada exitosamente!', 4000, 'green');
            });

        }// registerUnitItem

        function registerBulkItem(){

            var itemImgName = $scope.itemName + '.' + $scope.itemImgExt;
            BulkItemService.create( $scope.itemName, $scope.quantity, $scope.description, $scope.selectedProject, $scope.itemType, $scope.itemImg, itemImgName, $scope.entryDate, $scope.storageType, $scope.deliveryCompany, $scope.deliveryCompanyContact, $scope.additionalComments, $scope.barCodeVal, $scope.validityExpirationDate, $scope.itemValue, function ( response ){

                LoaderHelper.hideLoader();
                if( response.errors ) {
                    ErrorHelper.display( response.errors );
                    $scope.currentStep = 1;
                    return;
                }

                $scope.registeredItemId = response.bulk_item.id;
                $scope.showMoreActions = true;
                Materialize.toast('Entrada a granel: "' + $scope.itemName + '" registrada exitosamente!', 4000, 'green');
            });

        }// registerBulkItem

        function registerBundleItem(){

            var itemImgName = $scope.itemName + '.' + $scope.itemImgExt;
            BundleItemService.create( $scope.itemName, $scope.description, $scope.selectedProject, $scope.itemType, $scope.itemImg, itemImgName, $scope.entryDate, $scope.storageType, $scope.deliveryCompany, $scope.deliveryCompanyContact, $scope.additionalComments, $scope.barCodeVal, $scope.parts, $scope.validityExpirationDate, $scope.itemValue,  function ( response ){

                    LoaderHelper.hideLoader();
                    if( response.errors ) {
                        ErrorHelper.display( response.errors );
                        $scope.currentStep = 1;
                        return;
                    }

                    $scope.registeredItemId = response.bundle_item.id;
                    $scope.showMoreActions = true;
                    Materialize.toast('Entrada paquete: "' + $scope.itemName + '" registrada exitosamente!', 4000, 'green');
                    //$state.go('/check-in', {}, { reload: true });
            });

        }// registerBundleItem

        function getLatestEntries(){

            InventoryItemService.getLatestEntries( function( latestInventoryItems ){
                $scope.latestInventoryItems = latestInventoryItems;
            }); 

        }// getLatestEntries

        function initLatestEntriesDataTable(){

            $scope.dtLatestEntriesOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtLatestEntriesColumnDefs = [
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initLatestEntriesDataTable

        function getPendingEntries(){
            InventoryItemService.getPendingEntries( function( pendingInventoryItems ){
                $scope.pendingInventoryItems = pendingInventoryItems;
            }); 
        }// getPendingEntries

        function initPendingEntriesDataTable(){
            $scope.dtPendingEntriesOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtPendingEntriesColumnDefs = [
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingEntriesDataTable

        function reentryUnitItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments  ){
            InventoryItemService.reentryUnitItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }
                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-in', {}, { reload: true });
            });
        }// withdrawUnitItem

        function reentryBulkItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, quantity  ){
            InventoryItemService.reentryBulkItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, quantity, function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }
                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-in', {}, { reload: true });
            });
        }// withdrawUnitItem

        function reentryBundleItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments  ){
            var parts = getBundlePartsToAdd();
            var quantity = parts.length;
            console.log( deliveryCompany );
            console.log( deliveryCompanyContact );
            console.log( additionalComments );

            InventoryItemService.reentryBundleItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, parts, quantity, function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }
                Materialize.toast( response.success, 4000, 'green');
                //$state.go('/check-in', {}, { reload: true });
            });
        }// withdrawUnitItem

        function getBundlePartsToAdd(){
            var parts = [];
            $('input[type="checkbox"]:checked').each( function(i, partCheckbox){
                parts.push( $(partCheckbox).val() );
            });
            return parts;
        }// getBundlePartsToAdd

        function fetchSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            }); 
        }// fetchSuppliers

        function getBundleMissingParts( parts ){
            var validParts = [];
            $.each( parts, function( i, part ){
                console.log( part );
                if( 2 == part.status){
                    validParts.push( part );
                    return true;
                }
            });
            return validParts;
        }

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
                    $scope.itemParts = [];
                    $scope.hasPartsToWithdraw = false;
                    $.each( item.parts, function(i, part){
                        if( part.status == 2 ) return true;

                        $scope.itemParts.push( part );
                        $scope.hasPartsToWithdraw = true;
                    });
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
            $scope.itemValue = item.value;
            $scope.entryDate = new Date( $filter('date')(item.created_at, 'dd/MM/yyyy') );
            $scope.validityExpirationDate = new Date( $filter('date')(item.validity_expiration_date, 'dd/MM/yyyy') );;
            $('.js-barcode').JsBarcode( item.barcode );
            console.log( item );
        }// initItem



// 		// Dashboard 
// 		// sparkline 1
//   $scope.spark1data = [76,78,87,65,43,35,23,25,12,14,27,35,32,37,31,46,43,32,36,57,78,87,82,75,58,54,70,23,54,67,34,23,87,12,43,65,23,76,32,55];
//   $scope.spark1opts = {
//     type: 'bar',
//     width: '100%',
//     height: 20,
//     barColor: '#2196f3'
//   };

//   // rickshaw datas
//   var rickshawLine1 = [{"x":0,"y":13},{"x":1,"y":12},{"x":2,"y":24},{"x":3,"y":25},{"x":4,"y":12},{"x":5,"y":16},{"x":6,"y":24},{"x":7,"y":13},{"x":8,"y":12},{"x":9,"y":11}];
//   var rickshawLine2 = [{"x":0,"y":16},{"x":1,"y":23},{"x":2,"y":17},{"x":3,"y":16},{"x":4,"y":22},{"x":5,"y":25},{"x":6,"y":21},{"x":7,"y":22},{"x":8,"y":12},{"x":9,"y":13}];


//   // rickshaw 1
//   $scope.rickshaw1options = {
//     renderer: 'area',
//     stroke: false,
//     height: 179
//   };
//   $scope.rickshaw1features = {
//     hover: {
//       xFormatter: function(x) {
//         return x;
//       },
//       yFormatter: function(y) {
//         return y;
//       }
//     }
//   };
//   $scope.rickshaw1series = [ {
//       data: rickshawLine1,
//       color: '#42a5f5',
//       name: 'Visits'
//     }, {    
//       data: rickshawLine2,
//       color: '#90caf9',
//       name: 'Views'
//     } ];


//   // rickshaw 2
//   $scope.rickshaw2options = {
//     renderer: 'bar',
//     height: 179
//   };
//   $scope.rickshaw2features = {
//     hover: {
//       xFormatter: function(x) {
//         return x;
//       },
//       yFormatter: function(y) {
//         return y;
//       }
//     }
//   };
//   $scope.rickshaw2series = [ {
//       data: rickshawLine1,
//       color: '#26a69a',
//       name: 'Visits'
//     }, {    
//       data: rickshawLine2,
//       color: '#80cbc4',
//       name: 'Views'
//     } ];


//   // rickshaw 3
//   $scope.rickshawSeries = [[], []];

//   // Create random data
//   $scope.randomData = new Rickshaw.Fixtures.RandomData(50);
//   for (var i = 0; i < 40; i++) {
//     $scope.randomData.addData($scope.rickshawSeries);
//   }

//   $scope.rickshaw3options = {
//     interpolation: 'cardinal',
//     renderer: 'area',
//     height: 254
//   };
//   $scope.rickshaw3features = {
//     hover: {}
//   };
//   $scope.rickshaw3series = [ {
//       data: $scope.rickshawSeries[0],
//       color: '#4db6ac',
//       name: 'HDD'
//     }, {
//       data: $scope.rickshawSeries[1],
//       color: '#b2dfdb',
//       name: 'CPU'
//     } ];

//   // Live Update
//   $interval(function () {
//     $scope.randomData.removeData($scope.rickshawSeries);
//     $scope.randomData.addData($scope.rickshawSeries);
    
//     $scope.$broadcast('rickshaw::resize');
//   }, 1000);



//   // flot 1
//   $scope.flot1data = [{
//       data: [[1, 50], [2, 58], [3, 45], [4, 62],[5, 55],[6, 65],[7, 61],[8, 70],[9, 65],[10, 50],[11, 53],[12, 49]],
//       label: "Entradas"
//     }, {
//       data: [[1, 25], [2, 31], [3, 23], [4, 48],[5, 38],[6, 40],[7, 47],[8, 55],[9, 43],[10,30],[11,37],[12, 29]],
//       label: "Salidas"
//     }];
//   $scope.flot1opts = {
//     series: {
//       lines: {
//         show: true,
//         lineWidth: 1,
//         fill: true, 
//         fillColor: { colors: [ { opacity: 0.1 }, { opacity: 0.13 } ] }
//       },
//       points: {
//         show: true, 
//         lineWidth: 2,
//         radius: 3
//       },
//       shadowSize: 0,
//       stack: true
//     },
//     grid: {
//       hoverable: true, 
//       clickable: true, 
//       tickColor: "#f9f9f9",
//       borderWidth: 0
//     },
//     legend: {
//       // show: false
//       backgroundOpacity: 0,
//       labelBoxBorderColor: "#fff"
//     },  
//     colors: ["#3f51b5", "#009688", "#2196f3"],
//     xaxis: {
//       ticks: [[1, "Jan"], [2, "Feb"], [3, "Mar"], [4,"Apr"], [5,"May"], [6,"Jun"], 
//                  [7,"Jul"], [8,"Aug"], [9,"Sep"], [10,"Oct"], [11,"Nov"], [12,"Dec"]],
//       font: {
//         family: "Roboto,sans-serif",
//         color: "#ccc"
//       }
//     },
//     yaxis: {
//       ticks:7, 
//       tickDecimals: 0,
//       font: {color: "#ccc"}
//     },

//     conTooltip: function(chart) {
//       function showTooltip(x, y, contents) {
//         $('<div id="tooltip">' + contents + '</div>').css( {
//           position: 'absolute',
//           display: 'none',
//           top: y - 40,
//           left: x - 55,
//           color: "#fff",
//           padding: '5px 10px',
//           'border-radius': '3px',
//           'background-color': 'rgba(0,0,0,0.6)'
//         }).appendTo("body").fadeIn(200);
//       }

//       var previousPoint = null;
//       chart.bind("plothover.conApp", function (event, pos, item) {
//         if (item) {
//           if (previousPoint != item.dataIndex) {
//             previousPoint = item.dataIndex;

//             $("#tooltip").remove();
//             var x = item.datapoint[0].toFixed(0),
//                 y = item.datapoint[1].toFixed(0);

//             var month = item.series.xaxis.ticks[item.dataIndex].label;

//             showTooltip(item.pageX, item.pageY,
//                         item.series.label + " of " + month + ": " + y);
//           }
//         }
//         else {
//           $("#tooltip").remove();
//           previousPoint = null;
//         }
//       });
//     }
//   };


//   // flot 2
//   $scope.flot2data = [
//     { label: "Unitario",  data: 45, color: "#90a4ae"},
//     { label: "Paquete",  data: 67, color: "#7986cb"},
//     { label: "Granel",  data: 23, color: "#9575cd"}
//   ];
//   $scope.flot2opts = {
//     series: {
//       pie: {
//         innerRadius: 0.5,
//         show: true
//       }
//     },
//     grid: {
//       hoverable: true
//     },
//     legend: {
//       backgroundOpacity: 0,
//       labelBoxBorderColor: "#fff"
//     },
//     tooltip: true,
//     tooltipOpts: {
//       content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
//       shifts: {
//         x: 20,
//         y: 0
//       },
//       defaultTheme: false
//     }
//   };



//   // jvectormap 1
//   $scope.jvmap1opts = {
//     map: 'world_mill_en',
//     zoom: 2,
//     series: {
//       regions: [{
//         values: gdpData,
//         scale: ['#e3f2fd', '#2196f3'],
//         normalizeFunction: 'polynomial'
//       }]
//     },
//     backgroundColor: '#fff',
//     onRegionTipShow: function(e, el, code){
//       el.html(el.html()+' (GDP - '+gdpData[code]+')');
//     }
//   };

}]);