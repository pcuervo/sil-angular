conAngular
    .controller('DeliveryController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'InventoryItemService', 'NotificationService', 'UserService', 'ProjectService', 'DeliveryService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTColumnBuilder', 'DTDefaultOptions', function($scope, $rootScope, $state, $stateParams, $location, InventoryItemService, NotificationService, UserService, ProjectService, DeliveryService, DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, DTDefaultOptions){
        
        (function initController() {
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
            DeliveryService.create( $rootScope.globals.currentUser.id, this.deliveryGuy, this.company, $scope.address, $('#lat').val(), $('#lng').val(), 1, $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, $scope.selectedItems, function( delivery ){

                $scope.isSummary = true;
                if( delivery.errors ){
                    Materialize.toast( 'No se pudo crear el envío, revisa la información e intenta nuevamente.', 4000, 'red');
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
            DeliveryService.create( $rootScope.globals.currentUser.id, this.deliveryGuy, this.company, $scope.address, $('#lat').val(), $('#lng').val(), 1, this.recipientName, this.recipientPhone, this.additionalComments, $scope.selectedItems, function( delivery ){

                $scope.isSummary = true;
                if( delivery.errors ){
                    Materialize.toast( 'No se pudo crear el envío, revisa la información e intenta nuevamente.', 4000, 'red');
                    return;
                }
                Materialize.toast( 'Se ha creado el envío.', 4000, 'green');

            });
        }

        $scope.printSummary = function(){
            window.print();
        }

        $scope.deliver = function( status ){
            var deliveryImgName = 'envio-' + $scope.delivery.id + '.' + $scope.deliveryImgExt;
            DeliveryService.update( $scope.delivery.id, $scope.company, $scope.address, $scope.delivery.latitude, $scope.delivery.longitude, status, $scope.recipientName, $scope.recipientPhone, $scope.additionalComments, $scope.deliveryImg, deliveryImgName, function( delivery ){
                console.log( delivery );
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
            }
            return status;
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initDeliveries( currentPath ){

            if( currentPath.indexOf( '/view-delivery' ) > -1 ){
                getDelivery( $stateParams.deliveryId );
                initDeliverySummaryDataTable();
            }

            if( currentPath.indexOf( '/new-delivery' ) > -1 ){
                getItem( $stateParams.itemId );
                fetchDeliveryUsers();
                $scope.isSummary = false;

                $scope.$on('$includeContentLoaded', function ( e, template ) {
                    if( 'delivery/templates/unit-item-delivery.html' == template || 'delivery/templates/bulk-item-delivery.html' == template || 'delivery/templates/bundle-item-delivery.html' == template ){
                        initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                    }
                });
                return;
            }

            switch( currentPath ){
                case '/multiple-items-delivery':
                    LoaderHelper.showLoader( 'Obteniendo inventario...' )
                    fetchItemsInStock();
                    initDeliveryDataTable();
                    fetchDeliveryUsers();
                    initGeoAutocomplete( '#address', '#map', 19.397260, -99.186684, 12 );
                    $scope.isSummary = false;
                    break;
                case '/single-item-delivery':
                    fetchItemsInStock();
                    fetchProjectManagers();
                    fetchAccountExecutives();
                    fetchClientContacts();
                    fetchProjects();
                    initDeliveryDataTable();
                    fetchDeliveryUsers();
                    break;
                case '/delivery-dashboard':
                    fetchLatestDeliveries();
                    fetchStats();
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
                }
            });
        }// getItem

        function getDelivery( id ){
            DeliveryService.get( id, function( delivery ){
                console.log( delivery );
                $scope.delivery = delivery;
                $scope.company = delivery.company;
                $scope.address = delivery.address;
                $scope.addressee = delivery.addressee;
                $scope.addresseePhone = delivery.addressee_phone;
                $scope.additionalComments = delivery.additional_comments;
                $scope.deliveryItems = delivery.delivery_items;
                $scope.statusText = $scope.getStatus( delivery.status );
                initGeoAutocomplete( '#address', '#map', delivery.latitude, delivery.longitude, 15 );
                $("#deliveryImg").change(function(){
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
            // TODO: Bulk and Bundle
            items = [];
            item = {};

            item['item_id'] = $scope.item.id;
            item['actable_type'] = $scope.item.actable_type;
            item['quantity'] = $scope.item.quantity;
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
            DeliveryService.all( function( deliveries ){
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
                $scope.deliveryImg = fr.result;
                $scope.deliveryImgExt = file.name.split('.').pop().toLowerCase();
            }

        }// getDeliveryImg

    }]);