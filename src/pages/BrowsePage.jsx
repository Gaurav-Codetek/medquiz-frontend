import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { document as docApi } from '../api/client';
import TreeView from '../components/TreeView';

export default function BrowsePage() {
  const [tree, setTree] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [pageContent, setPageContent] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { activeBook } = useBook();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeBook) return;
    setLoadingTree(true);
    setTree([]);
    setSelectedNode(null);
    setPageContent([]);
    
    docApi.getTree(activeBook)
      .then((res) => setTree(res.data))
      .catch(console.error)
      .finally(() => setLoadingTree(false));
  }, [activeBook]);

  const handleNodeSelect = async (node) => {
    setSelectedNode(node);
    setLoadingContent(true);
    try {
      const pages = `${node.start_index}-${Math.min(node.end_index, node.start_index + 4)}`;
      const res = await docApi.getPages(pages, activeBook);
      setPageContent(res.data);
    } catch (err) {
      console.error('Failed to load page content:', err);
      setPageContent([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleQuiz = () => {
    if (!selectedNode) return;
    navigate('/quiz', {
      state: {
        pages: `${selectedNode.start_index}-${selectedNode.end_index}`,
        title: selectedNode.title,
      },
    });
  };

  const handleAsk = () => {
    if (!selectedNode) return;
    navigate('/ask', {
      state: {
        pages: `${selectedNode.start_index}-${selectedNode.end_index}`,
        title: selectedNode.title,
      },
    });
  };

  // Filter tree by search
  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((node) => {
        const titleMatch = node.title.toLowerCase().includes(q);
        const filteredChildren = node.nodes ? filterTree(node.nodes, query) : [];
        if (titleMatch || filteredChildren.length > 0) {
          return { ...node, nodes: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredTree = filterTree(tree, searchQuery);

  return (
    <div className="page">
      <div className="page-header">
        <h1>📖 Browse Contents</h1>
        <p>Navigate the textbook structure and explore content</p>
      </div>

      <div className="browse-layout">
        {/* Tree Sidebar */}
        <div className="tree-sidebar glass-card" style={{ padding: '16px' }}>
          <div className="sidebar-header">
            <h3 style={{ fontSize: '0.95rem' }}>Table of Contents</h3>
            <span className="badge badge-teal">{tree.length} sections</span>
          </div>

          <div className="tree-search">
            <input
              type="text"
              className="input"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            />
          </div>

          {loadingTree ? (
            <div className="loading-overlay" style={{ padding: '32px' }}>
              <div className="spinner" />
              <p>Loading structure...</p>
            </div>
          ) : (
            <TreeView
              tree={filteredTree}
              onSelect={handleNodeSelect}
              selectedId={selectedNode?.node_id}
            />
          )}
        </div>

        {/* Content Panel */}
        <div className="content-panel glass-card">
          {selectedNode ? (
            <>
              <div className="content-header">
                <div>
                  <h2>{selectedNode.title}</h2>
                  <span className="badge badge-teal" style={{ marginTop: '8px', display: 'inline-block' }}>
                    Pages {selectedNode.start_index} - {selectedNode.end_index}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleQuiz}>
                    🧠 Generate Quiz
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleAsk}>
                    💬 Ask AI
                  </button>
                </div>
              </div>

              {selectedNode.summary && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  borderLeft: '3px solid var(--accent-teal)'
                }}>
                  {selectedNode.summary}
                </div>
              )}

              {loadingContent ? (
                <div className="loading-overlay">
                  <div className="spinner" />
                  <p>Loading pages...</p>
                </div>
              ) : (
                <div>
                  {pageContent.map((p) => (
                    <div key={p.page} style={{ marginBottom: '24px' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-teal)',
                        fontWeight: 600,
                        marginBottom: '8px'
                      }}>
                        — Page {p.page} —
                      </div>
                      <div className="page-text">{p.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h3>Select a section</h3>
              <p>Click on a chapter or section in the tree to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
