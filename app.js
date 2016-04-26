/*
 * Con Full Assets List
 *
 * Usage:
 * var result = conAssets('simpleWeather,d3,nvd3')
 * result ==>
 *  [
 *    'assets/simpleWeather/jquery.simpleWeather.min.js',
 *    'assets/d3/d3.min.js',
 *    'assets/nvd3/nv.d3.min.css',
 *    'assets/nvd3/nv.d3.min.js',
 *    'assets/nvd3/angular-nvd3.min.js'
 *  ]
 */
window.conAssets = function(get) {
    var list = {
        simpleWeather: ['assets/simpleWeather/jquery.simpleWeather.min.js'],

        sparkline: [
            'assets/sparkline/jquery.sparkline.min.js',
            'assets/angularjs-sparkline/angularjs.sparkline.js'
        ],

        flot: [
            'assets/flot/jquery.flot.min.js',
            'assets/flot/jquery.flot.time.min.js',
            'assets/flot/jquery.flot.pie.min.js',
            'assets/flot/jquery.flot.tooltip.min.js',
            'assets/flot/jquery.flot.categories.min.js',
            'assets/angularjs-flot/angular-flot.js'
        ],

        nvd3: [
            'assets/d3/d3.min.js',
            'assets/nvd3/nv.d3.min.css',
            'assets/nvd3/nv.d3.min.js',
            'assets/angularjs-nvd3/angular-nvd3.min.js'
        ],

        rickshaw: [
            'assets/d3/d3.min.js',
            'assets/rickshaw/rickshaw.min.css',
            'assets/rickshaw/rickshaw.min.js',
            'assets/angularjs-rickshaw/rickshaw-angularjs.js'
        ],

        markitup: [
            'assets/markitup/skins/_con/style.css',
            'assets/markitup/sets/default/style.css',
            'assets/markitup/sets/default/set.js',
            'assets/markitup/jquery.markitup.js'
        ],

        ckeditor: ['assets/ckeditor/ckeditor.js'],

        select2: [
            'assets/select2/css/select2.min.css',
            'assets/select2/js/select2.full.min.js'
        ],

        tagsinput: [
            'assets/jquery-tags-input/jquery.tagsinput.css',
            'assets/jquery-tags-input/jquery.tagsinput.js'
        ],

        dropzone: [
            'assets/dropzone/dropzone.min.css',
            'assets/dropzone/dropzone.min.js'
        ],

        clockpicker:[
            'assets/jquery-clockpicker/jquery-clockpicker.min.css',
            'assets/jquery-clockpicker/jquery-clockpicker.min.js'
        ],

        pikaday: [
            'assets/pikaday/pikaday.css',
            'assets/pikaday/pikaday.js',
            'assets/pikaday/pikaday.jquery.js'
        ],

        spectrum: [
            'assets/spectrum/spectrum.css',
            'assets/spectrum/spectrum.js'
        ],

        inputmask: ['assets/jquery-input-mask/jquery.inputmask.bundle.min.js'],

        parsley: ['assets/parsley/parsley.min.js'],

        gmaps: ['assets/gmaps/gmaps.min.js'],
        geoAutocomplete: ['assets/geo-autocomplete/geo-autocomplete.js'],

        jvectormap: [
            'assets/jquery-jvectormap/jquery-jvectormap.css',
            'assets/jquery-jvectormap/jquery-jvectormap.min.js',
            'assets/jquery-jvectormap/jquery-jvectormap-world-mill-en.js',
            'assets/jquery-jvectormap/gdp-data.js',
            'assets/angulajs-jvectormap/angularjs-jvectormap.js'
        ],

        dataTables: [
            'assets/dataTables/js/jquery.dataTables.min.js',
            'assets/dataTables/extensions/TableTools/js/dataTables.tableTools.min.js',
            'assets/dataTables/extensions/Scroller/js/dataTables.scroller.min.js',
            'assets/angularjs-dataTables/angular-datatables.min.js',
            'assets/angularjs-dataTables/plugins/responsive/angular-datatables.responsive.min.js',
            'assets/angularjs-dataTables/plugins/responsive/angular-datatables.responsive.css'
        ],

        fullcalendar: [
            'assets/fullcalendar/fullcalendar.min.css',
            'assets/fullcalendar/moment.min.js',
            'assets/fullcalendar/jquery-ui.custom.min.js',
            'assets/fullcalendar/fullcalendar.min.js'
        ],

        sortable: ['assets/sortable/Sortable.min.js'],

        wowjs: ['assets/wow.js/wow.min.js'],

        animatecss: ['assets/animate.css/animate.css'],

        photoswipe: [
            'assets/PhotoSwipe/photoswipe.css',
            'assets/PhotoSwipe/default-skin/default-skin.css',
            'assets/PhotoSwipe/photoswipe.min.js',
            'assets/PhotoSwipe/photoswipe-ui-default.min.js'
        ],

        isotope: ['assets/isotope/isotope.pkgd.min.js'],

        videojs: [
            'assets/video.js/video-js.css',
            'assets/video.js/video.js',
            'assets/video.js/plugins/vjs.youtube.js',
            'assets/video.js/plugins/media.vimeo.js'
        ],

        jsBarcode: [
            'assets/jsBarcode/jsBarcode.js',
            'assets/jsBarcode/code_128.js'
        ]
    };

    // return result array
    var get = get.split(',');
    var result = [];
    for(var k in get) {
        if(typeof list[ get[k] ] !== 'undefined') {
            for(var n in list[ get[k] ]) result.push( list[ get[k] ][n] );
        }
    }

    return result;
}// window.conAssets get()


