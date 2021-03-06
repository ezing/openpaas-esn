'use strict';

var elastic = require('../elasticsearch');
var _ = require('lodash');
var CONSTANTS = require('./constants');

var defaultLimit = 50;
var defaultOffset = 0;

/**
 * Search communities in the given domains where the title match the query.search terms.
 */
module.exports.find = function(domains, query, callback) {

  elastic.client(function(err, client) {
    if (err) {
      return callback(err);
    }

    var elasticsearchOrFilters = domains.map(function(domain) {
      return {
        term: {
          domain_ids: domain._id
        }
      };
    });

    query = query || {limit: defaultLimit, offset: defaultOffset};
    var terms = (query.search instanceof Array) ? query.search.join(' ') : query.search;

    var elasticsearchQuery = {
      sort: [
        {title: 'asc'}
      ],
      query: {
        bool: {
          filter: {
            or: elasticsearchOrFilters
          },
          must: {
            match: {
              title: {
                type: 'phrase_prefix',
                query: terms,
                slop: 10
              }
            }
          }
        }
      }
    };

    client.search({
      index: CONSTANTS.ELASTICSEARCH.index,
      type: CONSTANTS.ELASTICSEARCH.type,
      from: query.offset,
      size: query.limit,
      body: elasticsearchQuery

    }, function(err, response) {
      if (err) {
        return callback(err);
      }

      var list = response.hits.hits;
      var communities = list.map(function(hit) { return _.extend(hit._source, { _id: hit._source.id }); });
      return callback(null, {
        total_count: response.hits.total,
        list: communities
      });
    });
  });
};
