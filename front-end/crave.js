var app = angular.module('craveApp', ['ngRoute', 'ngScrollSpy']);
var registerUserData;
var $scope, $location;


app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'front-end/pages/crave.html'
        })
        .when('/register', {
            templateUrl: 'front-end/pages/register.html',
            controller: 'RegisterController'
        })
});


window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

app.controller('HomeController', function ($scope, $anchorScroll, $location, $window) {
    $scope.load = function() {
        console.log($location.path())
        if($location.path() == '/'){
            $location.hash('welcome');
            $anchorScroll();
        }
    }
});

app.service("RegisterService", function($http){
    console.log("IN SERVICE")
    path='http://localhost:3000/api/register';
    this.registerUser = function (){
        console.log("SERVICE RUNNING")
        return $http.post(path, registerUserData);
    }
});

app.controller('RegisterController', function ($scope, RegisterService) {
    console.log("HERE")
    registerUserData = {}
    $scope.submit = function() {
        registerUserData = {
            "email": $scope.email,
            "password": $scope.password
        }
        console.log(registerUserData);
        RegisterService.registerUser().then(function(response){
            console.log("DATA", response.data);
        });
    }
});

app.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID) {

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});

app.controller('ScrollCtrl', function($scope, $location, anchorSmoothScroll) {
    
    $scope.gotoElement = function (eID){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(eID);
        console.log(eID);
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);
      
    };
  });

function navHamburger() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function directToRegister(){
    console.log("REGISTER");
    window.location.replace("#/register");
}