/*
 * Con AngularJS Version
 */
var conAngular =
    angular.module("conAngular", [
        "ui.router",
        "ui.materialize",
        "oc.lazyLoad",
        "ngSanitize",
        "ngCookies",
        "datatables",
    ]);

// Config ocLazyLoader
conAngular.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
    // lazy load config
    });
}]);

// App Controller
conAngular.controller('AppController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $scope.$on('$viewContentLoaded', function() {
        // init plugins
        conApp.initPlugins();
        conApp.initCards();
        conApp.initCardTodo();
        conApp.initCardWeather();
    });
}]);

// Setup Rounting For All Pages
conAngular.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");

  // pages
  $stateProvider
    // Login
    .state('/login', {
        url: "/login",
        templateUrl: "authentication/login.html",
        controller: "LoginController",
        data: {
            pageTitle: 'Login'
        }
    })
    // Dashboard
    .state('/dashboard', {
      url: "/dashboard",
      templateUrl: "dashboard/dashboard.html",
      controller: "DashboardController",
      data: {
        pageTitle: 'Admin Dashboard with Material Design',
        crumbs: [{
            title: '<i class="fa fa-home"></i> Home',
            href: '#'
          }, {
            title: 'Dashboard',
            href: '#/dashboard'
          }]
      },
      resolve: {
        deps: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load([{
            name: 'conAngular',
            insertBefore: '#ngInsertBefore', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
            files: conAssets('simpleWeather,sortable')
          }, {
            name: 'conAngular',
            serie: true, // used for synchronous load chart scripts
            insertBefore: '#ngInsertBefore',
            files: conAssets('sparkline,flot,rickshaw,jvectormap')
          }]);
        }]
      }
    })
    // Logout
    .state('/logout', {
      url: "/logout",
      controller: "LogoutController"
    })
    // Entradas
    .state('/check-in', {
        url: "/check-in",
        templateUrl: "inventory-item/check-in.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entradas',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                    files: conAssets('sortable')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })

    .state('/add-unit-item', {
        url: "/add-unit-item",
        templateUrl: "inventory-item/add-unit-item.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entrada unitaria',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Entrada unitaria'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/add-bulk-item', {
        url: "/add-bulk-item",
        templateUrl: "inventory-item/add-bulk-item.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entrada a granel',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Entrada a granel'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/add-bundle-item', {
        url: "/add-bundle-item",
        templateUrl: "inventory-item/add-bundle-item.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entrada paquete',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Entrada paquete'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/re-entry', {
        url: "/re-entry/:barcode",
        templateUrl: "inventory-item/re-entry.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Reingresos',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Reingresos'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/request-entry', {
        url: "/request-entry",
        templateUrl: "inventory-item/request-entry.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Solicitud de entrada',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Solicitud de entrada'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/pending-entries', {
        url: "/pending-entries",
        templateUrl: "inventory-item/pending-entries.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entradas pendientes',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Entradas pendientes'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/pending-entry-requests', {
        url: "/pending-entry-requests",
        templateUrl: "inventory-item/pending-entry-requests.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entradas pendientes',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Entradas pendientes'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }]);
            }]
        }
    })
    .state('/authorize-entry', {
        url: "/authorize-entry/:itemId",
        templateUrl: "inventory-item/authorize-entry.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Entrada',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Entradas'
            },
            {
                title: 'Autorizar entrada'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('jsBarcode,parsley')
                }]);
            }]
        }
    })
    .state('/pending-withdrawals', {
        url: "/pending-withdrawals",
        templateUrl: "inventory-item/pending-withdrawals.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salidas pendientes',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Salidas',
                href: '#/check-out'
            }, {
                title: 'Salidas pendientes'
            }]
        }
    })
    .state('/view-item', {
        url: "/view-item/:itemId",
        templateUrl: "inventory-item/view-item.html",
        controller: "InventoryController",
        data: {
            pageTitle: 'Detalle artículo',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Detalle artículo'
            }]
        }, resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('jsBarcode')
                }]);
            }]
        }
    })
    .state('/edit-item', {
        url: "/edit-item/:itemId",
        templateUrl: "inventory-item/edit-item.html",
        controller: "CheckInController",
        data: {
            pageTitle: 'Editar artículo',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Entradas',
                href: '#/check-in'
            }, {
                title: 'Editar artículo'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley,jsBarcode')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })

    // Salidas
    .state('/check-out', {
        url: "/check-out",
        templateUrl: "inventory-item/check-out.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salidas',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Salidas'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                    files: conAssets('sortable')
                }, {
                    name: 'conAngular',
                    serie: true, // used for synchronous load chart scripts
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/express-withdrawal', {
        url: "/express-withdrawal",
        templateUrl: "inventory-item/express-withdrawal.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida express',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Express'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/withdraw-unit-item', {
        url: "/withdraw-unit-item",
        templateUrl: "inventory-item/withdraw-unit-item.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida unitaria',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Unitaria'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/withdraw-bulk-item', {
        url: "/withdraw-bulk-item",
        templateUrl: "inventory-item/withdraw-bulk-item.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida granel',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Granel'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/withdraw-bundle-item', {
        url: "/withdraw-bundle-item",
        templateUrl: "inventory-item/withdraw-bundle-item.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida paquete',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Paquete'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/withdraw-item', {
        url: "/withdraw-item/:itemId",
        templateUrl: "inventory-item/withdraw-item.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Salida de inventario'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/withdraw-items', {
        url: "/withdraw-items",
        templateUrl: "inventory-item/withdraw-items.html",
        controller: "CheckOutController",
        data: {
            pageTitle: 'Salida',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Salidas'
            },
            {
                title: 'Salida de inventario'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/my-inventory', {
        url: "/my-inventory",
        templateUrl: "inventory-item/my-inventory.html",
        controller: "InventoryController",
        data: {
            pageTitle: 'Mi inventario',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Mi inventario'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })

    // Inventory transaction
    .state('/inventory-transactions', {
        url: "/inventory-transactions/:transactionType",
        templateUrl: "inventory-transaction/inventory-transactions.html",
        controller: "InventoryTransactionController",
        data: {
            pageTitle: 'Movimientos al inventario',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Movimientos al inventario',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('')
                }]);
            }]
        }
    })
    .state('/view-inventory-transaction', {
        url: "/view-inventory-transaction/:transactionId",
        templateUrl: "inventory-transaction/view-inventory-transaction.html",
        controller: "InventoryTransactionController",
        data: {
            pageTitle: 'Detalle movimiento al inventario',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Detalle movimiento al inventario',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('')
                }]);
            }]
        }
    })

    // Users
    .state('/add-user', {
        url: "/add-user",
            templateUrl: "user/add-user.html",
            controller: "UserController",
            data: {
                pageTitle: 'Agregar usuario',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar usuario',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-users', {
        url: "/view-users",
            templateUrl: "user/view-users.html",
            controller: "UserController",
            data: {
                pageTitle: 'Ver usuarios',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#'
            }, {
                title: 'Ver usuarios',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    serie: true,
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })
    .state('/edit-user', {
        url: "/edit-user/:userId",
            templateUrl: "user/edit-user.html",
            controller: "UserController",
            data: {
                pageTitle: 'Editar',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#/dashboard'
            }, {
                title: 'Editar usuario',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/my-account', {
        url: "/my-account",
            templateUrl: "user/my-account.html",
            controller: "UserController",
            data: {
                pageTitle: 'Dashboard',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#/dashboard'
            }, {
                title: 'Mi cuenta',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/edit-profile', {
        url: "/edit-profile",
            templateUrl: "user/edit-profile.html",
            controller: "UserController",
            data: {
                pageTitle: 'Dashboard',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#/dashboard'
            }, {
                title: 'Editar perfil',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/change-password', {
        url: "/change-password",
            templateUrl: "user/change-password.html",
            controller: "UserController",
            data: {
                pageTitle: 'Dashboard',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#/dashboard'
            }, {
                title: 'Cambiar contraseña',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })

    // Projects
    .state('/add-project', {
        url: "/add-project",
            templateUrl: "project/add-project.html",
            controller: "ProjectController",
            data: {
                pageTitle: 'Agregar proyecto',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar proyecto',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-projects', {
        url: "/view-projects",
            templateUrl: "project/view-projects.html",
            controller: "ProjectController",
            data: {
                pageTitle: 'Ver proyectos',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar proyecto',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/edit-project', {
        url: "/edit-project/:projectId",
            templateUrl: "project/edit-project.html",
            controller: "ProjectController",
            data: {
                pageTitle: 'Editar proyecto',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Editar proyecto',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/add-user-to-project', {
        url: "/add-user-to-project/:projectId",
            templateUrl: "project/add-user-to-project.html",
            controller: "ProjectController",
            data: {
                pageTitle: 'Agregar usuario a proyecto',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar usuario a proyecto',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })

    // Clients
    .state('/add-client', {
        url: "/add-client",
            templateUrl: "client/add-client.html",
            controller: "ClientController",
            data: {
                pageTitle: 'Agregar cliente',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar cliente',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-clients', {
        url: "/view-clients",
            templateUrl: "client/view-clients.html",
            controller: "ClientController",
            data: {
                pageTitle: 'Clientes',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ver clientes',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/add-client-user', {
        url: "/add-client-user",
            templateUrl: "client/add-client-user.html",
            controller: "ClientController",
            data: {
                pageTitle: 'Agregar usuario a cliente',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar usuario a cliente',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-client-users', {
        url: "/view-client-users",
            templateUrl: "client/view-client-users.html",
            controller: "ClientController",
            data: {
                pageTitle: 'Usuarios de clientes',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ver usuarios de clientes',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })

    // Warehouse
    .state('/wh-dashboard', {
        url: "/wh-dashboard",
            templateUrl: "warehouse/wh-dashboard.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Resumen ubicaciones',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Resumen ubicaciones',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('simpleWeather,sortable')
                }, {
                    name: 'conAngular',
                    serie: true,
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('sparkline,flot,rickshaw,jvectormap')
                }]);
            }]
        }
    })
    .state('/view-rack', {
        url: "/view-rack/:rackId",
            templateUrl: "warehouse/view-rack.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Ver rack',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ver rack',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-location', {
        url: "/view-location/:locationId",
            templateUrl: "warehouse/view-location.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Ver ubicación',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Detalle ubicación',
            }]
        }
    })
    .state('/locate-item', {
        url: "/locate-item/:itemId",
            templateUrl: "warehouse/locate-item.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Asignar ubicación',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ubicar',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/relocate', {
        url: "/relocate/:locationId/:itemId",
            templateUrl: "warehouse/relocate.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Reubicar',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Reubicar',
            }]
        },resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('jsBarcode')
                }]);
            }]
        }
    })
    .state('/view-racks', {
        url: "/view-racks",
            templateUrl: "warehouse/view-racks.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Ver racks',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#'
            }, {
                title: 'Ver racks',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    serie: true,
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })
    .state('/add-rack', {
        url: "/add-rack",
            templateUrl: "warehouse/add-rack.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Agregar rack',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar rack',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/edit-location', {
        url: "/edit-location/:locationId",
            templateUrl: "warehouse/edit-location.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Editar ubicación',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Editar ubicación',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-warehouse-transactions', {
        url: "/view-warehouse-transactions",
            templateUrl: "warehouse/view-warehouse-transactions.html",
            controller: "WarehouseController",
            data: {
                pageTitle: 'Movimientos a ubicaciones',
                crumbs: [{
                    title: '<i class="fa fa-dashboard"></i> Dashboard',
                    href: '#'
            }, {
                title: 'Ver movimientos',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    serie: true,
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })

    // Suppliers
    .state('/add-supplier', {
        url: "/add-supplier",
            templateUrl: "supplier/add-supplier.html",
            controller: "SupplierController",
            data: {
                pageTitle: 'Agregar proveedor',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Agregar proveedor',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })
    .state('/view-suppliers', {
        url: "/view-suppliers",
            templateUrl: "supplier/view-suppliers.html",
            controller: "SupplierController",
            data: {
                pageTitle: 'Proveedores',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ver proveedores',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/notifications', {
        url: "/notifications",
            templateUrl: "notification/notifications.html",
            controller: "NotificationController",
            data: {
                pageTitle: 'Notifications',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Ver proveedores',
            }]
        }
    })

    .state('/delivery-dashboard', {
        url: "/delivery-dashboard",
            templateUrl: "delivery/delivery-dashboard.html",
            controller: "DeliveryController",
            data: {
                pageTitle: 'Envíos',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Dashboard envíos',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([{
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley, dataTables')
                }]);
            }]
        }
    })
    .state('/multiple-items-delivery', {
        url: "/multiple-items-delivery",
        templateUrl: "delivery/multiple-items-delivery.html",
        controller: "DeliveryController",
        data: {
            pageTitle: 'Envío',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Envíos'
            },
            {
                title: 'Envíos'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables,parsley,geoAutocomplete,gmaps')
                }]);
            }]
        }
    })
    .state('/single-item-delivery', {
        url: "/single-item-delivery",
        templateUrl: "delivery/single-item-delivery.html",
        controller: "DeliveryController",
        data: {
            pageTitle: 'Envío',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Envíos'
            },
            {
                title: 'Envíos'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables')
                }]);
            }]
        }
    })
    .state('/new-delivery', {
        url: "/new-delivery/:itemId",
        templateUrl: "delivery/new-delivery.html",
        controller: "DeliveryController",
        data: {
            pageTitle: 'Envíos',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard'
            }, {
                title: 'Envíos'
            },
            {
                title: 'Envío'
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('dataTables,parsley,geoAutocomplete,gmaps')
                }]);
            }]
        }
    })
    .state('/view-delivery', {
        url: "/view-delivery/:deliveryId",
        templateUrl: "delivery/view-delivery.html",
        controller: "DeliveryController",
        data: {
            pageTitle: 'Detalle artículo',
            crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Detalle artículo'
            }]
        }, resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('geoAutocomplete,gmaps,parsley')
                }]);
            }]
        }
    })
    // Settings
    .state('/system-settings', {
        url: "/system-settings",
            templateUrl: "system-settings/system-settings.html",
            controller: "SettingsController",
            data: {
                pageTitle: 'Configuración',
                crumbs: [{
                title: '<i class="fa fa-dashboard"></i> Dashboard',
                href: '#/dashboard'
            }, {
                title: 'Configuración',
            }]
        },
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                {
                    name: 'conAngular',
                    insertBefore: '#ngInsertBefore',
                    files: conAssets('parsley')
                }]);
            }]
        }
    })

}]);

