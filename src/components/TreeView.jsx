import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

function TreeNode({ node, onSelect, selectedId, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.nodes && node.nodes.length > 0;
  const isSelected = selectedId === node.node_id;

  const handleClick = () => {
    onSelect(node);
    if (hasChildren) setExpanded(!expanded);
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-node-inner ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${12 + depth * 8}px` }}
        title={node.summary || node.title}
      >
        {hasChildren ? (
          <FiChevronRight
            className={`toggle-icon ${expanded ? 'expanded' : ''}`}
          />
        ) : (
          <span className="toggle-icon" />
        )}
        <span className="node-title">{node.title}</span>
        <span className="node-pages">
          p.{node.start_index}-{node.end_index}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="tree-children">
          {node.nodes.map((child, i) => (
            <TreeNode
              key={child.node_id || i}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ tree, onSelect, selectedId }) {
  if (!tree || tree.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <h3>No structure available</h3>
        <p>Document is being indexed...</p>
      </div>
    );
  }

  return (
    <div className="tree-view">
      {tree.map((node, i) => (
        <TreeNode
          key={node.node_id || i}
          node={node}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
