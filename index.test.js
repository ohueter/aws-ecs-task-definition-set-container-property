const run = require(".");
const core = require("@actions/core");
const tmp = require("tmp");
const fs = require("fs");

jest.mock("@actions/core");
jest.mock("tmp");
jest.mock("fs");

describe("Render task definition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    core.getInput = jest
      .fn()
      .mockReturnValueOnce("task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    process.env = Object.assign(process.env, { GITHUB_WORKSPACE: __dirname });
    process.env = Object.assign(process.env, {
      RUNNER_TEMP: "/home/runner/work/_temp",
    });

    tmp.fileSync.mockReturnValue({
      name: "new-task-def-file-name",
    });

    fs.existsSync.mockReturnValue(true);

    jest.mock(
      "./task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
            essential: false,
          },
          {
            name: "sidecar",
            essential: false,
          },
        ],
      }),
      { virtual: true }
    );
  });

  test("renders the task definition and creates a new task def file", async () => {
    await run();
    expect(tmp.fileSync).toHaveBeenNthCalledWith(1, {
      tmpdir: "/home/runner/work/_temp",
      prefix: "task-definition-",
      postfix: ".json",
      keep: true,
      discardDescriptor: true,
    });
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              essential: true,
            },
            {
              name: "sidecar",
              essential: false,
            },
          ],
        },
        null,
        2
      )
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      "task-definition",
      "new-task-def-file-name"
    );
  });

  test("renders the task definition and updates string value", async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("string-task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("image") // property-name
      .mockReturnValueOnce('"nginx"'); // value

    jest.mock(
      "./string-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
            image: "postgres",
          },
        ],
      }),
      { virtual: true }
    );

    await run();

    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              image: "nginx",
            },
          ],
        },
        null,
        2
      )
    );
  });

  test("renders the task definition and updates array value", async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("array-task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("command") // property-name
      .mockReturnValueOnce('["npm", "run", "serve"]'); // value

    jest.mock(
      "./array-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
            command: [],
          },
        ],
      }),
      { virtual: true }
    );

    await run();

    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              command: ["npm", "run", "serve"],
            },
          ],
        },
        null,
        2
      )
    );
  });

  test("renders the task definition and updates object value", async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("object-task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("healthcheck") // property-name
      .mockReturnValueOnce('{ "command": [ "ls" ], "interval": 5 }'); // value

    jest.mock(
      "./object-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
            healthcheck: {},
          },
        ],
      }),
      { virtual: true }
    );

    await run();

    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              healthcheck: { command: ["ls"], interval: 5 },
            },
          ],
        },
        null,
        2
      )
    );
  });

  test("renders the task definition and creates non-existing property", async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("string-task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("image") // property-name
      .mockReturnValueOnce('"nginx"'); // value

    jest.mock(
      "./nonexisting-property-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
          },
        ],
      }),
      { virtual: true }
    );

    await run();

    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              image: "nginx",
            },
          ],
        },
        null,
        2
      )
    );
  });

  test("renders a task definition at an absolute path", async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("/hello/task-definition.json") // task-definition
      .mockReturnValueOnce("web") // container-name
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    jest.mock(
      "/hello/task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "web",
            essential: false,
          },
        ],
      }),
      { virtual: true }
    );

    await run();

    expect(tmp.fileSync).toHaveBeenNthCalledWith(1, {
      tmpdir: "/home/runner/work/_temp",
      prefix: "task-definition-",
      postfix: ".json",
      keep: true,
      discardDescriptor: true,
    });
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "new-task-def-file-name",
      JSON.stringify(
        {
          family: "task-def-family",
          containerDefinitions: [
            {
              name: "web",
              essential: true,
            },
          ],
        },
        null,
        2
      )
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      "task-definition",
      "new-task-def-file-name"
    );
  });

  test("error returned for missing task definition file", async () => {
    fs.existsSync.mockReturnValue(false);
    core.getInput = jest
      .fn()
      .mockReturnValueOnce("does-not-exist-task-definition.json")
      .mockReturnValueOnce("web")
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    await run();

    expect(core.setFailed).toBeCalledWith(
      "Task definition file does not exist: does-not-exist-task-definition.json"
    );
  });

  test("error returned for non-JSON task definition contents", async () => {
    jest.mock("./non-json-task-definition.json", () => "hello", {
      virtual: true,
    });

    core.getInput = jest
      .fn()
      .mockReturnValueOnce("non-json-task-definition.json")
      .mockReturnValueOnce("web")
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    await run();

    expect(core.setFailed).toBeCalledWith(
      "Invalid task definition format: containerDefinitions section is not present or is not an array"
    );
  });

  test("error returned for malformed task definition with non-array container definition section", async () => {
    jest.mock(
      "./malformed-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: {},
      }),
      { virtual: true }
    );

    core.getInput = jest
      .fn()
      .mockReturnValueOnce("malformed-task-definition.json")
      .mockReturnValueOnce("web")
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    await run();

    expect(core.setFailed).toBeCalledWith(
      "Invalid task definition format: containerDefinitions section is not present or is not an array"
    );
  });

  test("error returned for task definition without matching container name", async () => {
    jest.mock(
      "./missing-container-task-definition.json",
      () => ({
        family: "task-def-family",
        containerDefinitions: [
          {
            name: "main",
            essential: false,
          },
        ],
      }),
      { virtual: true }
    );

    core.getInput = jest
      .fn()
      .mockReturnValueOnce("missing-container-task-definition.json")
      .mockReturnValueOnce("web")
      .mockReturnValueOnce("essential") // property-name
      .mockReturnValueOnce("true"); // value

    await run();

    expect(core.setFailed).toBeCalledWith(
      "Invalid task definition: Could not find container definition with matching name"
    );
  });
});
