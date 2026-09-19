import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CdkCicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CodePipeline(this, "AwesomePipeline", {
      pipelineName: "AwesomePipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("quickheaven/space-finder", "main"),
        commands: [
          "pnpm config set store-dir .pnpm-store",
          "pnpm install --frozen-lockfile",
          "pnpm --filter cdk-cicd exec cdk synth",
        ],
        primaryOutputDirectory: "cdk-cicd/cdk.out",
      }),

      // Cost Optimization & Guardrail Settings
      codeBuildDefaults: {
        // 1. Switch compute to ARM / AWS Graviton (~20-30% cheaper per minute than x86)
        buildEnvironment: {
          buildImage: codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
          computeType: codebuild.ComputeType.SMALL, // 3 GB RAM, 2 vCPUs
        },
        // 2. Prevent runaway jobs if pnpm hangs or waits for input
        timeout: cdk.Duration.minutes(15),
        // 3. Cache pnpm store locally across build runs
        cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
      },
    });
  }
}
