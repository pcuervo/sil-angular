conAngular
    .controller('DeliveryController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'InventoryItemService', 'NotificationService', 'UserService', 'ProjectService', 'DeliveryService', 'SupplierService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTColumnBuilder', 'DTDefaultOptions', function($scope, $rootScope, $state, $stateParams, $location, InventoryItemService, NotificationService, UserService, ProjectService, DeliveryService, SupplierService,  DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, DTDefaultOptions){
        
        (function initController() {
            $scope.role = $rootScope.globals.currentUser.role;
            var currentPath = $location.path();
            initDeliveries( currentPath );
            fetchNewNotifications();
        })();

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.getItemTypeIcon = function( type ){
            switch( type ){
                case 'UnitItem': return "[ fa fa-square ]";
                case 'BulkItem': return "[ fa fa-align-justify ]";
                case 'BundleItem': return "[ fa fa-th-large ]";
            }
        }// getItemTypeIcon

        $scope.multipleItemsDelivery = function(){
            
            $scope.selectedDeliveryGuy = $('[name="deliveryGuy"] option:selected').text();
            $scope.selectedItems = getSelectedDeliveryItems();

            if( 0 == $scope.selectedItems ){
                Materialize.toast( 'No se pueden enviar 0 piezas, por favor selecciona una cantidad mayor a 0', 4000, 'red');
                return;
            }

            initDeliverySummaryDataTable();
            $scope.address = $('#address').val();
            var deliveryDate = getDateTime( $scope.deliveryDate, $scope.deliveryTime );
            if( 'undefined' == typeof $scope.deliveryGuy || '' == $scope.deliveryGuy ) $scope.deliveryGuy = -1;

            DeliveryService.create( $rootScope.globals.currentUser.id, this.deliveryGuy, this.company, $scope.address, $('#lat').val(), $('#lng').val(), 1, $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, deliveryDate, $scope.deliveryCompany, $scope.selectedItems, function( delivery ){

                $scope.delivery = delivery;

                $scope.isSummary = true;
                if( delivery.errors ){
                    Materialize.toast( 'No se pudo crear el envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }

                if( 5 == delivery.status ){
                    Materialize.toast( 'Tu solicitud de envío se le ha enviado al jefe de almacén.', 4000, 'green' );
                    $state.go('/delivery-dashboard', {}, { reload: true });
                    return;
                }

                Materialize.toast( 'Se ha creado el envío.', 4000, 'green');
            });
        }

        $scope.singleItemDelivery = function(){
            
            $scope.selectedDeliveryGuy = $('[name="deliveryGuy"] option:selected').text();
            $scope.selectedItems = getDeliveryItem();

            if( 0 == $scope.selectedItems ){
                Materialize.toast( 'No se pueden enviar 0 piezas, por favor selecciona una cantidad mayor a 0', 4000, 'red');
                return;
            }

            initDeliverySummaryDataTable();
            $scope.address = $('#address').val();
            $scope.address_summary = $scope.address;
            var deliveryDate = getDateTime( this.deliveryDate, this.deliveryTime );
            if( 'undefined' == typeof $scope.deliveryGuy || '' == $scope.deliveryGuy  ) $scope.deliveryGuy = -1;
            DeliveryService.create( $rootScope.globals.currentUser.id, this.deliveryGuy, this.company, $scope.address, $('#lat').val(), $('#lng').val(), 1, this.recipientName, this.recipientPhone, this.additionalComments, deliveryDate, this.deliveryCompany, $scope.selectedItems, function( delivery ){

                $scope.delivery = delivery;
                $scope.isSummary = true;
                if( delivery.errors ){
                    Materialize.toast( 'No se pudo crear el envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }
                Materialize.toast( 'Se ha creado el envío.', 4000, 'green');

            });
        }

        $scope.requestDelivery = function(){
            
            $scope.selectedItems = getSelectedDeliveryItems();

            if( 0 == $scope.selectedItems ){
                Materialize.toast( 'No se pueden enviar 0 piezas, por favor selecciona una cantidad mayor a 0', 4000, 'red');
                return;
            }

            $scope.address = $('#address').val();
            var deliveryDate = getDateTime( $scope.deliveryDate, $scope.deliveryTime );

            DeliveryService.createRequest( $rootScope.globals.currentUser.id, $scope.company, $scope.address, $('#lat').val(), $('#lng').val(),  $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, deliveryDate, $scope.selectedItems, function( delivery ){

                if( delivery.errors ){
                    console.log(delivery.errors);
                    Materialize.toast( 'No se pudo crear la solicitud de envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }

                Materialize.toast( 'Se ha enviado la solicitud de envío.', 4000, 'green');
                $state.go('/delivery-dashboard', {}, { reload: true });
            });
        }

        $scope.printSummary = function(){
            window.print();
        }

        $scope.deliver = function( status ){

            if( 2 == status ){  
                $('#delivery-img').prop('required', true);
            }

            var isValid = $('[data-parsley-delivery]').parsley(). isValid();
            if( ! isValid ) return;
            var deliveryImgName = 'envio-' + $scope.delivery.id + '.' + $scope.deliveryImgExt;
            DeliveryService.update( $scope.delivery.id, $scope.company, $scope.address, $scope.delivery.latitude, $scope.delivery.longitude, status, $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, $scope.deliveryGuy, $scope.deliveryImg, deliveryImgName, function( delivery ){

                switch( status ){
                    case 1: 
                        toastMsg = 'Se ha confirmado el envío y se le ha cambiado el estatus a "enviado". Se le mandará una notificación al usuario que lo solicitó.';
                        break;
                    case 2: 
                        toastMsg = 'Se ha entregado el envío en su totalidad.';
                        break;
                    case 3: 
                        toastMsg = 'Se ha cancelado el envío.';
                        break;
                }
                Materialize.toast( toastMsg, 4000, 'green' );
                $state.go('/delivery-dashboard', {}, { reload: true });
            });
        }

        $scope.getStatus = function( statusId ){
            var status;
            switch( parseInt( statusId ) ){
                case 1:
                    status = 'Enviado';
                    break;
                case 2:
                    status = 'Entregado';
                    break;
                case 3:
                    status = 'Rechazado';
                    break;
                case 4:
                    status = 'Entrega parcial';
                    break;
                default:
                    status = 'Pendiente por aprobar'
            }
            return status;
        }

        $scope.showDeliveryImage = function( imgUrl ){
            $('#deliveryImgProof img').remove();
            var imgHtml = '<img class="[ col s12 m8 offset-m2 ][ materialboxed ]" src="' + imgUrl + '" alt="Remisión de envío">';
            $('#deliveryImgProof').append( imgHtml );
            $('.materialboxed').materialbox();
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initDeliveries( currentPath ){

            if( currentPath.indexOf( '/view-delivery' ) > -1 ){
                getDelivery( $stateParams.deliveryId );
                fetchDeliveryUsers();
                initDeliverySummaryDataTable();
            }

            if( currentPath.indexOf( '/new-delivery' ) > -1 ){
                getItem( $stateParams.itemId );
                fetchDeliveryUsers();
                fetchSuppliers();
                $scope.isSummary = false;
                $scope.deliveryDate = new Date();

                $scope.$on('$includeContentLoaded', function ( e, template ) {
                    if( 'delivery/templates/unit-item-delivery.html' == template || 'delivery/templates/bulk-item-delivery.html' == template || 'delivery/templates/bundle-item-delivery.html' == template ){
                        initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                        $('.clockpicker').clockpicker();
                    }
                });
                return;
            }

            switch( currentPath ){
                case '/multiple-items-delivery':
                    LoaderHelper.showLoader( 'Obteniendo inventario...' );
                    fetchItemsInStock();
                    initDeliveryDataTable();
                    fetchDeliveryUsers();
                    fetchSuppliers();
                    initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                    $scope.isSummary = false;
                    $scope.deliveryDate = new Date();
                    break;
                case '/single-item-delivery':
                    fetchItemsInStock();
                    fetchProjectManagers();
                    fetchAccountExecutives();
                    fetchClientContacts();
                    fetchProjects();
                    initDeliveryDataTable();
                    fetchDeliveryUsers();
                    fetchSuppliers();
                    break;
                case '/delivery-dashboard':
                    fetchLatestDeliveries();
                    fetchStats();
                    break;
                case '/pending-deliveries':
                    fetchPendingDeliveries();
                    initPendingDeliveryDataTable();
                    break;
                case '/delivery-request':
                    LoaderHelper.showLoader( 'Obteniendo inventario...' );
                    fetchItemsInStock();
                    initDeliveryDataTable();
                    initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                    $scope.deliveryDate = new Date();
                    break;
            }
        }// initDeliveries

        function fetchStats(){
             DeliveryService.stats( function( stats ){
                $scope.shipped = stats.shipped;
                $scope.delivered = stats.delivered;
                $scope.rejected = stats.rejected;
            });
        }

        function fetchItemsInStock(){
             InventoryItemService.getInStock( function( items ){
                console.log(items);
                LoaderHelper.hideLoader();
                $scope.inventoryItems = items;
            });
        }

        function initDeliveryDataTable(){
            $scope.dtDeliveryOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('pitp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtDeliveryColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initDeliveryDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

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

        function fetchProjects(){
            ProjectService.getAll( function( projects ){
                $scope.projects = projects;
            });
        }// fetchProjects

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                console.log( item );
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con id: "' + id + '"', 4000, 'red');
                    return;
                }
                $scope.item = item;
                
                
                $scope.locations = '';
                $.each( item.locations, function(i, loc){
                    $scope.locations += loc.location + ', ';
                });
                $scope.locations = $scope.locations.replace(/,\s*$/, "");

                if( 'BundleItem' == item.actable_type ){
                    $scope.itemParts = [];
                    $scope.hasPartsToWithdraw = false;
                    $.each( item.parts, function(i, part){
                        if( part.status == 2 ) return true;

                        $scope.itemParts.push( part );
                        $scope.hasPartsToWithdraw = true;
                    });
                    return;
                }
                if( 'BulkItem' == item.actable_type ){
                    $scope.itemQuantity = item.quantity;
                }
            });
        }// getItem

        function getDelivery( id ){
            DeliveryService.get( id, function( delivery ){
                $scope.delivery = delivery;
                $scope.company = delivery.company;
                $scope.address = delivery.address;
                $scope.addressee = delivery.addressee;
                $scope.addresseePhone = delivery.addressee_phone;
                $scope.additionalComments = delivery.additional_comments;
                $scope.deliveryItems = delivery.delivery_items;
                $scope.statusText = $scope.getStatus( delivery.status );
                console.log( delivery );
                $scope.supplier = delivery.supplier;
                initGeoAutocomplete( '#address', '#map', delivery.latitude, delivery.longitude, 15 );
                 $(document).on('change', '#deliveryImg', function(){ 
                    getDeliveryImg();
                });
            });
        }// getDelivery

        function fetchDeliveryUsers(){
            UserService.getDeliveryUsers( function( users ){
                $scope.deliveryUsers = users;
            });
        }// fetchDeliveryUsers

        function getSelectedDeliveryItems(){
            var id, type, quantity, item, items = [];
            $('input[type="checkbox"]:checked').each( function(i, itemCheckbox){
                item = {};
                id = $(itemCheckbox).val();

                if( 0 == parseInt( $('#quantity-'+id).val() ) ) return 0;

                item['item_id'] = id;
                item['actable_type'] = $('#actable-type-'+id).val();
                item['quantity'] = $('#quantity-'+id).val();
                item['name'] = $('#item-name-'+id).html();
                item['item_type'] = $('#item-type-'+id).html();
                items.push( item );
            });
            return items;
        }

        function getDeliveryItem(){
            // TODO: Bundle
            items = [];
            item = {};

            item['item_id'] = $scope.item.id;
            item['actable_type'] = $scope.item.actable_type;
            if( 'BulkItem' == $scope.item.actable_type ){
                item['quantity'] = $('#item-quantity').val();
            } else {
                item['quantity'] = $scope.item.quantity;
            }
            item['name'] = $scope.item.name;
            item['item_type'] = $scope.item.item_type;
            items.push( item );
            return items;
        }

        function initDeliverySummaryDataTable(){
            $scope.dtDeliverySummaryOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtDeliverySummaryColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initDeliverySummaryDataTable

        function initGeoAutocomplete( addressId, mapId, latitude, longitude, zoom ){
            $('#map').css('height', '400px');
            var latLng = new google.maps.LatLng( latitude, longitude )
            $(addressId).geocomplete({
                details: ".input-field",
                detailsAttribute: "data-geo",
                map: mapId,
                markerOptions: {
                    position: latLng,
                    map: "mapId"
                }
            });
            var map = $(addressId).geocomplete("map");
            map.setCenter( latLng );
            map.setZoom( zoom );
        }

        function fetchLatestDeliveries(){
            DeliveryService.all( $scope.role, function( deliveries ){
                console.log(deliveries)
                $scope.latestDeliveries = deliveries;
            });
        }// fetchLatestDeliveries

        function getDeliveryImg(){
            var imgId = 'deliveryImg';
            var fileInput = document.getElementById( imgId );
            file = fileInput.files[0];
            fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function(){
                console.log( file.name );
                $scope.deliveryImg = fr.result;
                $scope.deliveryImgExt = file.name.split('.').pop().toLowerCase();
            }

        }// getDeliveryImg

        function getDateTime( date, time ){
            var year, month, day, hours, minutes;

            if( '' == time || typeof time == 'undefined' ){
                hours = 0;
                minutes = 0;
            } else {
                var timeAr = time.split(':');
                hours = timeAr[0];
                minutes = timeAr[1];
            }
            date.setHours(hours);
            date.setMinutes(minutes);
            return date;
        }

        function fetchPendingDeliveries(){
            DeliveryService.pendingApproval( function( deliveries ){
                console.log( deliveries )
                $scope.pendingDeliveries = deliveries;
            });
        }// fetchPendingDeliveries

        function initPendingDeliveryDataTable(){
            $scope.dtPendingDeliveryOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('itp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtPendingDeliveryColumnDefs = [
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initDeliveryDataTable

        function fetchSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            });
        }// fetchSuppliers

}]);
