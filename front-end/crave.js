var app = angular.module('craveApp', ['ngRoute', 'ngScrollSpy', 'ngSanitize']);
var registerUserData;
var loginUserData;
var tokenData;
var yelpQuery;
var uploadData; 
var allCards;
var locations;

var $scope, $location;
var cardObject;
var userLocation;

var postData;
var faveObject;
var userID;
var updatedProfile;
var profilePicData;
var likePostObject;
var checkingUsername;

var followUserID;
var deletePostObj;

var lat;
var long;
var distances = [];


app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            resolve:{
                "check": function($location){
                    if(localStorage.getItem("token")){
                        $location.path('/feed');
                    }
                }
            },
            templateUrl: 'front-end/pages/crave.html'
        })
        .when('/register', {
            templateUrl: 'front-end/pages/register.html',
            controller: 'RegisterController'
        })
        .when('/login', {
            templateUrl: 'front-end/pages/login.html',
            controller: 'LoginController'
        })
        .when('/search', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/search.html',
        })
        .when('/feed', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/feed.html',
        })

        .when('/discover', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/discover.html',
        })

        .when('/favorites', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/favorites.html',
        })

        .when('/profile', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/profile.html',
        })

        .when('/crave-search', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/crave-search.html',
        })

        .when('/upload', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/upload.html',
        })

        .when('/profile/:profileid', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/view-profile.html',
        })
});




app.controller('HomeController', function ($scope, $anchorScroll, $location, $window) {
    $scope.load = function() {
        console.log($location.path())
        // checkHttps();
        if($location.path() == '/'){
            $location.hash('welcome');
            $anchorScroll();
        }
    }
});

app.service("RegisterService", function($http){
    console.log("IN REGISTER SERVICE")
    this.path='http://localhost:3000/api/register';
    this.registerUser = function (){
        return $http.post(this.path, registerUserData);
    }

    this.checkNamePath='http://localhost:3000/api/check-username';
    this.checkUsername = function (){
        // console.log(checkingUsername)
        return $http.post(this.checkNamePath, checkingUsername);
    }
});

app.controller('RegisterController', function ($scope, RegisterService, $location) {
    registerUserData = {}
    $scope.register = function(form) {
        checkingUsername = {
            "username":$scope.username
        }
        RegisterService.checkUsername().then(function(response){
            console.log(response.data);
            if(response.data == false){
                document.getElementById('username-taken').style.display='block';
            }
            else if(response.data == true){
                if(form.$valid){
                    console.log("REGISTER!!!")
                    registerUserData = {
                        "fullname": $scope.fullname,
                        "username": $scope.username,
                        // "email": $scope.email,
                        "password": $scope.password,
                        "post_count":0,
                        "follower_count":0,
                        "profile_pic": 'profile.jpg'
                    }
                    console.log(registerUserData);
                    RegisterService.registerUser().then(function(response){
                        console.log("DATA", response.data);
                        $scope.directToLogin();
                    });
                }
                else{
                    console.log("NOT VALID");
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
            }

        });
    }

    $scope.directToLogin = function(){
        console.log("D2L");
        $location.path('/login');
    }
});

app.service("LoginService", function($http){
    console.log("IN LOGIN SERVICE")
    this.path='http://localhost:3000/api/login';
    this.loginUser = function (){
        console.log("LOGIN RUNNING")
        return $http.post(this.path, loginUserData);
    }
});

app.controller('LoginController', function ($scope, LoginService, $location, RegisterService) {
    console.log("IN LOGIN CTRL")
    loginUserData = {}
    $scope.login = function(form) {
        checkingUsername = {
            "username":$scope.username
        }
        RegisterService.checkUsername().then(function(response){
            console.log("RDATA",response.data);
            if(response.data == false){
                if(form.$valid){
                    loginUserData = {
                        "username": $scope.username,
                        "password": $scope.password
                    }
                    console.log(loginUserData);
                    LoginService.loginUser().then(function(response){
                        console.log("RES",response.data);
                        console.log("RESTOK",response.data.token);
                        if(response.data == "invalid username" || response.data == 'invalid password'){
                            console.log("INVALID LO")
                            document.getElementById('invalid-login').classList.remove('ng-hide');
                            document.getElementById('invalid-login').classList.add('ng-show');
                        }
                        else{
                            localStorage.setItem("token", response.data.token);
                            $location.path('/feed')
                            console.log("OK LOG ME IN")
                        }
                    });
                }
                else{
                    console.log("NOT VALID");
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
            }
            else if(response.data == true){
                console.log($scope.username)
                if($scope.username == undefined){
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
                else{
                    document.getElementById('invalid-username').classList.remove('ng-hide');
                    document.getElementById('invalid-username').classList.add('ng-show');
                }
                
            }

        });
    }

    $scope.directToRegister = function(){
        console.log("D2R");
        $location.path('/register');
    }
});

app.service("DashboardService", function($http){
    console.log("IN DASH SERVICE")
    tokenData = {};
    tokenData = {
        "token": localStorage.getItem('token')
    }
    this.path='http://localhost:3000/api/getUser';
    this.getUser = function (){
        return $http.post(this.path, tokenData);
    }
});

app.controller('DashboardController', function($scope, DashboardService) {
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.imagePreviewUrl = response.data.profile_pic;
    });
});


app.service('DiscoverService', function($http){
    this.path='http://localhost:3000/yelp/crave-search';
    this.sendYelpData = function (){
        console.log('in sendyelp')
        return $http.post(this.path, yelpQuery);
    }

    this.getUserLocation = function(){
        console.log("LAT", lat);
        console.log("LONG", long);
        return $http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyDnScNtIJXrverfSC7o51y1LXR2q0Dlz58`)
    }


    this.getLocationCoords = function(userLocation){
        console.log("CONVERT: ", userLocation);
        return $http.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${userLocation}&key=AIzaSyDnScNtIJXrverfSC7o51y1LXR2q0Dlz58`)
    }
});


