var userController = {
  data: {
    auth0Lock: null,
    config: null
  },
  uiElements: {
    loginButton: null,
    logoutButton: null,
    profileButton: null,
    profileNameLabel: null,
    profileImage: null
  },
  init: function(config) {
    var that = this;

    this.uiElements.loginButton = $('#auth0-login');
    this.uiElements.logoutButton = $('#auth0-logout');
    this.uiElements.profileButton = $('#user-profile');
    this.uiElements.profileNameLabel = $('#profilename');
    this.uiElements.profileImage = $('#profilepicture');

    this.data.config = config;

    var authParams = {
        language: "zh-tw",
        auth: {
          // redirectUrl: 'http://24hour-video.dev/website',
          responseType: 'id_token',
          params: {
              scope: 'openid profile email'
          }
        }
    };

    this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain, authParams);


    // Listen for the authenticated event and get profile
    this.data.auth0Lock.on("authenticated", function(authResult) {
      console.log(authResult);
      profile = JSON.stringify(authResult.idTokenPayload);

      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem("profile", profile);

      that.configureAuthenticatedRequests();
      that.showUserAuthenticationDetails(profile);
    });

    var idToken = localStorage.getItem('id_token');

    if (idToken) {
      this.configureAuthenticatedRequests();
      this.showUserAuthenticationDetails(localStorage.getItem('profile'));
    }

    this.wireEvents();
  },
  configureAuthenticatedRequests: function() {
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        xhr.setRequestHeader('authorization', 'Bearer ' + localStorage.getItem('id_token'));
      }
    });
  },
  showUserAuthenticationDetails: function(profile) {
    var showAuthenticationElements = !!profile;

    if (showAuthenticationElements) {
      this.uiElements.profileNameLabel.text(profile.nickname);
      this.uiElements.profileImage.attr('src', profile.picture);
    }

    this.uiElements.loginButton.toggle(!showAuthenticationElements);
    this.uiElements.logoutButton.toggle(showAuthenticationElements);
    this.uiElements.profileButton.toggle(showAuthenticationElements);
  },
  wireEvents: function() {
    var that = this;

    this.uiElements.loginButton.click(function(e) {
      that.data.auth0Lock.show();

      // that.data.auth0Lock.show(params, function(err, profile, token) {
      //   console.log('1');
      //   console.log(err);
      //   console.log(profile);
      //   console.log(token);
      //   if (err) {
      //     // Error callback
      //     alert('There was an error');
      //   } else {
      //     // Save the JWT token.
      //     localStorage.setItem('id_token', token);
      //     that.configureAuthenticatedRequests();
      //     that.showUserAuthenticationDetails(profile);
      //   }
      // });
    });

    this.uiElements.logoutButton.click(function(e) {
      localStorage.removeItem('id_token');

      that.uiElements.logoutButton.hide();
      that.uiElements.profileButton.hide();
      that.uiElements.loginButton.show();
    });

    this.uiElements.profileButton.click(function(e) {
      var url = that.data.config.apiBaseUrl + '/user-profile';

      $.get(url, function(data, status) {
        $('#user-profile-raw-json').text(JSON.stringify(data, null, 2));
        $('#user-profile-modal').modal();
      })
    });
  }
}
