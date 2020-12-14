'use strict';

const aws = require('aws-sdk');
const codedeploy = new aws.CodeDeploy({apiVersion: '2014-10-06'});
const lambda = new aws.Lambda();
exports.handler = (event, context, callback) => {

	console.log("Entering PreTraffic Hook!");
	console.log(JSON.stringify(event));

  var lambda_version = process.env.CurrentVersion;
	var lambda_versionToTest = process.env.NewVersion;
	console.log("Testing new function version: " + lambda_versionToTest);

  //Read the DeploymentId from the event payload.
  var deploymentId = event.DeploymentId;
	console.log(deploymentId);

  //Read the LifecycleEventHookExecutionId from the event payload
  var lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
  console.log(lifecycleEventHookExecutionId);

	/*
		[Perform validation or prewarming steps here]
	*/

	var lambdaParams = {
		FunctionName: lambda_versionToTest,
		InvocationType: "RequestResponse"
	};

	// Test

	var lambdaResult = "Failed";
	lambda.invoke(lambdaParams, function(err, data) {
		if (err){	// an error occurred
			console.log(err, err.stack);
			lambdaResult = "Failed";
		}
		else{	// successful response
			var result = JSON.parse(data.Payload);
			console.log("Result: " +  JSON.stringify(result));
			console.log("New function version Body return: " + result.body);
			if(result.body == "Greeting"){
				lambdaResult = "Succeeded";
				console.log ("Validation testing succeeded!");
			}
			else{
				lambdaResult = "Failed";
				console.log ("Validation testing failed!");
			}
		}
	};

	// Prepare the validation test results with the deploymentId and
  // the lifecycleEventHookExecutionId for AWS CodeDeploy.
  var params = {
    deploymentId: deploymentId,
    lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
    status: lambdaResult // status can be 'Succeeded' or 'Failed'
  };

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
}
