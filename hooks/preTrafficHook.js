'use strict';

const aws = require('aws-sdk');
const codedeploy = new aws.CodeDeploy({apiVersion: '2014-10-06'});
const lambda = new aws.Lambda();
exports.handler = (event, context, callback) => {

    console.log("Entering PreTraffic Hook! v2:37");
    //console.log(JSON.stringify(event));

    var lambda_versionToTest = process.env.NewVersion;
    console.log("PreTraffic Hook testing new function version: " + lambda_versionToTest);

    //Read the DeploymentId from the event payload.
    var deploymentId = event.DeploymentId;
    console.log("PreTraffic Hook var:deploymentId: " + deploymentId);

    //Read the LifecycleEventHookExecutionId from the event payload
    var lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    console.log("PreTraffic Hook var:lifecycleEventHookExecutionId: " + lifecycleEventHookExecutionId);

	/*
		[Perform validation or prewarming steps here]
	*/

	var lambdaParams = {
		FunctionName: lambda_versionToTest,
		InvocationType: "RequestResponse",
		Payload: JSON.stringify({
		      "body": "eyJ0ZXN0IjoiYm9keSJ9",
              "resource": "/{proxy+}",
              "path": "greeting",
              "httpMethod": "GET",
              "isBase64Encoded": true,
              "queryStringParameters": {
                "foo": "bar"
              },
              "multiValueQueryStringParameters": {
                "foo": [
                  "bar"
                ]
              },
              "pathParameters": {
                "proxy": "greeting"
              },
              "stageVariables": {
                "baz": "qux"
              },
              "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, sdch",
                "Accept-Language": "en-US,en;q=0.8",
                "Cache-Control": "max-age=0",
                "CloudFront-Forwarded-Proto": "https",
                "CloudFront-Is-Desktop-Viewer": "true",
                "CloudFront-Is-Mobile-Viewer": "false",
                "CloudFront-Is-SmartTV-Viewer": "false",
                "CloudFront-Is-Tablet-Viewer": "false",
                "CloudFront-Viewer-Country": "US",
                "Host": "1234567890.execute-api.us-west-2.amazonaws.com",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Custom User Agent String",
                "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
                "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
                "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
                "X-Forwarded-Port": "443",
                "X-Forwarded-Proto": "https"
              },
              "multiValueHeaders": {
                "Accept": [
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                ],
                "Accept-Encoding": [
                  "gzip, deflate, sdch"
                ],
                "Accept-Language": [
                  "en-US,en;q=0.8"
                ],
                "Cache-Control": [
                  "max-age=0"
                ],
                "CloudFront-Forwarded-Proto": [
                  "https"
                ],
                "CloudFront-Is-Desktop-Viewer": [
                  "true"
                ],
                "CloudFront-Is-Mobile-Viewer": [
                  "false"
                ],
                "CloudFront-Is-SmartTV-Viewer": [
                  "false"
                ],
                "CloudFront-Is-Tablet-Viewer": [
                  "false"
                ],
                "CloudFront-Viewer-Country": [
                  "US"
                ],
                "Host": [
                  "0123456789.execute-api.us-west-2.amazonaws.com"
                ],
                "Upgrade-Insecure-Requests": [
                  "1"
                ],
                "User-Agent": [
                  "Custom User Agent String"
                ],
                "Via": [
                  "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)"
                ],
                "X-Amz-Cf-Id": [
                  "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA=="
                ],
                "X-Forwarded-For": [
                  "127.0.0.1, 127.0.0.2"
                ],
                "X-Forwarded-Port": [
                  "443"
                ],
                "X-Forwarded-Proto": [
                  "https"
                ]
              },
              "requestContext": {
                "accountId": "123456789012",
                "resourceId": "123456",
                "stage": "prod",
                "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
                "requestTime": "09/Apr/2015:12:34:56 +0000",
                "requestTimeEpoch": 1428582896000,
                "identity": {
                  "cognitoIdentityPoolId": null,
                  "accountId": null,
                  "cognitoIdentityId": null,
                  "caller": null,
                  "accessKey": null,
                  "sourceIp": "127.0.0.1",
                  "cognitoAuthenticationType": null,
                  "cognitoAuthenticationProvider": null,
                  "userArn": null,
                  "userAgent": "Custom User Agent String",
                  "user": null
                },
                "path": "/prod/resources/greeting",
                "resourcePath": "/{proxy+}",
                "httpMethod": "POST",
                "apiId": "1234567890",
                "protocol": "HTTP/1.1"
              }
		})
	};

	// Test

	var lambdaResult = "";

	lambda.invoke(lambdaParams, function(err, data) {
		if (err){	// an error occurred
			console.log(err, err.stack);
			lambdaResult = "Failed";
		}
		else{	// successful response
			var result = JSON.parse(data.Payload);
			console.log("PreTraffic Hook testing new function version returned: " + result.body);
			if(result.body == "Greetings" || result.body == "Hello"){
				lambdaResult = "Succeeded";
				console.log ("PreTraffic Hook return validation testing succeeded!");
			}
			else{
				lambdaResult = "Failed";
				console.log ("PreTraffic Hook retrun validation testing failed!");
			}
		}

			// Prepare the validation test results with the deploymentId and
            // the lifecycleEventHookExecutionId for AWS CodeDeploy.
              var params = {
                deploymentId: deploymentId,
                lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
                status: lambdaResult // status can be 'Succeeded' or 'Failed'
              };
              console.log ("PreTraffic Hook validation will return to CodeDeploy :" + params.status);

            // Pass AWS CodeDeploy the prepared validation test results.
            codedeploy.putLifecycleEventHookExecutionStatus(params, function(err, data) {
              if (err) {
                // Validation failed.
                console.log('Validation test failed');
                console.log(err);
                console.log(data);
                callback('Validation test failed');
              } else {
                // Validation succeeded.
                console.log('Validation test succeeded');
                callback(null, 'Validation test succeeded');
              }
            });
	});
}
