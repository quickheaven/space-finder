import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";

test("auth login and get id token", async () => {
  const service = new AuthService();
  const loginResult = await service.login(
    process.env.TEST_USERNAME!,
    process.env.TEST_PASSWORD!,
  );
  const idToken = await service.getIdToken();
  expect(idToken).toBeDefined();

  const credentials = await service.generateTemporaryCredentials();

  const buckets = await listBuckets(credentials);
});

async function listBuckets(credentials: any) {
  const client = new S3Client({
    credentials: credentials,
  });
  const command = new ListBucketsCommand({});
  const result = await client.send(command);
  return result;
}