app.controller('DiscoverController', function($scope, DiscoverService, DashboardService){
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.imagePreviewUrl = response.data.profile_pic;

    });

    yelpQuery = {};
    $scope.price = 0;

    $scope.$watch('price', function (numberVal) {
        console.log("SLIDER", $scope.price);
        if (typeof numberVal !== 'undefined') {
            if(numberVal == 0){
                $scope.priceVal = "Any Price"
            }
            if(numberVal == 1){
                $scope.priceVal = "$";
            }
            else if(numberVal == 2){
                $scope.priceVal = "$$";
            }
            else if(numberVal == 3){
                $scope.priceVal = "$$$";
            }
            else if(numberVal == 4){
                $scope.priceVal = "$$$$";
            }
        }
    });

    $scope.discover = function(){
        console.log("DISCOVER TRIGGERED");
        if($scope.price == 0){
            yelpQuery = {
                "term": $scope.term,
                "location": $scope.location,
                "limit": 50
            }
        }
        else{
            yelpQuery = {
                "term": $scope.term,
                "price": $scope.price,
                "location": $scope.location,
                "limit": 50
            }
        }
        console.log("YELP QUERY", yelpQuery);
        DiscoverService.sendYelpData().then(function(response){
            console.log("RESPONSE", response.data);
            if(response.data.total == 0){
                console.log("NO RESULTS")
                document.getElementById('invalid-search').style.display='block';
            }
            else{
                cardObject = response.data;
                userLocation = $scope.location;
                DiscoverService.getLocationCoords(userLocation).then(function(response){
                    console.log("RESP: ", response.data.results[0].geometry.location);
                    lat = response.data.results[0].geometry.location.lat;
                    lon = response.data.results[0].geometry.location.lng;
                    for(i=0;i<cardObject.businesses.length; i++){
                        var f = new google.maps.LatLng(lat, lon);
                        var t = new google.maps.LatLng(cardObject.businesses[i].coordinates.latitude, cardObject.businesses[i].coordinates.longitude);
                        var service = new google.maps.DistanceMatrixService();
                        service.getDistanceMatrix(
                            {
                                origins: [f],
                                destinations: [t],
                                travelMode: 'DRIVING',
                                unitSystem: google.maps.UnitSystem.IMPERIAL
                            }, function(response, status){
                                if (status == 'OK') {
                                    console.log("RES:!", response.rows[0].elements[0].distance.text);
                                    distances.push(response.rows[0].elements[0].distance.text);
                                    if(distances.length == cardObject.businesses.length){
                                        console.log("DONEZOSSSS")
                                        directToSearch();
                                    }
                                    else{
                                        // console.log("NOT DONE: ", distances.length)
                                    }
                                }
                            });
                    }
                });


            }
        });
    }

    $scope.getGeoLocation = function(){
        console.log("GET GEOLOCATION")
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                $scope.$apply(function(){
                    $scope.position = position;
                    console.log("POSITION: ", $scope.position);
                    lat = $scope.position.coords.latitude;
                    long = $scope.position.coords.longitude;

                    DiscoverService.getUserLocation().then(function(response){
                        console.log(response.data)
                        $scope.location = response.data.results[0].formatted_address;
                    });
                });
            });
        }
    }
})

