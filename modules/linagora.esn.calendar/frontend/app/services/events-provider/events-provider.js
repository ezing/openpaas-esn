(function() {
  'use strict';

  angular.module('esn.calendar')
         .factory('calEventsProviders', calEventsProviders);

  calEventsProviders.$inject = [
    '$log',
    '$q',
    '$rootScope',
    'calendarHomeService',
    'calendarService',
    'calEventService',
    'newProvider',
    'searchProviders',
    'CALENDAR_EVENTS',
    'ELEMENTS_PER_REQUEST'
  ];

  function calEventsProviders($log, $q, $rootScope, calendarHomeService, calendarService, calEventService, newProvider, searchProviders, CALENDAR_EVENTS, ELEMENTS_PER_REQUEST) {
    var service = {
      setUpSearchProviders: setUpSearchProviders,
      getAll: getAll,
      getForCalendar: getForCalendar
    };

    return service;

    ////////////

    function buildProvider(calendar) {
      var name = 'Events from ' + calendar.name;

      return newProvider({
        name: name,
        id: calendar.id,
        fetch: function(query) {
          var offset = 0;

          function _setRelevance(event) {
            event.date = event.start;
          }

          return function() {
            var context = {
              query: query,
              offset: offset,
              limit: ELEMENTS_PER_REQUEST
            };

            return calEventService.searchEvents(calendar.id, context)
              .then(function(events) {
                offset += events.length;

                return events.map(function(event) {
                  event.type = name;
                  _setRelevance(event);

                  return event;
                });
              });
          };
        },
        buildFetchContext: function(options) { return $q.when(options.query); },
        templateUrl: '/calendar/app/services/events-provider/event-search-item'
      });
    }

    function getAll() {
      return calendarHomeService.getUserCalendarHomeId().then(function(calendarHomeId) {
        return calendarService.listCalendars(calendarHomeId);
      }).then(function(calendars) {
        return calendars.map(buildProvider);
      }, function(error) {
        $log.error('Could not register search providers for calendar module', error);

        return [];
      });
    }

    function getForCalendar(calendar) {
      return buildProvider(calendar);
    }

    function setUpSearchProviders() {
      searchProviders.add(getAll());

      $rootScope.$on(CALENDAR_EVENTS.CALENDARS.ADD, function(event, calendar) { // eslint-disable-line
        searchProviders.add(getForCalendar(calendar));
      });

      $rootScope.$on(CALENDAR_EVENTS.CALENDARS.REMOVE, function(event, calendar) {
        searchProviders.remove(function(provider) {
          return provider.id === calendar.id;
        });
      });
    }
  }

})();
