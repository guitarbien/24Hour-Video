/**
 * Created by Peter Sbarski
 * Serverless Architectures on AWS
 * http://book.acloud.guru/
 * Last Updated: Feb 11, 2017
 */

'use strict';

var jwt = require('jsonwebtoken');
var jwksClient = require('jwks-rsa');

var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
}

exports.handler = function(event, context, callback){
    console.log('bien test', event);

    // get token
    if (!event.authorizationToken) {
        callback('Could not find authToken');
        return;
    }
    var token = event.authorizationToken.split(' ')[1];

    // find signed key
    var client = jwksClient({
        strictSsl: true, // Default value
        jwksUri: 'https://'+ process.env.DOMAIN + '/.well-known/jwks.json'
    });

    var signingKey;
    client.getSigningKey(process.env.KID, function(err, key) {
        signingKey = key.publicKey || key.rsaPublicKey;

        // verify token using the key
        jwt.verify(token, signingKey, function(err, decoded){
            if(err){
                console.log('Failed jwt verification: ', err, 'auth: ', token, ' secret:', signingKey);
                callback('Authorization Failed');
            } else {
                callback(null, generatePolicy('user', 'allow', event.methodArn));
            }
        })

    });

};
