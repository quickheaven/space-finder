import { App } from "aws-cdk-lib";
import { Capture, Template } from "aws-cdk-lib/assertions";
import { MonitorStack } from "../src/infra/stacks/MonitorStack";

describe("Monitor stack test suite", () => {
  let monitorStackTemplate: Template;

  beforeAll(() => {
    const testApp = new App({
      outdir: "cdk.out",
    });
    const monitorStack = new MonitorStack(testApp, "MonitorStack");
    monitorStackTemplate = Template.fromStack(monitorStack);
  });

  test("Lambda properties", () => {
    monitorStackTemplate.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs18.x",
    });
  });

  test("Sns topic properties", () => {
    monitorStackTemplate.hasResourceProperties("AWS::SNS::Topic", {
      DisplayName: "AlarmTopic",
      TopicName: "AlarmTopic",
    });
  });

  test("Alarm actions", () => {
    const alarmActionsCapture = new Capture();
    monitorStackTemplate.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmActions: alarmActionsCapture,
    });

    expect(alarmActionsCapture.asArray()).toEqual([
      {
        Ref: expect.stringMatching(/^AlarmTopic/),
      },
    ]);
  });
});