app.service('FavoriteService', function ($http){
    this.postPath='http://localhost:3000/api/add-favorite';
    this.addFavorite = function(){
        console.log("ADDING FAVE...")
        return $http.post(this.postPath, faveObject);
    }

    this.getPath='http://localhost:3000/api/get-favorites';
    this.getFavorites = function(){
        console.log("GETTING FAVES...")
        return $http.post(this.getPath, userID);
    }

    this.removePath='http://localhost:3000/api/remove-favorite';
    this.removeFavorite = function(faveID){
        console.log("REMOVING FAVORITE...", faveID);
        return $http.post(this.removePath, faveID);
    }

    this.checkFavePath='http://localhost:3000/api/check-favorite';
    this.checkFavorite = function(){
        console.log("CHECKING FAVORITE...", faveObject);
        return $http.post(this.checkFavePath, faveObject);
    }

});

app.controller('FaveController', function($scope, DashboardService, FavoriteService, $route){
    DashboardService.getUser().then(function(response){
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.imagePreviewUrl = response.data.profile_pic;

        userID = {
            "id":response.data._id
        }
        FavoriteService.getFavorites().then(function(response){
            console.log("GETFAVESRESPONSE", response.data);
            $scope.faves = response.data.slice().reverse();
        });
    });

    $scope.removeFavorite = function(cardID){
        console.log("REMOVE CARD:" , $scope.faves[cardID].id);
        $scope.faves[cardID].index = cardID;
        FavoriteService.removeFavorite($scope.faves[cardID]).then(function(response){
            console.log("REMOVERES", response.data);
            $route.reload();
        });
    };
    
});

