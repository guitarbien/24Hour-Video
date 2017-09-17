/**
 * Created by Peter Sbarski
 * Serverless Architectures on AWS
 * http://book.acloud.guru/
 * Last Updated: Feb 11, 2017
 */

'use strict';

var jwt = require('jsonwebtoken');
var request = require('request');
var jwksClient = require('jwks-rsa');

exports.handler = function(event, context, callback){
    // get token
    if (!event.authToken) {
        callback('Could not find authToken');
        return;
    }
    var token = event.authToken.split(' ')[1];

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
                var body = {
                    'id_token': token
                };

                var options = {
                    url: 'https://'+ process.env.DOMAIN + '/tokeninfo',
                    method: 'POST',
                    json: true,
                    headers : {'Access-Control-Allow-Origin' : '*'},
                    body: body
                };

                request(options, function(error, response, body){
                    if (!error && response.statusCode === 200) {
                        callback(null, body);
                        // callback(null, createSuccessResponse(body));
                    } else {
                        callback(error);
                        // callback(null, createErrorResponse(500, error));
                    }
                });
            }
        })

    });

};
