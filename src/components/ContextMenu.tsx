import { values } from 'lodash-es';
import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNodeStore } from '../store/node';
import { Trigger, Menu, Input, Empty, Message } from '@arco-design/web-react';
import { useMemoizedFn } from 'ahooks';
import Highlighter from 'react-highlight-words';
import Fuse from 'fuse.js';
import { useStageStore } from '../store/stage';
import Konva from 'konva';
import { useConnectionStore } from '../store/connection';

const ContextMenu: React.FC<{ onClose: () => void }> = React.memo((props) => {
  const { nodeDefinition, createNode } = useNodeStore();
  const [searchValue, setSearchValue] = useState('');
  const { getRelativePointerPosition } = useStageStore();
  const nodeCreatedPosRef = useRef<Konva.Vector2d | null>(null);

  useEffect(() => {
    nodeCreatedPosRef.current = getRelativePointerPosition();
  }, []);

  const handleCreateNode = useMemoizedFn((nodeName: string) => {
    if (!nodeName) {
      Message.error('Node Name undefined');
      return;
    }

    if (!nodeCreatedPosRef.current) {
      Message.error('Cannot get pointer position');
      return;
    }

    createNode(nodeName, nodeCreatedPosRef.current);
    props.onClose();
  });

  const list = useMemo(() => values(nodeDefinition), [nodeDefinition]);

  const fuse = useMemo(
    () =>
      new Fuse(list, {
        keys: ['label'],
      }),
    [list]
  );

  const matchedNode =
    searchValue === '' ? list : fuse.search(searchValue).map((res) => res.item);

  return (
    <div
      className="bg-black bg-opacity-80"
      style={{
        width: 240,
      }}
    >
      <Menu>
        <Input
          autoFocus
          placeholder="Search Node"
          value={searchValue}
          onChange={setSearchValue}
        />

        {Array.isArray(matchedNode) && matchedNode.length > 0 ? (
          matchedNode.map((definition) => (
            <Menu.Item
              key={definition.name}
              onClick={() => handleCreateNode(definition.name)}
            >
              <Highlighter
                searchWords={searchValue.split('')}
                textToHighlight={definition.label}
              />
            </Menu.Item>
          ))
        ) : (
          <Empty description="Not Found" />
        )}
      </Menu>
    </div>
  );
});
ContextMenu.displayName = 'ContextMenu';

interface ContextMenuWrapperProps extends PropsWithChildren {
  className?: string;
}
export const ContextMenuWrapper: React.FC<ContextMenuWrapperProps> = React.memo(
  (props) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const { workingConnection } = useConnectionStore();

    return (
      <Trigger
        popup={() => <ContextMenu onClose={() => setPopupVisible(false)} />}
        alignPoint={true}
        escToClose={true}
        popupVisible={popupVisible}
        onVisibleChange={(v) => setPopupVisible(v)}
        position="bl"
        popupAlign={{
          bottom: 8,
          left: 8,
        }}
        trigger={['contextMenu']}
        disabled={!!workingConnection}
      >
        <div className={props.className}>{props.children}</div>
      </Trigger>
    );
  }
);
ContextMenuWrapper.displayName = 'ContextMenuWrapper';