app.controller('CardController', function($scope, DashboardService, FavoriteService){
    var cardIndex = 0;
    console.log("CARD CTRL")
    DashboardService.getUser().then(function(response){
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.userID = response.data._id;
        $scope.imagePreviewUrl = response.data.profile_pic;

    });

    if(cardObject == undefined){
        directToDiscover();
        $scope.empty = true;
    }
    else {
        $scope.cards = cardObject.businesses;
        $scope.distances = distances;
        console.log("LOCATION: ", userLocation);
        for(i=0;i<$scope.distances.length;i++){
            $scope.cards[i].miles = $scope.distances[i];
        }
    }

    angular.element(document).ready(function(){
        if(!$scope.empty){
            console.log("NOT EMPTY")
            allCards = document.getElementsByClassName('card');
            console.log(allCards.length);
            initCards()
        }
    });
     
    function initCards(){
        console.log("CARD INDEX", cardIndex);
        var direction;
        for(var i = 0; i < allCards.length; i++){
            allCards[i].style.zIndex = allCards.length-i;
            var hammer = new Hammer(allCards[i]);
            hammer.on('pressup', function(event){
                if(event.type=='pressup'){
                    var yelpURL = $scope.cards[cardIndex].url;
                    window.open(yelpURL, '_blank').focus(); 
                }
            })

            hammer.on('panleft panright', function(event){
                if(event.type == 'panleft'){
                    direction = 'left';
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(-20deg)`;
                    event.target.style.background = '#DF6857';
                }
                else{
                    direction = 'right'
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(20deg)`;
                    event.target.style.background = '#77D9B5';
                }
            });
        
            hammer.on('panend', function(event){
                if(event.distance < 230){
                    event.target.style.transform = '';
                    event.target.style.background = '#ebebeb';
                }
                else{
                    if(direction == 'right'){
                        $scope.addToFavorites(cardIndex);
                    }
                    cardIndex++;
                    event.target.style.opacity = '0';
                    event.target.style.transition = '0.75s ease-out';
                    setTimeout(function(){event.target.style.display = 'none'}, 750);
                    console.log("CARD INDEX", cardIndex);
                }
            });

        }

    }

    $scope.yes = function(){
        // console.log("YES");
        // console.log("ALLCARDS", allCards)
        console.log("CARD", allCards[cardIndex]);
        allCards[cardIndex].style.transform = `translate(250px) rotate(20deg)`;
        allCards[cardIndex].style.background = '#77D9B5';
        allCards[cardIndex].style.opacity = '0';
        allCards[cardIndex].style.transition = '0.75s ease-out';
        $scope.addToFavorites(cardIndex);
        setTimeout(function(){
            allCards[cardIndex].style.display = 'none'
            cardIndex++;
        }, 750);
    }

    $scope.no = function(){
        console.log("CARD", allCards[cardIndex]);
        allCards[cardIndex].style.transform = `translate(-250px) rotate(-20deg)`;
        allCards[cardIndex].style.background = '#DF6857';
        allCards[cardIndex].style.opacity = '0';
        allCards[cardIndex].style.transition = '0.75s ease-out';
        setTimeout(function(){
            allCards[cardIndex].style.display = 'none'
            cardIndex++;
            console.log("NEW INDEX", cardIndex);
        }, 750);
    }
    
    $scope.addToFavorites = function(cardIndex){
        console.log("ADD TO FAVE", $scope.cards[cardIndex]);
        faveObject = $scope.cards[cardIndex];
        faveObject.userID = $scope.userID;

        FavoriteService.checkFavorite().then(function(response){
            console.log("CHECK F", response.data)
            if(!response.data == true){
                FavoriteService.addFavorite();
            }
        });

    }
});

app.service('UploadService', function($http){
    this.path='http://localhost:3000/api/upload';
    this.uploadPost = function(){
        return $http.post(this.path, postData, {
            transformRequest: angular.identity,
            headers:{
                'Content-Type': undefined
            }
        });
    }


});

