conAngular.controller('DashboardController', [ '$rootScope', '$scope', '$interval', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', 'InventoryTransactionService', 'InventoryItemService', function($rootScope, $scope, $interval, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, InventoryTransactionService, InventoryItemService) {

    (function initController() {
        $scope.role = $rootScope.globals.currentUser.role;
        $scope.dashboardTemplate = 'dashboard/dashboard-old.html';
        initDashboard( $scope.role ); 
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

    /******************
    * PRIVATE FUNCTIONS
    *******************/

    function initDashboard( role ){
        switch( role ){
            case 1:
                initDashboardAdmin();
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            default:
                initDashboardClient();
        }
    }// initDashboard

    function initDashboardClient(){
        $scope.dashboardTemplate = 'dashboard/client-dashboard.html';
        initChartMonthlySpace();
        initChartCostByItemType();
        // Load data for tables
        getLatestInventoryTransactions();
        getLatestEntries();
        // Create DataTables
        showLatestTransactionsDataTable();
        showLatestEntriesDataTable()
    }// initDashboardClient

    function initDashboardAdmin(){
        getTotalInventory();
        getInventoryValue();
        getCurrentRent();
        $scope.dashboardTemplate = 'dashboard/admin-dashboard.html';
        initChartTransactions( 'weekly' );
        //initChartCostByItemType();
        // Load data for tables
        //getLatestInventoryTransactions();
        //getLatestEntries();
        // Create DataTables
        //showLatestTransactionsDataTable();
        //showLatestEntriesDataTable()
    }// initDashboardAdmin

    function getTotalInventory(){
        InventoryItemService.getTotalInventory( function( totalInventory ){
            $scope.totalInventory = totalInventory;
        }); 
    }

    function getInventoryValue(){
        InventoryItemService.getInventoryValue( function( inventoryValue ){
            $scope.inventoryValue = inventoryValue;
        }); 
    }

    function getCurrentRent(){
        InventoryItemService.getCurrentRent( function( currentRent ){
            $scope.currentRent = currentRent;
        }); 
    }

    function initChartTransactions( span ){
        $scope.monthlySpaceData = [{
            data: [[1, 10], [2, 12], [3, 15], [4, 14],[5, 19],[6, 20],[7, 20],[8, 22],[9, 23],[10, 21],[11, 21],[12, 25]],
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
                ticks: [ [1, "Ene"], [2, "Feb"] ],
                font: {
                    family: "Roboto,sans-serif",
                    color: "#888"
                }
            },
            yaxis: {
                ticks:7, 
                tickDecimals: 0,
                font: {color: "#888"}
            },
            conTooltip: function(chart) {
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
        };
    }// initChartTransactions

    function initChartMonthlySpace(){
        $scope.monthlySpaceData = [{
            data: [[1, 10], [2, 12], [3, 15], [4, 14],[5, 19],[6, 20],[7, 20],[8, 22],[9, 23],[10, 21],[11, 21],[12, 25]],
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
                ticks: [[1, "Ene"], [2, "Feb"], [3, "Mar"], [4,"Abr"], [5,"May"], [6,"Jun"], [7,"Jul"], [8,"Ago"], [9,"Sep"], [10,"Oct"], [11,"Nov"], [12,"Dic"]],
                font: {
                    family: "Roboto,sans-serif",
                    color: "#888"
                }
            },
            yaxis: {
                ticks:7, 
                tickDecimals: 0,
                font: {color: "#888"}
            },
            conTooltip: function(chart) {
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
        };
    }// initChartMonthlySpace

    function initChartCostByItemType(){
        $scope.costByItemTypeData = [
            { label: "Tipo A - $45.00",  data: 45, color: "#90a4ae"},
            { label: "Tipo B - $67.00",  data: 67, color: "#7986cb"},
            { label: "Tipo C - $23.00",  data: 23, color: "#9575cd"}
        ];
        $scope.costByItemTypeOpts = {
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
    }// initChartCostByItemType

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
            console.log( latestInventoryItems );
            $scope.latestInventoryItems = latestInventoryItems;
        }); 
    }// getLatestEntries









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


  // rickshaw 1
  $scope.rickshaw1options = {
    renderer: 'area',
    stroke: false,
    height: 179
  };
  $scope.rickshaw1features = {
    hover: {
      xFormatter: function(x) {
        return x;
      },
      yFormatter: function(y) {
        return y;
      }
    }
  };
  $scope.rickshaw1series = [ {
      data: rickshawLine1,
      color: '#42a5f5',
      name: 'Visits'
    }, {    
      data: rickshawLine2,
      color: '#90caf9',
      name: 'Views'
    } ];


  // rickshaw 2
  $scope.rickshaw2options = {
    renderer: 'bar',
    height: 179
  };
  $scope.rickshaw2features = {
    hover: {
      xFormatter: function(x) {
        return x;
      },
      yFormatter: function(y) {
        return y;
      }
    }
  };
  $scope.rickshaw2series = [ {
      data: rickshawLine1,
      color: '#26a69a',
      name: 'Visits'
    }, {    
      data: rickshawLine2,
      color: '#80cbc4',
      name: 'Views'
    } ];


  // rickshaw 3
  $scope.rickshawSeries = [[], []];

  // Create random data
  $scope.randomData = new Rickshaw.Fixtures.RandomData(50);
  for (var i = 0; i < 40; i++) {
    $scope.randomData.addData($scope.rickshawSeries);
  }

  $scope.rickshaw3options = {
    interpolation: 'cardinal',
    renderer: 'area',
    height: 254
  };
  $scope.rickshaw3features = {
    hover: {}
  };
  $scope.rickshaw3series = [ {
      data: $scope.rickshawSeries[0],
      color: '#4db6ac',
      name: 'HDD'
    }, {
      data: $scope.rickshawSeries[1],
      color: '#b2dfdb',
      name: 'CPU'
    } ];

  // Live Update
  $interval(function () {
    $scope.randomData.removeData($scope.rickshawSeries);
    $scope.randomData.addData($scope.rickshawSeries);
    
    $scope.$broadcast('rickshaw::resize');
  }, 1000);



  // flot 1
  $scope.flot1data = [{
      data: [[1, 50], [2, 58], [3, 45], [4, 62],[5, 55],[6, 65],[7, 61],[8, 70],[9, 65],[10, 50],[11, 53],[12, 49]],
      label: "Entradas"
    }, {
      data: [[1, 25], [2, 31], [3, 23], [4, 48],[5, 38],[6, 40],[7, 47],[8, 55],[9, 43],[10,30],[11,37],[12, 29]],
      label: "Salidas"
    }];
  $scope.flot1opts = {
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
      ticks: [[1, "Jan"], [2, "Feb"], [3, "Mar"], [4,"Apr"], [5,"May"], [6,"Jun"], 
                 [7,"Jul"], [8,"Aug"], [9,"Sep"], [10,"Oct"], [11,"Nov"], [12,"Dec"]],
      font: {
        family: "Roboto,sans-serif",
        color: "#ccc"
      }
    },
    yaxis: {
      ticks:7, 
      tickDecimals: 0,
      font: {color: "#ccc"}
    },

    conTooltip: function(chart) {
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
      }

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
                        item.series.label + " of " + month + ": " + y);
          }
        }
        else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
    }
  };


  // flot 2
  $scope.flot2data = [
    { label: "Unitario",  data: 45, color: "#90a4ae"},
    { label: "Paquete",  data: 67, color: "#7986cb"},
    { label: "Granel",  data: 23, color: "#9575cd"}
  ];
  $scope.flot2opts = {
    series: {
      pie: {
        innerRadius: 0.5,
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



  // jvectormap 1
  $scope.jvmap1opts = {
    map: 'world_mill_en',
    zoom: 2,
    series: {
      regions: [{
        values: gdpData,
        scale: ['#e3f2fd', '#2196f3'],
        normalizeFunction: 'polynomial'
      }]
    },
    backgroundColor: '#fff',
    onRegionTipShow: function(e, el, code){
      el.html(el.html()+' (GDP - '+gdpData[code]+')');
    }
  };


}]);