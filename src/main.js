// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue';
import App from './App';
import router from './router';

import AWSAppSyncClient from 'aws-appsync';
import Amplify, { Auth } from 'aws-amplify';
import Q from 'q';
import VueApollo from 'vue-apollo';
import appSyncConfig from './AppSync';



function getCredentials() {

  console.log('Fetching token');

  var url = 'http://session.smarttech-local.com:8887/api/v1/auth/fetchAwsIdentity';

  var params = {
    method: 'GET',
    headers: {
      'access-token': 'AUSIcoQJFNLsgrMwqwtI02Ck0kr762bm37k6g4L05FQCB8gqWRj65pqkkXpsBliYh8tCYyivAl1GS3E6ip7aOh_vSidpTkU'
    }
  };

  return fetch(url, params)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {

          console.log(data);

          var logins = {};

          logins['cognito-identity.amazonaws.com'] = data.token;

          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: data.poolId,
            IdentityId: data.id,
            Logins: logins
          }, {region: data.region});

          AWS.config.credentials.expired = true;
        });
}

getCredentials()
  .then(function() {

    const client = new AWSAppSyncClient({

      url: appSyncConfig.graphqlEndpoint,
      region: appSyncConfig.region,
      auth: {
        type: 'AWS_IAM',
        credentials: Auth.currentCredentials()
      }
    }, {

      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network'
        }
      }
    });

    const appsyncProvider = new VueApollo({
      defaultClient: client
    });

    Vue.config.productionTip = false;
    Vue.use(VueApollo);

    new Vue({// eslint-disable-line no-new
      el: '#app',
      router,
      components: { App },
      provide: appsyncProvider.provide(),
      template: '<App/>'
    });
  });