app.controller('UploadController', function($scope, UploadService, DashboardService){
    $scope.filterBtns = document.getElementsByClassName('filter-btn');
    for (var i = 0; i < $scope.filterBtns.length; i++) {
        $scope.filterBtns[i].disabled=true;
    }

    DashboardService.getUser().then(function(response){
        console.log(response.data);
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.name = response.data.fullname.split(' ').slice(0, -1).join(' ');
        $scope.profilePicUrl = response.data.profile_pic;
        $scope.id = response.data._id;

    });
    console.log("IN UPLOAD CTRL")
    $scope.imagePreviewUrl = '/front-end/resources/images/no-image.jpg';
    $scope.onImagePicked = function(imgFile){
        for (var i = 0; i < $scope.filterBtns.length; i++) {
            $scope.filterBtns[i].disabled=false;
            $scope.filterBtns[i].style.opacity=1;
            $scope.filterBtns[i].style.cursor = "pointer";
        }
        console.log("IMGFILE:" ,imgFile)
        console.log("IMAGE PICKED!", imgFile.files[0]);
        $scope.postImage = imgFile.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            console.log("On load")
            $scope.$apply(function() {
              $scope.imagePreviewUrl = reader.result;
            });
        }
        reader.readAsDataURL(imgFile.files[0]);
    }
    
    $scope.filter1 = function(){
        console.log("CLICK FILTER 1!")
        Caman("#image-preview", function () {
            console.log("in caman")        
            this.revert();
            this.render(function(){
                $scope.editedImg = this.toBase64();
                var file = dataURLtoFile($scope.editedImg, $scope.postImage.name);
                console.log(file);
                $scope.postImage = file;
            });
        });
    }
    $scope.filter2 = function(){
        console.log("CLICK FILTER 2!")
        Caman("#image-preview", function () {
            console.log("in caman")        
            this.revert();
            this.herMajesty().render(function(){
                $scope.editedImg = this.toBase64();
                var file = dataURLtoFile($scope.editedImg, $scope.postImage.name);
                console.log(file);
                $scope.postImage = file;
            });
        });
    }

    $scope.filter3 = function(){
        console.log("CLICK FILTER 3!")
        Caman("#image-preview", function () {
            console.log("in caman")        
            this.revert();
            this.jarques().render(function(){
                $scope.editedImg = this.toBase64();
                var file = dataURLtoFile($scope.editedImg, $scope.postImage.name);
                console.log(file);
                $scope.postImage = file;
            });
        });
    }

    $scope.filter4 = function(){
        console.log("CLICK FILTER 3!")
        Caman("#image-preview", function () {
            console.log("in caman")        
            this.revert();
            this.pinhole().render(function(){
                $scope.editedImg = this.toBase64();
                var file = dataURLtoFile($scope.editedImg, $scope.postImage.name);
                console.log(file);
                $scope.postImage = file;
            });
        });
    }
    
    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    $scope.upload = function(){
        console.log("UPLOAD CLICKED")
        // console.log("CAPTION",$scope.postCaption);
        // console.log("LOCATION",$scope.postLocation);
        // console.log("IMAGE",$scope.postImage);
        postData = new FormData();
        postData.append('userID', $scope.id)
        postData.append('userImage', $scope.profilePicUrl);
        postData.append('username', $scope.username);
        postData.append('caption', $scope.postCaption);
        postData.append('location', $scope.postLocation);
        postData.append('image', $scope.postImage);
        postData.append('title', $scope.postTitle);

        console.log("PD", postData);
        UploadService.uploadPost().then(function(response){
            console.log("RESPONSE", response.data);
            directToProfile();
        });
    }
});

app.service('FeedService', function($http){
    this.getAllPostsPath='http://localhost:3000/api/get-all-posts';
    this.getAllPosts = function(){
        return $http.post(this.getAllPostsPath);
    }

    this.getMyPostsPath='http://localhost:3000/api/get-my-posts';
    this.getMyPosts = function(){
        return $http.post(this.getMyPostsPath, userID);
    }

    this.likePostPath='http://localhost:3000/api/like-post';
    this.likePost = function(){
        console.log("LIKEPOSTOBJECT", likePostObject);
        return $http.post(this.likePostPath, likePostObject);
    }
});

app.controller('FeedController', function ($scope, DashboardService, FeedService){
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.name = response.data.fullname.split(' ').slice(0, -1).join(' ');
        $scope.imagePreviewUrl = response.data.profile_pic;
        $scope.id = response.data._id;

        userID = {
            "id":response.data._id
        }
    
        // FeedService.getAllPosts().then(function(response){
        //     $scope.posts = response.data.slice().reverse();
        //     console.log("GET ALL POSTS", $scope.posts);
        // })

        FeedService.getMyPosts().then(function(response){
            $scope.posts = response.data.slice().reverse();
            console.log("GET ALL POSTS", $scope.posts);
        })
    });

    var today = new Date()
    var curHr = today.getHours()
    if (curHr < 12) {
        $scope.greeting = "Good morning"
    } else if (curHr < 18) {
        $scope.greeting = "Good afternoon"
    } else {
        $scope.greeting = "Good evening"
    }

    $scope.clickHeart = function(postID){
        likePostObject = {
            userID:$scope.id,
            postID:postID,
        }

        FeedService.likePost().then(function(response){
            console.log("LIKED/UNLIKE POST", response.data);
            FeedService.getMyPosts().then(function(response){
                $scope.posts = response.data.slice().reverse();
                console.log("GET ALL POSTS", $scope.posts);
            });
        });
    }
});

