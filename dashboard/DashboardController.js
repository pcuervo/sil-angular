conAngular.controller('DashboardController', [ '$rootScope', '$scope', '$interval', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', 'InventoryTransactionService', 'InventoryItemService', 'ClientService', 'NotificationService', function( $rootScope, $scope, $interval, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, InventoryTransactionService, InventoryItemService, ClientService, NotificationService) {

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
            $state.go('/pending-withdrawal-requests', {}, { reload: true });
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

        $scope.inventoryByItemData = [];
        $scope.inventoryByItemOpts = {};
        $scope.monthlySpaceData = [];
        $scope.monthlySpaceOpts = {};
        addMonthlySpaceTooltip();

        initChartInventoryByHighValue( 1, 1 );
        ClientService.stats( $rootScope.globals.currentUser.id, function( stats ){
            console.log( stats );
            $scope.stats = stats;
            // Initialize charts
            initChartMonthlyRent( stats.rent_by_month );
            initChartInventoryByItemType( stats.inventory_by_type );
            initChartInventoryByHighValue( stats.total_number_items, stats.total_high_value_items );

            $scope.currentRent = 0;
            if( stats.rent_by_month.length > 0 ){
                $scope.currentRent =  stats.rent_by_month[  stats.rent_by_month.length-1 ].rent;
            }
        });

        // Load data for tables
        getLatestInventoryTransactions();
        getLatestEntries();
        // Create DataTables
        showLatestTransactionsDataTable();
        showLatestEntriesDataTable()
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
        initPendingEntryRequestsDataTable();
        
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
            console.log( 'hi' );
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
                .withDisplayLength(20)
                .withDOM('it')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
        // $scope.dtPendingEntryRequestsColumnDefs = [
        //     //DTColumnDefBuilder.newColumnDef(5).notSortable()
        // ];
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
    }// initPendingEntryRequestsDataTable

    function getPendingWithdrawalRequests(){
        InventoryItemService.getPendingWithdrawalRequests( function( withdrawRequests ){
            console.log( withdrawRequests );
            $scope.withdrawRequests = withdrawRequests;
        });
    }// getPendingWithdrawalRequests

    function initPendingWithdrawalRequestsDataTable(){
        $scope.dtPendingWithdrawalRequestsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('it')
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
        console.log( $scope.inventoryByHighValue );
        
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


  // sparkline 1
  $scope.spark1data = [76,78,87,65,43,35,23,25,12,14,27,35,32,37,31,46,43,32,36,57,78,87,82,75,58,54,70,23,54,67,34,23,87,12,43,65,23,76,32,55];
  $scope.spark1opts = {
    type: 'bar',
    width: '100%',
    height: 20,
    barColor: '#2196f3'
  };


  // rickshaw datas
  var rickshawLine1 = [{"x":0,"y":13},{"x":1,"y":12},{"x":2,"y":24},{"x":3,"y":25},{"x":4,"y":12},{"x":5,"y":16},{"x":6,"y":24},{"x":7,"y":13},{"x":8,"y":12},{"x":9,"y":11}];
  var rickshawLine2 = [{"x":0,"y":16},{"x":1,"y":23},{"x":2,"y":17},{"x":3,"y":16},{"x":4,"y":22},{"x":5,"y":25},{"x":6,"y":21},{"x":7,"y":22},{"x":8,"y":12},{"x":9,"y":13}];


}]);