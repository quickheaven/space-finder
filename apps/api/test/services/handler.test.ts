import { handler } from "../../src/services/monitor/handler";

describe("Monitor lambda tests", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  fetchSpy.mockImplementation(() => Promise.resolve({} as any));
  const originalWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  beforeEach(() => {
    process.env.SLACK_WEBHOOK_URL = "https://example.test/slack-webhook";
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalWebhookUrl === undefined) {
      delete process.env.SLACK_WEBHOOK_URL;
    } else {
      process.env.SLACK_WEBHOOK_URL = originalWebhookUrl;
    }
  });

  test("makes requests for records in SnsEvents", async () => {
    await handler(
      {
        Records: [
          {
            Sns: {
              Message: "Test message",
            },
          },
        ],
      } as any,
      {},
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(expect.any(String), {
      method: "POST",
      body: JSON.stringify({
        text: `Huston, we have a problem: Test message`,
      }),
    });
  });

  test("No sns records, no requests", async () => {
    await handler(
      {
        Records: [],
      } as any,
      {},
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