app.service('ProfileService', function($http) {
    this.updateInfoPath='http://localhost:3000/api/update-profile';
    this.updateProfile = function(){
        return $http.post(this.updateInfoPath, updatedProfile);
    }

    this.updatePicPath='http://localhost:3000/api/update-profile-pic';
    this.updateProfilePic = function(){
        console.log("IN PROFILE SERVICE")
        // return $http.post(this.updatePicPath, profilePicData);
        return $http.post(this.updatePicPath, profilePicData, {
            transformRequest: angular.identity,
            headers:{
                'Content-Type': undefined
            }
        });
    }

    this.getUserPostsPath='http://localhost:3000/api/get-user-posts';
    this.getUserPosts = function(){
        return $http.post(this.getUserPostsPath, userID);
    }

    this.deletePostPath='http://localhost:3000/api/delete-post';
    this.deletePost = function(){
        return $http.post(this.deletePostPath, deletePostObj);
    }

});

app.controller('ProfileController', function ($scope, DashboardService, ProfileService, $timeout){
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.name = response.data.fullname;
        $scope.id = response.data._id;
        $scope.location = response.data.location;
        $scope.bio = response.data.bio;
        $scope.imagePreviewUrl = response.data.profile_pic;

        userID = {
            "id":response.data._id
        }
    
        ProfileService.getUserPosts().then(function(response){
            console.log("GET USER POSTS", response.data);
            $scope.posts = response.data.slice().reverse();
        })
    });

    var locationField;
    var bioField;
    // var profilePic;
    var isEditing = false;
    var modal;

    $scope.editProfile = function(){
        isEditing = true;
        console.log("EDIT PROFILE CLICK!")
        locationField = document.getElementById('profile-location');
        bioField = document.getElementById('profile-bio');

        locationField.removeAttribute('readonly')
        bioField.removeAttribute('readonly')
        locationField.classList.add('location-edit');
        bioField.classList.add('bio-edit');
        locationField.addEventListener('blur', function(){
            isEditing = false;
            locationField.setAttribute('readonly', "readonly");
            locationField.classList.remove('location-edit');
            $scope.newLocation = locationField.value;
            $scope.saveProfile();
        });
        bioField.addEventListener('blur', function(){
            isEditing = false;
            bioField.setAttribute('readonly', "readonly");
            bioField.classList.remove('bio-edit');
            $scope.newBio = bioField.value;
            $scope.saveProfile();
        });
    }

    $scope.cancelEdit = function(event){
        if(!event.target.id && isEditing){
            locationField.setAttribute('readonly', "readonly");
            locationField.classList.remove('location-edit');
            bioField.setAttribute('readonly', "readonly");
            bioField.classList.remove('bio-edit');
        }
    }
    
    $scope.editProfilePic = function(){
        $timeout(function() {
            document.getElementById('propic-file').click()
        }, 0);  
    }

    $scope.onImagePicked = function(imgFile){
        console.log("IMGFILE:" ,imgFile)
        console.log("IMAGE PICKED!", imgFile.files[0]);
        $scope.newProfilePic = imgFile.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            console.log("On load")
            $scope.$apply(function() {
                console.log($scope.imagePreviewUrl);
            //   $scope.imagePreviewUrl = reader.result;
              $scope.saveNewProfilePic();
            });
        }
        reader.readAsDataURL(imgFile.files[0]);

       
    }

    $scope.saveNewProfilePic = function(){
        console.log("UPLOAD NEW PROFILE PIC")
        profilePicData = new FormData();
        profilePicData.append('image', $scope.newProfilePic)
        profilePicData.append('id', $scope.id);
        ProfileService.updateProfilePic().then(function(response){
            console.log("PPIC UPLOADED", response.data);
            $scope.imagePreviewUrl = response.data.profile_pic;
        });
    }


    $scope.saveProfile = function(){
        updatedProfile = {
            "id": $scope.id,
            "location": $scope.newLocation,
            "bio": $scope.newBio
        }
        ProfileService.updateProfile().then(function(response){
            console.log("PROFILE SERVICE RESPONSE", response.data)
        });
    }

    $scope.viewPost = function(postIndex){
        console.log("VIEW POST: ", postIndex);
        $scope.viewPostID = $scope.posts[postIndex]._id;
        $scope.viewImage = $scope.posts[postIndex].image;
        $scope.viewAvatar = $scope.imagePreviewUrl;
        $scope.viewUsername = $scope.posts[postIndex].username;
        $scope.viewTitle = $scope.posts[postIndex].title;
        $scope.viewLocation = $scope.posts[postIndex].location;
        $scope.viewCaption = $scope.posts[postIndex].caption;
        $scope.viewLikes = $scope.posts[postIndex].likes.length;
        modal = document.getElementById('myModal');

        // Get the button that opens the modal
        var btn = document.getElementById("myBtn");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        
    }

    $scope.deletePost = function(postID){
        console.log("DELETE POST #: ", postID);
        deletePostObj = {
            postID: postID,
            userID: $scope.id
        }
        ProfileService.deletePost().then(function(response){
            console.log("PROFILES", response.data);
            DashboardService.getUser().then(function(response){
                $scope.post_count = response.data.post_count;
                ProfileService.getUserPosts().then(function(response){
                    modal.style.display='none';
                    console.log("GET USER POSTS", response.data);
                    $scope.posts = response.data.slice().reverse();
                });
            });
        });
    }
});

