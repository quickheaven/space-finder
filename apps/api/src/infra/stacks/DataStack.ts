import { Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../Utils";
import { BlockPublicAccess, Bucket, IBucket } from "aws-cdk-lib/aws-s3";

export class DataStack extends Stack {
  public readonly spacesTable: ITable;
  public readonly deploymentBucket: IBucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    this.deploymentBucket = new Bucket(this, "SpaceFinderFrontend", {
      bucketName: `space-finder-frontend-${suffix}`,
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      enforceSSL: true,
      websiteIndexDocument: "index.html",
    });

    this.spacesTable = new Table(this, "SpacesTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: `SpaceTable-${suffix}`,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