/* Init global settings and run the app */
conAngular.run(['$rootScope', '$state', '$cookies', '$http', 'AuthenticationService', function($rootScope, $state, $cookies, $http, AuthenticationService) {

    // API URL
    var test = 'http://localhost:3000/api/';
    var stage = 'https://sil-api.herokuapp.com/api/'
    $rootScope.apiUrl = test;

    $rootScope.loggedIn = $cookies.get('loggedIn') == 'true' ? true : false;
    // state to be accessed from view
    $rootScope.$state = $state;
    // keep user logged in after page refresh
    $rootScope.globals = $cookies.getObject('globals') || {};
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {

        // redirect to login page if not logged in and trying to access a restricted page
        var restrictedPage = $.inArray($state.get(), ['/login']) === -1;
        $rootScope.loggedIn = $cookies.get('loggedIn') == 'true' ? true : false;
        var loggedIn = $rootScope.loggedIn;

        if (restrictedPage && !loggedIn ) {
            event.preventDefault();
            $state.go('/login');
        }

    });

}]);


var ErrorHelper = ErrorHelper || {};
ErrorHelper = {
    display: function( errors ){
        angular.forEach( errors, function( error, field ){
            Materialize.toast( field + ': ' + error, 4000, 'red');
        })
    }
};

var FormatHelper = FormatHelper || {};
FormatHelper = {
    slug: function( text ){
        return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,' ');
    },
    dateYMD: function( date, separator ){
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getFullYear();

        if( dd<10 ) dd = '0' + dd;
        if( mm<10 ) mm = '0' + mm;

        var date = yyyy + separator + mm + separator+ dd;
        return date;
    }
};

var LoaderHelper = LoaderHelper || {};
LoaderHelper = {
    showLoader: function( message ){
        var loader = document.getElementById('loader');
        loader.className = loader.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        loader.getElementsByTagName('p')[0].innerHTML = message;
    },
    hideLoader: function(){
        var loader = document.getElementById('loader');
        loader.className += ' hide';
    }
}

var NotificationHelper = NotificationHelper || {};
NotificationHelper = {
    updateNotifications: function( numNotifications ){ $('.notification-menu span').text( numNotifications ); }
}