app.service('ViewProfileService', function($http){

    this.getProfilePath='http://localhost:3000/api/get-profile';
    this.getProfile= function (){
        console.log("PROFILEID", userID)
        return $http.post(this.getProfilePath, userID);
    }
});

app.controller("ViewProfileController", function($scope, DashboardService, ProfileService, ViewProfileService, SearchService){
    DashboardService.getUser().then(function(response){
        var pathArr = window.location.href.split('/');
        var profileID = pathArr[pathArr.length-1];
        userID = {
            "id":profileID
        }

        if(response.data._id == profileID){
            directToProfile();
        }
        else{
            $scope.username = response.data.username;
            $scope.id = response.data._id;
            $scope.post_count = response.data.post_count;
            $scope.follower_count = response.data.follower_count;
            $scope.imagePreviewUrl = response.data.profile_pic;
            $scope.following = response.data.following;
    
            $scope.showFollowStatus();

            ViewProfileService.getProfile().then(function(response){
                $scope.viewname = response.data.fullname;
                $scope.viewusername = response.data.username;
                $scope.viewpost_count = response.data.post_count;
                $scope.viewfollower_count = response.data.follower_count;
                $scope.viewlocation = response.data.location;
                $scope.viewbio = response.data.bio;
                $scope.viewimagePreviewUrl = response.data.profile_pic;
            })
        
            ProfileService.getUserPosts().then(function(response){
                console.log("GET USER POSTS", response.data);
                $scope.posts = response.data.slice().reverse();
            })
        }

    });

    $scope.followUser = function(){
        console.log("FOLLOW: ", userID.id);
        followUserID = {
            userID: $scope.id,
            followID: userID.id
        }
        console.log("OBJ", followUserID);
        SearchService.followUser().then(function(response){
            DashboardService.getUser().then(function(response){
                $scope.following = response.data.following;
                ViewProfileService.getProfile().then(function(response){
                    $scope.viewfollower_count = response.data.follower_count;
                    $scope.showFollowStatus();
                });
            });
        });
    }

    $scope.showFollowStatus = function(){
        if($scope.following.includes(userID.id)){
            $scope.followStatus = "Unfollow";
        }
        else{
            $scope.followStatus = "Follow";
        }
    }
})

app.service('SearchService', function($http){
    this.getAllUsersPath='http://localhost:3000/api/get-all-users';
    this.getAllUsers = function(){
        return $http.post(this.getAllUsersPath);
    }

    this.followUserPath='http://localhost:3000/api/follow-user';
    this.followUser = function(){
        console.log(followUserID);
        return $http.post(this.followUserPath, followUserID);
    }
})

