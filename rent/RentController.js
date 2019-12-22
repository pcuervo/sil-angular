conAngular.controller('RentController', [ '$rootScope', '$scope', '$location', '$stateParams', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions','InventoryItemService', 'WarehouseService', 'NotificationService', 'ClientService', function( $rootScope, $scope, $location, $stateParams, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, InventoryItemService, WarehouseService, NotificationService, ClientService ) {

    (function initController() {
        var currentPath = $location.path();
        initRent( currentPath ); 
        fetchNewNotifications( );
    })();

    /******************
    * PUBLIC FUNCTIONS
    *******************/

    /******************
    * PRIVATE FUNCTIONS
    *******************/

    function initRent( currentPath ){
        switch( currentPath ){
            case '/rent-dashboard':
                fetchWarehouseStats();
                initClientsDataTable(); 
                break;
        }
    }// initDashboard

    function fetchWarehouseStats(){
        $scope.inventoryByItemData = [];
        $scope.inventoryByItemOpts = {};
        $scope.monthlySpaceData = [];
        $scope.monthlySpaceOpts = {};
        addMonthlySpaceTooltip();

        WarehouseService.stats( function( stats ){
            console.log( stats );
            $scope.stats = stats;
            initChartMonthlyRent( stats.rent_by_month );
        });

        InventoryItemService.getStats( function( stats ){
            console.log( stats );
            initChartInventoryByItemType( stats.inventory_by_type );
            initChartInventoryByHighValue( stats.total_number_items, stats.total_high_value_items );
        });
    }

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

    function initChartInventoryByHighValue( totalNumberItems, highValueItems ){

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

    function fetchNewNotifications(){
        NotificationService.getNumUnread( function( numUnreadNotifications ){
            NotificationHelper.updateNotifications( numUnreadNotifications );
        });
    }

}]);