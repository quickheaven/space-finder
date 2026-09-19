import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CloudFrontWebDistribution } from "aws-cdk-lib/aws-cloudfront";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

interface UiDeploymentStackProps extends StackProps {
  deploymentBucket: IBucket;
}

export class UiDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props: UiDeploymentStackProps) {
    super(scope, id, props);

    const uiDir = join(__dirname, "..", "..", "..", "..", "ui", "dist");

    if (existsSync(uiDir) && readdirSync(uiDir).length > 0) {
      const uiDeployment = new BucketDeployment(
        this,
        "space-finder-ui-deployment",
        {
          destinationBucket: props.deploymentBucket,
          sources: [Source.asset(uiDir)],
        },
      );
      uiDeployment.handlerRole.addToPrincipalPolicy(
        new PolicyStatement({
          actions: ["kms:Decrypt", "kms:DescribeKey"],
          resources: ["*"],
        }),
      );

      new CfnOutput(this, "space-finder-ui-deploymentS3Url", {
        value: props.deploymentBucket.bucketWebsiteUrl,
      });
    } else {
      console.warn("Ui directory not found: " + uiDir);
    }
  }
}
