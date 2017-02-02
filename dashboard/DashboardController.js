conAngular.controller('DashboardController', [ '$rootScope', '$scope', '$state', '$interval', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', 'InventoryTransactionService', 'InventoryItemService', 'ClientService', 'DeliveryService', 'NotificationService', function( $rootScope, $scope, $state, $interval, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, InventoryTransactionService, InventoryItemService, ClientService, DeliveryService, NotificationService) {

    (function initController() {
        $scope.role = $rootScope.globals.currentUser.role;
        $scope.dashboardTemplate = 'dashboard/dashboard-old.html';
        initDashboard( $scope.role ); 
        fetchNewNotifications();
    })();


    /******************
    * PUBLIC FUNCTIONS
    *******************/

    $scope.getTransactionTypeClass = function( type ){
        return InventoryTransactionService.getTypeClass( type );
    }// getTransactionTypeClass

    $scope.getItemTypeIcon = function( type ){
        switch( type ){
            case 'UnitItem': return "[ fa fa-square ]";
            case 'BulkItem': return "[ fa fa-align-justify ]";
            case 'BundleItem': return "[ fa fa-th-large ]";
        }
    }// getItemTypeIcon

    $scope.cancelWithdrawalRequest = function( id ){
        InventoryItemService.cancelWithdrawal( id, function( response ){
            console.log( response );
            Materialize.toast( "Has cancelado la solicitud exitosamente.", 4000, 'green');
            $state.go('/dashboard', {}, { reload: true });
        });
    }

    $scope.cancelWithdrawalRequest = function( id ){
        InventoryItemService.cancelWithdrawal( id, function( response ){
            Materialize.toast( "Has cancelado la solicitud exitosamente.", 4000, 'green');
            $state.go('/dashboard', {}, { reload: true });
        });
    }

    $scope.getWithdrawRequestItems = function( items ){
        var itemNames = [];
        console.log( items );
        $.each( items, function(i, val){
            val.name + '</a><br>';
            itemNames.push( i+1 + '. ' + val.name );
        });
        console.log( itemNames );
        return itemNames.join('; ');
    }

    $scope.cancelEntryRequest = function( id ){
        InventoryItemService.cancelEntryRequest( id, function( response ){
            console.log( response );
            Materialize.toast( "Has cancelado la solicitud exitosamente.", 4000, 'green');
            $state.go('/pending-entry-requests', {}, { reload: true });
        });
    }

    /******************
    * PRIVATE FUNCTIONS
    *******************/

    function initDashboard( role ){
        switch( role ){
            case 1:
                initDashboardAdmin();
                break;
            case 2:
            case 3:
                initDashboardProjectManager();
                break;
            case 4:
                initDashboardWarehouseAdmin();
                break;
            case 5:
                break;
            default:
                initDashboardClient();
        }
    }// initDashboard

    function initDashboardClient(){
        $scope.dashboardTemplate = 'dashboard/client-dashboard.html';

        ClientService.getClient( $rootScope.globals.currentUser.id, function( client){
            console.log( client );
        } )

        $scope.hasInventory = true;
        $scope.inventoryByItemData = [];
        $scope.inventoryByItemOpts = {};
        $scope.monthlySpaceData = [];
        $scope.monthlySpaceOpts = {};
        addMonthlySpaceTooltip();

        initChartInventoryByHighValue( 1, 1 );
        ClientService.stats( $rootScope.globals.currentUser.id, function( stats ){
            console.log( stats.inventory_by_type );
            $scope.stats = stats;

            if( Object.keys( stats.inventory_by_type ).length != 0 ){
                $scope.hasInventory = false;
                initChartInventoryByItemType( stats.inventory_by_type );
            }
            initChartMonthlyRent( stats.rent_by_month );
            initChartInventoryByHighValue( stats.total_number_items, stats.total_high_value_items );

            $scope.currentRent = 0;
            if( stats.rent_by_month.length > 0 ){
                $scope.currentRent =  stats.rent_by_month[  stats.rent_by_month.length-1 ].rent;
            }
        });

        // Load data for tables
        fetchClientWithdrawRequests( $rootScope.globals.currentUser.id );
        fetchPendingDeliveriesByUser( $rootScope.globals.currentUser.id );
        // Create DataTables
        showWithdrawRequestsDataTable();
    }// initDashboardClient

    function initDashboardAdmin(){
        $scope.dashboardTemplate = 'dashboard/admin-dashboard.html';

        // Initialize charts with empty data
        $scope.inventoryByItemData = [];
        $scope.inventoryByItemOpts = {};
        $scope.monthlySpaceData = [];
        $scope.monthlySpaceOpts = {};
        addMonthlySpaceTooltip();
        getPendingEntryRequests();
        initPendingEntryRequestsDataTable();
        getPendingWithdrawalRequests();
        initPendingWithdrawalRequestsDataTable();
        
        InventoryItemService.getStats( function( stats ){
            $scope.totalInventory = stats.total_number_items;
            $scope.inventoryValue = stats.inventory_value;
            $scope.currentRent = stats.current_rent;
            initChartInventoryByItemType( stats.inventory_by_type );
            initChartMonthlyOccupation( stats.occupation_by_month );
        }); 

    }// initDashboardAdmin

    function initDashboardWarehouseAdmin(){
        $scope.dashboardTemplate = 'dashboard/warehouse-admin-dashboard.html';

        // Initialize charts with empty data
        getItemsWithPendingLocation();
        initPendingLocationDataTable();
        getPendingEntryRequests();
        initPendingEntryRequestsDataTable();
        getPendingWithdrawalRequests();
        initPendingWithdrawalRequestsDataTable();

    }// initDashboardWarehouseAdmin

    function initDashboardProjectManager(){
        $scope.dashboardTemplate = 'dashboard/pm-dashboard.html';

        // Initialize charts with empty data
        $scope.inventoryByItemData = [];
        $scope.inventoryByItemOpts = {};
        getPendingEntryRequests();
        getPendingWithdrawalRequestsByUser( $rootScope.globals.currentUser.id );
        fetchPendingDeliveriesByUser( $rootScope.globals.currentUser.id );
        // Init datatables
        initPendingEntryRequestsDataTable();
        initPendingWithdrawalRequestsDataTable();
        
        InventoryItemService.getStatsPM( function( stats ){
            console.log( stats );
            $scope.totalInventory = stats.total_number_items;
            $scope.currentRent = stats.current_rent;
            $scope.numberProjects = stats.total_number_projects;
            initChartInventoryByItemType( stats.inventory_by_type );
        }); 


    }// initDashboardProjectManager

    function fetchStats(){
        InventoryItemService.getStats( function( stats ){
            console.log( stats );
            $scope.totalInventory = stats.total_number_items;
            $scope.inventoryValue = stats.inventory_value;
            $scope.currentRent = stats.current_rent;
        }); 
    }

    function initChartMonthlyOccupation( occupationData ){
        var monthlySpaceData = [];
        var ticks = [];

        $.each( occupationData, function(i, val){
            monthlySpaceData.push( [i+1, val.count] );
            ticks.push( [i+1, val.mon] );
        });
        $scope.monthlySpaceData = [{
            data: monthlySpaceData,
            label: "# ubicaciones"
        }];

        $scope.monthlySpaceOpts = {
            series: {
                lines: {
                    show: true,
                    lineWidth: 1,
                    fill: true, 
                    fillColor: { colors: [ { opacity: 0.1 }, { opacity: 0.13 } ] }
                },
                points: {
                    show: true, 
                    lineWidth: 2,
                    radius: 3
                },
                shadowSize: 0,
                stack: true
            },
            grid: {
                hoverable: true, 
                clickable: true, 
                tickColor: "#f9f9f9",
                borderWidth: 0
            },
            legend: {
                // show: false
                backgroundOpacity: 0,
                labelBoxBorderColor: "#fff"
            },  
            colors: ["#3f51b5", "#009688", "#2196f3"],
            xaxis: {
                ticks: ticks,
                font: {
                    family: "Roboto,sans-serif",
                    color: "#888"
                }
            },
            yaxis: {
                ticks:7, 
                tickDecimals: 0,
                font: {color: "#888"}
            }
        };
    }// initChartMonthlyOccupation

    function addMonthlySpaceTooltip(){
        $scope.monthlySpaceOpts['conTooltip'] = function(chart) {
            function showTooltip(x, y, contents) {
                $('<div id="tooltip">' + contents + '</div>').css( {
                    position: 'absolute',
                    display: 'none',
                    top: y - 40,
                    left: x - 55,
                    color: "#fff",
                    padding: '5px 10px',
                    'border-radius': '3px',
                    'background-color': 'rgba(0,0,0,0.6)'
                }).appendTo("body").fadeIn(200);
            }// showToolTip

            var previousPoint = null;
            chart.bind("plothover.conApp", function (event, pos, item) {
                if (item) {
                    if (previousPoint != item.dataIndex) {
                        previousPoint = item.dataIndex;

                        $("#tooltip").remove();
                        var x = item.datapoint[0].toFixed(0),
                            y = item.datapoint[1].toFixed(0);

                        var month = item.series.xaxis.ticks[item.dataIndex].label;

                        showTooltip(item.pageX, item.pageY,
                                    item.series.label + " en " + month + ": " + y);
                    }
                }
                else {
                    $("#tooltip").remove();
                    previousPoint = null;
                }
            });
        } 
    }

    function initChartInventoryByItemType( data ){

        $scope.inventoryByItemData = []
        $.each(data, function( type, numItems ){
            var charData = {};
            charData['label'] = type;
            charData['data'] = numItems;
            $scope.inventoryByItemData.push( charData );
        })
        
        $scope.inventoryByItemOpts = {
            series: {
                pie: {
                    innerRadius: 0.3,
                    show: true
                }
            },
            grid: {
                hoverable: true
            },
            legend: {
                backgroundOpacity: 0,
                labelBoxBorderColor: "#fff"
            },
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            }
        };
    }// initChartInventoryByItemType

    function getPendingEntryRequests(){
        InventoryItemService.getPendingEntryRequests( function( pendingInventoryItems ){
            $scope.pendingInventoryItems = pendingInventoryItems;
        });
    }// getPendingEntryRequests

    function initPendingEntryRequestsDataTable(){
        $scope.dtPendingEntryRequestsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(50)
                .withDOM('itp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
        $scope.dtPendingEntryRequestsColumnDefs = [
            DTColumnDefBuilder.newColumnDef(5).notSortable()
        ];
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
    }// initPendingEntryRequestsDataTable

    function getPendingWithdrawalRequests(){
        InventoryItemService.getPendingWithdrawalRequests( function( withdrawRequests ){
            console.log( withdrawRequests );
            $scope.withdrawRequests = withdrawRequests;
        });
    }// getPendingWithdrawalRequests

    function getPendingWithdrawalRequestsByUser( userId ){
        InventoryItemService.getPendingWithdrawalRequestsByUser( userId, function( withdrawRequests ){
            $scope.withdrawRequests = withdrawRequests;
        });
    }// getPendingWithdrawalRequestsByUser

    function initPendingWithdrawalRequestsDataTable(){
        $scope.dtPendingWithdrawalRequestsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(5)
                .withDOM('itp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
        $scope.dtPendingWithdrawalRequestsColumnDefs = [
            DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
    }// initPendingWithdrawalRequestsDataTable

    function showLatestTransactionsDataTable(){
        $scope.dtLatestTransactionsOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(5)
            .withDOM('pit')
            .withOption('responsive', true)
            .withOption('order', [])
            .withOption('searching', false);
        $scope.dtLatestTransactionsColumnDefs = [
            DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
    }// showLatestTransactionsDataTable

    function getLatestInventoryTransactions(){
        InventoryTransactionService.getAll( function( inventoryTransactions ){
            $scope.inventoryTransactions = inventoryTransactions;
        }); 
    }// getLatestInventoryTransactions

    function showLatestEntriesDataTable(){

        $scope.dtLatestEntriesOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('it')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

    }// showLatestEntriesDataTable

    function getLatestEntries(){
        InventoryItemService.getLatestEntries( function( latestInventoryItems ){
            $scope.latestInventoryItems = latestInventoryItems;
        }); 
    }// getLatestEntries

    function fetchClientWithdrawRequests( clientId ){
        ClientService.getWithdrawRequests( clientId, function( withdrawRequests ){
            console.log( withdrawRequests );
            $scope.withdrawRequests = withdrawRequests;
        }); 
    }// fetchClientWithdrawRequests

    function showWithdrawRequestsDataTable(){

        $scope.dtWithdrawRequestsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('it')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

    }// showWithdrawRequestsDataTable

    function fetchNewNotifications(){
        NotificationService.getNumUnread( function( numUnreadNotifications ){
            NotificationHelper.updateNotifications( numUnreadNotifications );
        });
    }

    function initChartInventoryByHighValue( totalNumberItems, highValueItems ){
        console.log(totalNumberItems - highValueItems );
        $scope.inventoryByHighValue = []
        var highValueObj = { label: 'Alto Valor', data: highValueItems };
        var otherObj = { label: 'Otros', data: totalNumberItems - highValueItems };
        $scope.inventoryByHighValue.push( highValueObj );
        $scope.inventoryByHighValue.push( otherObj );
        
        $scope.inventoryByHighValueOpts = {
            series: {
                pie: {
                    innerRadius: 0.3,
                    show: true
                }
            },
            grid: {
                hoverable: true
            },
            legend: {
                backgroundOpacity: 0,
                labelBoxBorderColor: "#fff"
            },
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            }
        };
    }// initChartInventoryByHighValue

    function initChartMonthlyRent( occupationData ){
        var monthlySpaceData = [];
        var ticks = [];

        $.each( occupationData, function(i, val){
            monthlySpaceData.push( [i+1, val.rent] );
            ticks.push( [i+1, val.date] );
        });
        $scope.monthlySpaceData = [{
            data: monthlySpaceData,
            label: "Renta mensual"
        }];

        $scope.monthlySpaceOpts = {
            series: {
                lines: {
                    show: true,
                    lineWidth: 1,
                    fill: true, 
                    fillColor: { colors: [ { opacity: 0.1 }, { opacity: 0.13 } ] }
                },
                points: {
                    show: true, 
                    lineWidth: 2,
                    radius: 3
                },
                shadowSize: 0,
                stack: true
            },
            grid: {
                hoverable: true, 
                clickable: true, 
                tickColor: "#f9f9f9",
                borderWidth: 0
            },
            legend: {
                // show: false
                backgroundOpacity: 0,
                labelBoxBorderColor: "#fff"
            },  
            colors: ["#3f51b5", "#009688", "#2196f3"],
            xaxis: {
                ticks: ticks,
                font: {
                    family: "Roboto,sans-serif",
                    color: "#888"
                }
            },
            yaxis: {
                ticks:7, 
                tickDecimals: 0,
                font: {color: "#888"}
            }
        };
    }// initChartMonthlyRent

    function getPendingEntryRequests(){
        InventoryItemService.getPendingEntryRequests( function( pendingInventoryItems ){
            console.log( pendingInventoryItems );
            $scope.pendingInventoryItems = pendingInventoryItems;
        });
    }// getPendingEntryRequests

    function getItemsWithPendingLocation(){
        InventoryItemService.withPendingLocation( function( locations ){
            $scope.pendingLocations = locations;
        }); 

        InventoryItemService.reentryWithPendingLocation( function( locations ){
            $scope.reentryPendingLocations = locations;
        }); 
    }// getItemsWithPendingLocation

    function initPendingLocationDataTable(){
        $scope.dtPendingLocationOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength( 15 )
            .withDOM('itp')
            .withOption('responsive', true)
            .withOption('order', [])
            .withOption('searching', false);
        $scope.dtPendingLocationColumnDefs = [
            DTColumnDefBuilder.newColumnDef(1).notSortable(),
            DTColumnDefBuilder.newColumnDef(6).notSortable()
        ];
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
    }// initPendingLocationDataTable

    function fetchPendingDeliveriesByUser( userId ){
        DeliveryService.pendingRequestsByUser( userId, function( deliveries ){
            $scope.pendingDeliveries = deliveries;
        });
    }// fetchPendingDeliveriesByUser

}]);