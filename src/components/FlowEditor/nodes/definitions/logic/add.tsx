import { TaichuNodeDefinition } from '@/store/node';
import { buildCombinedLogicDefinition } from './_combined';

export const AddNodeDefinition: TaichuNodeDefinition =
  buildCombinedLogicDefinition({
    name: 'add',
    label: 'Add',
    outputCode(input1, input2) {
      return `(${input1} + ${input2})`;
    },
  });
