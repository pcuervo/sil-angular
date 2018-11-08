conAngular
    .controller('DeliveryController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'InventoryItemService', 'NotificationService', 'UserService', 'ProjectService', 'DeliveryService', 'SupplierService', 'ClientService', 'InventoryTransactionService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTColumnBuilder', 'DTDefaultOptions', function($scope, $rootScope, $state, $stateParams, $location, InventoryItemService, NotificationService, UserService, ProjectService, DeliveryService, SupplierService, ClientService, InventoryTransactionService, DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, DTDefaultOptions){

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

            // var nextFolio = '-';
            // console.log($scope.nextFolio);
            // if( 'undefined' !== $scope.nextFolio ){
            //     nextFolio = $scope.nextFolio;
            // }

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

            DeliveryService.createRequest( $rootScope.globals.currentUser.id, $scope.company, $scope.address, $('#lat').val(), $('#lng').val(),  $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, deliveryDate, $scope.selectedItems, function( delivery_request ){

                if( delivery_request.errors ){
                    console.log(delivery_request.errors);
                    Materialize.toast( 'No se pudo crear la solicitud de envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }

                Materialize.toast( 'Se ha enviado la solicitud de envío.', 4000, 'green');
                $state.go('/delivery-dashboard', {}, { reload: true });
            });
        }

        $scope.printSummary = function(){
            $('textarea').each(function () {
                $(this).addClass('print-hidden');
                var text = $(this).val();
                $(this).after('<p class="[ well print-content print-only ]">' + text + '</p>');
            });
            window.print();
        }

        $scope.deliver = function( status ){

            if( 2 == status ){
                $('#delivery-img').prop('required', true);
            }

            var isValid = $('[data-parsley-delivery]').parsley().isValid();
            if( ! isValid ) return;
            var deliveryImgName = 'envio-' + $scope.delivery.id + '.' + $scope.deliveryImgExt;
            LoaderHelper.showLoader( 'Enviando...' );
            DeliveryService.update( $scope.delivery.id, $scope.company, $scope.address, $scope.delivery.latitude, $scope.delivery.longitude, status, $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, $scope.deliveryGuy, $scope.deliveryImg, deliveryImgName, function( delivery ){
                LoaderHelper.hideLoader();
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

        $scope.send = function( status ){
            DeliveryService.send( $scope.delivery.id, function( delivery ){
                toastMsg = 'Se ha marcado el envío como "enviado". Se le mandará una notificación al usuario que lo solicitó.';
                Materialize.toast( toastMsg, 4000, 'green' );
                $state.go('/delivery-dashboard', {}, { reload: true });
            });
        }

        $scope.getStatus = function( statusId ){
            var status;
            switch( parseInt( statusId ) ){
                case 0:
                    status = 'Pendiente por enviar';
                    break;
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

        $scope.authorizeRequest = function( id ){
            if( 'undefined' == typeof $scope.deliveryGuy ){
                Materialize.toast( 'El repartidor no puede estar vacío, si no hay nadie asignado selecciona "no hay" por favor.', 5000, 'red' );
                return;
            }
            DeliveryService.approveRequest( $scope.delivery.id, $scope.deliveryGuy, $scope.deliveryCompany, $scope.delivery.additional_comments, function( request ){
                console.log( request );
                if( request.errors ){
                    Materialize.toast( 'No se pudo aprobar la solicitud de envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }
                Materialize.toast( '¡Se ha aprobado la solicitud de envío! Se le notificará a la persona que lo solicitó.', 4000, 'green');
                $state.go('/delivery-dashboard', {}, { reload: true });
            });
        }

        $scope.removeItemToDeliver = function( itemId ){
            var itemToRemove = $('[data-id="' + itemId + '"]')
            var itemName = itemToRemove.data('name');
            $('#check-'+itemId).attr('checked', false);
            itemToRemove.remove();
            Materialize.toast( 'Se quitó el artículo "' + itemName + '" de la lista de artículos a retirar.', 4000, 'red');
        }

        $scope.loadMoreItems = function(){ fetchInStock($scope.currentPage); }

        $scope.searchByKeyword = function(){
            if( 'undefined' === typeof $scope.keyword && 'undefined' === typeof $scope.serialNumber  ){
                Materialize.toast( 'Ingresa una palabra clave o número de serie.', 4000, 'red');
                return;
            }
            LoaderHelper.showLoader('Buscando...');
            DeliveryService.searchByKeyword( $scope.keyword, $scope.serialNumber, function( deliveries ){
                console.log(deliveries);
                if(! deliveries.length){
                    Materialize.toast( 'No se encontró ningún envío.', 4000, 'red');
                }
                $scope.deliveries = deliveries;
                LoaderHelper.hideLoader();
            })
        }// searchItem

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initDeliveries( currentPath ){

            if( currentPath.indexOf( '/view-delivery-request' ) > -1 ){
                getDeliveryRequest( $stateParams.requestId );
                fetchDeliveryUsers();
                fetchSuppliers();
                initDeliverySummaryDataTable();
                return;
            }

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
                    if( ! $rootScope.globals.initMultipleDelivery ){
                        initItemsWithdrawal();
                    }
                    fetchLastFolio();
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
                    if( 6 == $scope.role || 2 == $scope.role || 3 == $scope.role ){
                        fetchPendingDeliveryRequestsByUser( $rootScope.globals.currentUser.id );
                    }else{
                        fetchPendingDeliveryRequests();
                    }
                    if( 5 == $scope.role ){
                        fetchByDeliveryMan( $rootScope.globals.currentUser.id );
                    }else{
                        fetchDeliveries();
                        fetchStats();
                    }
                    break;
                case '/pending-deliveries':
                    if( 6 == $scope.role || 2 == $scope.role || 3 == $scope.role ){
                        fetchPendingDeliveryRequestsByUser( $rootScope.globals.currentUser.id );
                    }else{
                        fetchPendingDeliveryRequests();
                    }
                    initPendingDeliveryDataTable();
                    break;
                case '/delivery-request':
                    LoaderHelper.showLoader( 'Obteniendo inventario...' );
                    if( 6 == $scope.role ){
                        fetchClientItemsInStock();
                    }else{
                        fetchItemsInStock();
                    }
                    if( ! $rootScope.globals.initMultipleDelivery ){
                        console.log('init');
                        initItemsWithdrawal();
                    }
                    initDeliveryDataTable();
                    initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                    $scope.deliveryDate = new Date();
                    break;
                case '/search-deliveries':
                    initDeliveryDataTable();
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

        function fetchInStock(page){
            LoaderHelper.showLoader('Obteniendo artículos en existencia...');
            InventoryItemService.getInStockPaged( page, function( itemsRes ){
                LoaderHelper.hideLoader();
                $scope.showLoadeMoreBtn = true;
                if( $scope.currentPage == itemsRes.total_pages ){
                    $scope.showLoadeMoreBtn = false;
                }
                if( typeof $scope.inventoryItems !== 'undefined' ){
                    $scope.inventoryItems = $scope.inventoryItems.concat(itemsRes.inventory_items);
                } else {
                    $scope.inventoryItems = itemsRes.inventory_items;
                }

                $scope.currentPage++;
            });
        }

        function fetchClientItemsInStock(){
            LoaderHelper.showLoader('Obteniendo artículos en existencia...');
            ClientService.getInventoryItems( $rootScope.globals.currentUser.id, true, function( inventory_items ){
                LoaderHelper.hideLoader();
                $scope.inventoryItems = inventory_items;
            });
        }

        function initDeliveryDataTable(){
            $scope.dtDeliveryOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('riftp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('select', true)
                .withOption('searching', true);
            $scope.dtDeliveryColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initDeliveryDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                console.log( numUnreadNotifications );
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

        function getDeliveryRequest( id ){
            DeliveryService.getRequest( id, function( delivery ){
                $scope.delivery = delivery;
                $scope.company = delivery.company;
                $scope.address = delivery.address;
                $scope.addressee = delivery.addressee;
                $scope.dateTime = delivery.date_time;
                $scope.addresseePhone = delivery.addressee_phone;
                $scope.additionalComments = delivery.additional_comments;
                $scope.deliveryItems = delivery.delivery_request_items;
                console.log( delivery );
                initGeoAutocomplete( '#address', '#map', delivery.latitude, delivery.longitude, 15 );
            });
        }// getDeliveryRequest

        function fetchDeliveryUsers(){
            UserService.getDeliveryUsers( function( users ){
                $scope.deliveryUsers = users;
            });
        }// fetchDeliveryUsers

        function getSelectedDeliveryItems(){
            // var id, type, quantity, item, items = [];
            // $('input[type="checkbox"]:checked').each( function(i, itemCheckbox){
            //     item = {};
            //     id = $(itemCheckbox).val();

            //     if( 0 == parseInt( $('#quantity-'+id).val() ) ) return 0;

            //     item['item_id'] = id;
            //     item['actable_type'] = $('#actable-type-'+id).val();
            //     item['quantity'] = $('#quantity-'+id).val();
            //     item['name'] = $('#item-name-'+id).html();
            //     item['item_type'] = $('#item-type-'+id).html();
            //     items.push( item );
            // });
            // return items;
            var items = []
            $('.js-added-items div').each(function(i, addedItem){
                item = {};
                item['id'] = $(addedItem).data('id');
                item['item_id'] = $(addedItem).data('id');
                item['name'] = $(addedItem).data('name');
                item['serial_number'] = $(addedItem).data('serial-number');
                item['quantity'] = $(addedItem).data('quantity');
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
                },
                componentRestrictions: { country: 'mx' }
            });
            var map = $(addressId).geocomplete("map");
            map.setCenter( latLng );
            map.setZoom( zoom );
        }

        function fetchDeliveries(){
            DeliveryService.all( $scope.role, 'pending', function( deliveries ){
                $scope.pendingDeliveries = deliveries;
            });
            DeliveryService.all( $scope.role, 'completed', function( deliveries ){
                $scope.completedDeliveries = deliveries;
            });
        }// fetchDeliveries

        function fetchByDeliveryMan(){
            DeliveryService.byDeliveryMan( 'pending', function( deliveries ){
                console.log( deliveries )
                $scope.pendingDeliveries = deliveries;
            });
            DeliveryService.byDeliveryMan( 'completed', function( deliveries ){
                $scope.completedDeliveries = deliveries;
            });
        }// fetchByDeliveryMan

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

        function fetchPendingDeliveryRequests(){
            DeliveryService.pendingRequests( function( deliveries ){
                console.log( deliveries );
                $scope.pendingDeliveryRequests = deliveries;
            });
        }// fetchPendingDeliveryRequests

        function fetchPendingDeliveryRequestsByUser( userId ){
            DeliveryService.pendingRequestsByUser( userId, function( deliveries ){
                $scope.pendingDeliveryRequests = deliveries;
            });
        }// fetchPendingDeliveryRequestsByUser

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
        }// initPendingDeliveryDataTable

        function fetchSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            });
        }// fetchSuppliers

        function initItemsWithdrawal(){
            $rootScope.globals.initMultipleDelivery = true;
            $(document).on('click', '.delivery-items input[type="checkbox"]', function(e){
                e.stopPropagation();
                var target = $( e.target );
                if ( ! target.is( "input" ) ) return;

                var itemId = target.val();
                if( ! target.is(':checked') ){
                    $scope.removeItemToDeliver( itemId );
                } else {
                    addItemToDeliver( itemId );
                }
            });

            $('.js-added-items').click('a', function(e){
                e.preventDefault();
                var target = $( e.target );
                if ( ! target.is( "a" ) ) return;

                itemId = e.target.id.replace('remove-', '');
                $scope.removeItemToDeliver( itemId );
            });
        }

        function addItemToDeliver( itemId ){
            console.log( 'adding item: ' + itemId );
            var itemName = $( '#name-'+itemId ).text();
            var itemSerialNumber = $( '#serial-number-'+itemId ).text();
            var itemQuantity = $( '#quantity-'+itemId ).val();
            var itemHtml = '<div data-id="' + itemId + '" data-serial-number="' + itemSerialNumber + '" data-quantity="' + itemQuantity + '" data-name="' + itemName + '"><p class="[ col s12 m3 ]">' + itemName + '</p><p class="[ col s12 m5 ]">' + itemSerialNumber +'</p><p class="[ col s12 m2 ]">' + itemQuantity +'</p><p class="[ col s12 m2 ]"><a id="remove-' + itemId + '" href="#" ng-click="removeItemToDeliver( ' + itemId + ' )" class="[ btn red ]"><i class="[ fa fa-times ]"></i></a></p><hr></div>';
            $('.js-added-items').append( itemHtml );
            Materialize.toast( 'Se agregó el artículo "' + itemName + '" a lista de artículos a retirar.', 4000, 'green');
        }

        function fetchLastFolio( id ){
            InventoryTransactionService.lastCheckoutFolio( function( lastFolio ){
                $scope.nextFolio = getNextFolio( lastFolio );
                console.log($scope.nextFolio);
            });
        }

        function getNextFolio(lastFolio){
            var numDigits = 7;
            var splitted = lastFolio.split('-');
            var lastFolioNum = parseInt( splitted[1] )+1;

            while (lastFolioNum.toString().length < numDigits)  lastFolioNum = "0" + lastFolioNum;

            return 'FS-' + lastFolioNum;
        }

        $scope.searchItems = function(){
            if( $scope.searchIsInvalid() ){
                Materialize.toast( 'Por favor selecciona al menos una opción de búsqueda.', 4000, 'red');
                return;
            }
            LoaderHelper.showLoader('Buscando...');
            InventoryItemService.search( '', '', '', '', 1, '', '', $scope.keyword, $scope.serialNumber, function( inventoryItems ){
                if( ! inventoryItems.length ){
                    Materialize.toast( 'No se encontró ningún artículo.', 4000, 'red');
                }
                $scope.inventoryItems = inventoryItems;
                LoaderHelper.hideLoader();
            })
        }// searchItems

        $scope.searchIsInvalid = function(){
            if( 'undefined' !== typeof $scope.keyword ) return false;
            if( 'undefined' !== typeof $scope.serialNumber ) return false;

            return true;
        }

}]);
