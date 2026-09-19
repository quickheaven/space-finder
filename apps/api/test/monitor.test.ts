import { SNSEvent } from "aws-lambda";
import { handler } from "../src/services/monitor/handler";

const fetchMock = jest.spyOn(global, "fetch");

const snsEvent: SNSEvent = {
  Records: [
    {
      Sns: {
        Message: "This is a test",
      },
    },
  ],
} as any;

beforeEach(() => {
  process.env.SLACK_WEBHOOK_URL = "https://example.com/slack-webhook";
  fetchMock.mockResolvedValue({} as Response);
});

afterEach(() => {
  fetchMock.mockReset();
});

test("monitor lambda", async () => {
  await handler(snsEvent, {});

  expect(fetchMock).toHaveBeenCalledWith("https://example.com/slack-webhook", {
    method: "POST",
    body: JSON.stringify({
      text: "Huston, we have a problem: This is a test",
    }),
  });
});
