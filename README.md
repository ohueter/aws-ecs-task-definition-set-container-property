## AWS ECS "Set Container Property in Task Definition" Action for GitHub Actions

Updates a property of a container identified by its name in an Amazon ECS task definition JSON file, creating a new task definition file.

**Table of Contents**

<!-- toc -->

- [Usage](#usage)
- [License Summary](#license-summary)
- [Security Disclosures](#security-disclosures)

<!-- tocstop -->

## Usage

To update the `command` property to `'["npm", "run", "serve"]'` in the container
named `myapp` in the task definition file, and then deploy the edited task definition file to ECS:

```yaml
- name: Update container property in task definition
  id: update-command
  uses: ohueter/aws-ecs-task-definition-set-container-property@v1
  with:
    task-definition: task-definition.json
    container-name: myapp
    property-name: command
    value: '["npm", "run", "serve"]'

- name: Deploy to Amazon ECS service
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ${{ steps.update-command.outputs.task-definition }}
    service: my-service
    cluster: my-cluster
```

If your task definition file holds multiple containers in the `containerDefinitions`
section which require updated container names, chain multiple executions of this action
together using the output value from the first action for the `task-definition`
input of the second:

```yaml
- name: Update container property in task definition with first container
  id: update-command
  uses: ohueter/aws-ecs-task-definition-set-container-property@v1
  with:
    task-definition: task-definition.json
    container-name: myapp
    property-name: command
    value: '["npm", "run", "serve"]'

- name: Update container property in task definition with second container
  id: update-postgres
  uses: ohueter/aws-ecs-task-definition-set-container-property@v1
  with:
    task-definition: ${{ steps.update-command.outputs.task-definition }}
    container-name: postgres
    property-name: essential
    value: 'true'

- name: Deploy to Amazon ECS service
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ${{ steps.update-postgres.outputs.task-definition }}
    service: my-service
    cluster: my-cluster
```

See [action.yml](action.yml) for the full documentation for this action's inputs and outputs.

## License Summary

This code is made available under the MIT license. It has been forked and modified from https://github.com/aws-actions/amazon-ecs-render-task-definition/.
