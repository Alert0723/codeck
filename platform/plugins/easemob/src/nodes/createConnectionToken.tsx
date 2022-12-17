import React from 'react';
import {
  BaseNode,
  buildPinPosX,
  buildPinPosY,
  CodeckNodeDefinition,
  TextInputPreset,
  buildNodeHeight,
  PinLabel,
  standard,
  OutputPinLabel,
} from 'codeck';
import { EASEMOB_CATEGORY } from '../const';

// Docs: http://docs-im-beta.easemob.com/document/web/quickstart.html

const width = 280;
const height = buildNodeHeight(6);

export const CreateConnectionTokenNodeDefinition: CodeckNodeDefinition = {
  name: 'easemob:createConnectionToken',
  label: 'FE 创建环信连接实例(Token登录)',
  type: 'function',
  component: BaseNode,
  width,
  height,
  category: EASEMOB_CATEGORY,
  inputs: [
    standard.execPinInput(width),
    standard
      .pin({
        name: 'appKey',
        width,
        position: 1,
      })
      .port.input.text(),
    standard
      .pin({
        name: 'username',
        width,
        position: 3,
      })
      .port.input.text(),
    standard
      .pin({
        name: 'token',
        width,
        position: 5,
      })
      .port.input.text(),
  ],
  outputs: [
    standard.execPinOutput(width),
    standard
      .pin({
        name: 'onLoginSuccess',
        width,
        position: 1,
      })
      .exec.output(),
    standard
      .pin({
        name: 'onLoginFailed',
        width,
        position: 2,
      })
      .exec.output(),
    standard
      .pin({
        name: 'conn',
        width,
        position: 3,
      })
      .port.output.base(),
  ],
  prepare: [
    {
      type: 'import',
      module: 'easemob-websdk',
      member: ['default', 'WebIM'],
    },
  ],
  code: ({
    node,
    getConnectionInput,
    buildPinVarName,
    getConnectionExecOutput,
  }) => {
    const appKey =
      getConnectionInput('appKey') ?? JSON.stringify(node.data?.appKey ?? '');
    const username =
      getConnectionInput('username') ??
      JSON.stringify(node.data?.username ?? '');
    const token =
      getConnectionInput('token') ?? JSON.stringify(node.data?.token ?? '');
    const conn = buildPinVarName('conn');
    const onLoginSuccess =
      getConnectionExecOutput('onLoginSuccess')
        ?.trim()
        .split('\n')
        .join('\n    ') ?? '';
    const onLoginFailed =
      getConnectionExecOutput('onLoginFailed')
        ?.trim()
        .split('\n')
        .join('\n    ') ?? '';

    return `const ${conn} = new WebIM.connection({appKey: ${appKey}});
${conn}.open({user: ${username}, accessToken: ${token}})
  .then(() => {
    ${onLoginSuccess}
  })
  .catch(() => {
    ${onLoginFailed}
  });
`;
  },
};
