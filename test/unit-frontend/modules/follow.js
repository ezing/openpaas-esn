'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The esn.follow Angular module', function() {

  beforeEach(function() {
    module('jadeTemplates');
    module('esn.session');
    module('esn.follow');
  });

  describe('The followAPI factory', function() {
    var sessionMock, session, followAPI, $httpBackend;
    var userId = '1';

    beforeEach(function() {
      sessionMock = {
        user: {
          _id: userId
        }
      };

      module(function($provide) {
        $provide.value('session', sessionMock);
      });

      inject(function(_followAPI_, _session_, _$httpBackend_) {
        followAPI = _followAPI_;
        session = _session_;
        $httpBackend = _$httpBackend_;
      });
    });

    describe('The follow function', function() {
      it('should call the right endpoint', function() {
        var followUser = {
          _id: 123
        };

        $httpBackend.expectPUT('/api/users/' + session.user._id + '/followings/' + followUser._id).respond({});
        followAPI.follow(followUser);
        $httpBackend.flush();
      });
    });

    describe('The unfollow function', function() {
      it('should call the right endpoint', function() {

        var followUser = {
          _id: 123
        };

        $httpBackend.expectDELETE('/api/users/' + session.user._id + '/followings/' + followUser._id).respond(204, {});
        followAPI.unfollow(followUser);
        $httpBackend.flush();
      });
    });

    describe('The getFollowers function', function() {
      it('should call the right endpoint', function() {
        var options = {
          limit: 10,
          offset: 0
        };

        var user = {
          _id: 345
        };

        $httpBackend.expectGET('/api/users/' + user._id + '/followers?limit=' + options.limit + '&offset=' + options.offset).respond([]);
        followAPI.getFollowers(user, options);
        $httpBackend.flush();
      });
    });

    describe('The getFollowings function', function() {
      it('should call the right endpoint', function() {
        var options = {
          limit: 10,
          offset: 0
        };

        var user = {
          _id: 345
        };

        $httpBackend.expectGET('/api/users/' + user._id + '/followings?limit=' + options.limit + '&offset=' + options.offset).respond([]);
        followAPI.getFollowings(user, options);
        $httpBackend.flush();
      });
    });
  });

  describe('The followButton directive', function() {
    var $compile, $rootScope, $scope, followAPIMock, followAPI;

    function compileDirective(html) {
      var element = $compile(html)($scope);
      $scope.$digest();
      return element;
    }

    beforeEach(function() {
      followAPIMock = {};
      module(function($provide) {
        $provide.value('followAPI', followAPIMock);
      });

      inject(function(_$compile_, _$rootScope_, _followAPI_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        followAPI = _followAPI_;
      });
    });

    describe('When following', function() {

      it('should not be able to follow', function() {
        $scope.following = true;
        $scope.spyFollow = sinon.spy();
        $scope.spyUnfollow = sinon.spy();
        $scope.user = {
          _id: '123'
        };
        followAPIMock.follow = sinon.spy();
        var element = compileDirective('<follow-button following="following", user="user", on-followed="spyFollow()", on-unfollowed="spyUnfollow()"/>');
        var scope = element.isolateScope();

        scope.follow();
        $rootScope.$digest();
        expect(followAPIMock.follow).to.not.have.been.called;
        expect($scope.spyFollow).to.not.have.been.called;
        expect($scope.spyUnfollow).to.not.have.been.called;
      });

      it('should unfollow the user on click', function() {
        $scope.following = true;
        $scope.spyFollow = sinon.spy();
        $scope.spyUnfollow = sinon.spy();
        $scope.user = {
          _id: '123'
        };

        followAPIMock.unfollow = function(_user) {
          expect(_user).to.deep.equal($scope.user);
          return $q.when(true);
        };

        var element = compileDirective('<follow-button following="following", user="user", on-followed="spyFollow()", on-unfollowed="spyUnfollow()"/>');
        var scope = element.isolateScope();
        scope.unfollow();
        $rootScope.$digest();
        expect($scope.spyFollow).to.not.have.been.called;
        expect($scope.spyUnfollow).to.have.been.called;
        expect(scope.following).to.be.false;
      });
    });

    describe('When not following', function() {

      it('should not be able to unfollow', function() {
        $scope.following = false;
        $scope.spyFollow = sinon.spy();
        $scope.spyUnfollow = sinon.spy();
        $scope.user = {
          _id: '123'
        };
        followAPIMock.unfollow = sinon.spy();
        var element = compileDirective('<follow-button following="following", user="user", on-followed="spyFollow()", on-unfollowed="spyUnfollow()"/>');
        var scope = element.isolateScope();

        scope.unfollow();
        $rootScope.$digest();
        expect(followAPIMock.unfollow).to.not.have.been.called;
        expect($scope.spyFollow).to.not.have.been.called;
        expect($scope.spyUnfollow).to.not.have.been.called;
      });

      it('should follow the user', function() {
        $scope.following = false;
        $scope.spyFollow = sinon.spy();
        $scope.spyUnfollow = sinon.spy();
        $scope.user = {
          _id: '123'
        };

        followAPIMock.follow = function(_user) {
          expect(_user).to.deep.equal($scope.user);
          return $q.when(true);
        };

        var element = compileDirective('<follow-button following="false", user="user", on-followed="spyFollow()", on-unfollowed="spyUnfollow()"/>');
        var scope = element.isolateScope();
        scope.follow();
        $rootScope.$digest();
        expect($scope.spyFollow).to.have.been.called;
        expect($scope.spyUnfollow).to.not.have.been.called;
        expect(scope.following).to.be.true;
      });
    });
  });
});