app.controller('SearchController', function($scope, DashboardService, SearchService){
    DashboardService.getUser().then(function(response){
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.imagePreviewUrl = response.data.profile_pic;
        $scope.id = response.data._id;
        $scope.following = response.data.following;

        $scope.refreshUsers();
    });

    $scope.refreshUsers = function(){
        SearchService.getAllUsers().then(function(response){
            console.log("GETALLUSERS", response.data);
            $scope.users = response.data;
            for(i=0;i<$scope.users.length;i++){
                if($scope.users[i]._id == $scope.id){
                    console.log("MATCH ME", i);
                    var myID = i;
                    angular.element(document).ready(function(){
                        var mybtn = document.getElementsByClassName('user-follow');
                        mybtn[myID].disabled = true;
                        mybtn[myID].classList.add("no-follow");
                    });
                }
                if($scope.following.includes($scope.users[i]._id)){
                    console.log("FOUND MATCH:", $scope.users[i].fullname);
                    $scope.users[i].status = "Unfollow";
                }
                else{
                    $scope.users[i].status = "Follow";
                }
            }
        });
    }

    $scope.followUser = function(followID){
        console.log("FOLLOW: ", followID);
        followUserID = {
            userID: $scope.id,
            followID: followID
        }
        SearchService.followUser().then(function(response){
            DashboardService.getUser().then(function(response){
                $scope.following = response.data.following;
                $scope.refreshUsers();
            })
        });
    }
})

///////////
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
    $scope.directToLogin = function(){
        console.log("D2L");
        $location.path('/login');
    }
    $scope.directToRegister = function(){
        console.log("D2R");
        $location.path('/register');
    }

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

function directToDashboard(){
    console.log("DASH")
    window.location.replace("#/search");
    // window.location.reload();
}

function directToFeed(){
    console.log("FEED")
    window.location.replace("#/feed");
}

function directToDiscover(){
    console.log("DISCOVER")
    window.location.replace("#/discover");
}

function directToSearch(){
    window.location.replace("#/crave-search");
}

function directToFavorites(){
    console.log("FAVS")
    window.location.replace("#/favorites");
}

function directToUpload(){
    console.log("UPLOAD")
    window.location.replace("#/upload");
}

function directToProfile(){
    console.log("PROFILE")
    window.location.replace("#/profile");
}

function directToLogout(){
    console.log("LOGOUT");
    localStorage.clear();
    window.location.replace("#/login");
    window.location.reload();
}

function getLocation(){
    console.log("IN GETLOCATION")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            console.log("LAT",position.coords.latitude)
            console.log("LONG",position.coords.longitude); 
            return position;
        });
    }
}

function showPosition(position) {
    console.log("LAT",position.coords.latitude)
    console.log("LONG",position.coords.longitude); 
}



function checkHttps(){
    console.log("CHECKING");
    if (window.location.protocol == "http:") {
        var restOfUrl = window.location.href.substr(5);
        window.location = "https:" + restOfUrl;
    }
}

function profilePicLoaded(){
    console.log("PIC LOADED")
    var sidebarAvatar = document.getElementById('profile-pic');
    sidebarAvatar.style.visibility = 'visible';
}

function avatarLoaded(){
    var avatar = document.getElementById('avatar');
    avatar.style.visibility = 'visible';
}

function distance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    console.log("DISTANCE: ", d);
  }
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}

// function callGoogle() {
//     console.log("HELLO GOOGLE")
//     var f = new google.maps.LatLng(40.7662269, -111.8908886);
//     var t = new google.maps.LatLng(40.758989, -111.874474);
//     var service = new google.maps.DistanceMatrixService();
//     service.getDistanceMatrix(
//         {
//             origins: [f],
//             destinations: [t],
//             travelMode: 'DRIVING',
//             unitSystem: google.maps.UnitSystem.IMPERIAL
//         }, function(response, status){
//             if (status == 'OK') {
//                 console.log("RES:!", response.rows[0].elements[0].distance.text);
//                 return response.rows[0].elements[0].distance.text;
//             }
//         });

//     function callback(response, status) {
//         if (status == 'OK') {
//             console.log("RES:!", response.rows[0].elements[0].distance.text);
//             return response.rows[0].elements[0].distance.text;
//         }
//     }
// }

  

