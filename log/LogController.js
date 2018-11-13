conAngular.controller('LogController', [ '$rootScope', '$scope', '$location', '$stateParams', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', 'LogService', 'NotificationService', function( $rootScope, $scope, $location, $stateParams, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, LogService, NotificationService ) {

  (function initController() {
    var currentPath = $location.path();
    initLogs( currentPath ); 
    fetchNewNotifications();
  })();

  /******************
  * PUBLIC FUNCTIONS
  *******************/

  /******************
  * PRIVATE FUNCTIONS
  *******************/

  function initLogs( currentPath ){
    switch( currentPath ){
      case '/view-logs':
        fetchLogs();
        initLogsTable(); 
        break;
    }
  }// initDashboard




  function fetchLogs(){
    LogService.getAll( function( logs ){
      console.log(logs);
      $scope.logs = logs;
    }); 
  }// fetchLogs

  function initLogsTable(){
      $scope.dtLogOptions = DTOptionsBuilder.newOptions()
          .withPaginationType('full_numbers')
          .withDisplayLength( 100 )
          .withDOM('pitp')
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

}]);