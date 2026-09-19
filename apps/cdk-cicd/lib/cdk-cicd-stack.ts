import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CdkCicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create a dedicated, cost-optimized artifact bucket
    const pipelineArtifactBucket = new s3.Bucket(
      this,
      "PipelineArtifactBucket",
      {
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

        // Clean up bucket when stack is destroyed (optional for sandbox environments)
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,

        // 2. Lifecycle Rule: Automatically delete artifacts after 7 days
        lifecycleRules: [
          {
            id: "ExpireOldArtifactsAndMultipartUploads",
            enabled: true,
            expiration: cdk.Duration.days(7), // Expire all objects older than 7 days
            abortIncompleteMultipartUploadAfter: cdk.Duration.days(1), // Clean up failed/incomplete uploads
          },
        ],
      },
    );

    new CodePipeline(this, "AwesomePipeline", {
      pipelineName: "AwesomePipeline",
      crossAccountKeys: false, // Prevents creating a $1/mo KMS Customer Managed Key
      artifactBucket: pipelineArtifactBucket, // Pass the bucket to CodePipeline
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("quickheaven/space-finder", "main"),
        commands: [
          "npm install -g pnpm",
          "pnpm config set store-dir .pnpm-store",
          "pnpm install --frozen-lockfile",
          "pnpm --filter cdk-cicd exec cdk synth",
        ],
        primaryOutputDirectory: "apps/cdk-cicd/cdk.out",
      }),

      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
          computeType: codebuild.ComputeType.SMALL,
        },
        timeout: cdk.Duration.minutes(15),
        cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
      },
    });
  }
}
