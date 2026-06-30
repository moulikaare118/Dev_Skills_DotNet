/**
 * projectTreeBuilder.js
 * Builds hierarchical project structure from flat file array
 * Supports dynamic tree manipulation and navigation
 */

/**
 * Normalizes file path to use forward slashes
 */
function normalizePath(filePath = '') {
  return String(filePath || '')
    .replace(/\\/g, '/')
    .replace(/^\//, '')
    .replace(/\/+/g, '/');
}

/**
 * Categorizes files by their path/name for organization
 */
function getFileCategory(filePath = '') {
  const normalized = normalizePath(filePath).toLowerCase();

  if (normalized.includes('/tests/') || normalized.endsWith('.tests.cs') || normalized.includes('tests/')) {
    return 'Tests';
  }
  if (normalized.endsWith('/program.cs') || normalized === 'program.cs') {
    return 'Program';
  }
  if (normalized.includes('/models/')) {
    return 'Models';
  }
  if (normalized.includes('/interfaces/')) {
    return 'Interfaces';
  }
  if (normalized.includes('/services/')) {
    return 'Services';
  }
  if (normalized.includes('/repositories/')) {
    return 'Repositories';
  }
  if (normalized.includes('/helpers/')) {
    return 'Helpers';
  }
  if (normalized.includes('/migrations/') || normalized.includes('/data/')) {
    return 'Database';
  }
  if (normalized.endsWith('.json') || normalized.endsWith('.xml') || normalized.endsWith('.config')) {
    return 'Configuration';
  }
  if (normalized.endsWith('.csproj') || normalized.endsWith('.sln')) {
    return 'Project';
  }
  return 'Other';
}

/**
 * Creates a tree node for a folder or file
 */
function createNode(name, type = 'folder', data = {}) {
  return {
    id: `node-${name}-${Date.now()}-${Math.random()}`,
    name,
    type, // 'folder' | 'file'
    expanded: true,
    children: type === 'folder' ? [] : undefined,
    fileId: data.fileId || null,
    path: data.path || '',
    category: data.category || 'Other',
    isReadOnly: data.isReadOnly || false,
    ...data
  };
}

/**
 * Builds a hierarchical project tree from flat file array
 * @param {Array} files - Array of file objects with { id, path, name, content, readOnly }
 * @returns {Object} Root tree node with nested structure
 */
export function buildProjectTree(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return createNode('root');
  }

  const root = createNode('root');
  const folderMap = new Map(); // path -> node mapping for fast lookup
  folderMap.set('', root);

  // Sort files to ensure consistent ordering
  const sortedFiles = [...files].sort((a, b) => {
    const pathA = normalizePath(a.path || a.name || '');
    const pathB = normalizePath(b.path || b.name || '');
    return pathA.localeCompare(pathB);
  });

  // Build tree structure
  sortedFiles.forEach((file) => {
    const parts = normalizePath(file.path || file.name || '').split('/').filter(Boolean);

    if (parts.length === 0) return;

    // Ensure all parent folders exist
    let currentPath = '';
    let currentNode = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let parentNode = folderMap.get(currentPath);

      if (!parentNode) {
        parentNode = createNode(part, 'folder', { path: currentPath });
        currentNode.children.push(parentNode);
        folderMap.set(currentPath, parentNode);
      }

      currentNode = parentNode;
    }

    // Add file node
    const fileName = parts[parts.length - 1];
    const filePath = normalizePath(file.path || file.name || '');
    const fileNode = createNode(fileName, 'file', {
      path: filePath,
      fileId: file.id,
      category: getFileCategory(filePath),
      isReadOnly: file.readOnly || false
    });

    currentNode.children.push(fileNode);
  });

  // Sort children at each level (folders first, then files alphabetically)
  const sortNode = (node) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortNode);
    }
  };

  sortNode(root);
  return root;
}

/**
 * Flattens a tree back to file array
 * @param {Object} tree - Tree node
 * @returns {Array} Array of files with paths maintained
 */
export function flattenTree(tree) {
  const files = [];

  function traverse(node, currentPath = '') {
    if (!node) return;

    if (node.type === 'file' && node.fileId) {
      files.push({
        id: node.fileId,
        name: node.name,
        path: node.path || currentPath,
        readOnly: node.isReadOnly,
        category: node.category
      });
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => {
        const childPath = currentPath ? `${currentPath}/${child.name}` : child.name;
        traverse(child, childPath);
      });
    }
  }

  traverse(tree);
  return files;
}

/**
 * Finds a file in the tree by path
 * @param {Object} tree - Root tree node
 * @param {string} targetPath - File path to find
 * @returns {Object|null} File node or null if not found
 */
export function findFileInTree(tree, targetPath) {
  const normalized = normalizePath(targetPath);
  let found = null;

  function traverse(node) {
    if (found) return;

    if (node.type === 'file' && node.path === normalized) {
      found = node;
      return;
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return found;
}

/**
 * Finds parent folder of a file in tree
 * @param {Object} tree - Root tree node
 * @param {string} targetPath - File path
 * @returns {Object|null} Parent folder node
 */
export function findParentFolder(tree, targetPath) {
  const normalized = normalizePath(targetPath);
  const parts = normalized.split('/');

  if (parts.length <= 1) return tree;

  const folderPath = parts.slice(0, -1).join('/');
  let found = null;

  function traverse(node, currentPath = '') {
    if (found) return;

    if (node.type === 'folder') {
      if (node.path === folderPath) {
        found = node;
        return;
      }
    }

    if (node.children) {
      node.children.forEach((child) => {
        const childPath = currentPath ? `${currentPath}/${child.name}` : child.name;
        traverse(child, childPath);
      });
    }
  }

  traverse(tree);
  return found || tree;
}

/**
 * Gets all files of a specific category (Models, Services, Tests, etc.)
 * @param {Object} tree - Root tree node
 * @param {string} category - Category to filter
 * @returns {Array} Array of file nodes
 */
export function getFilesByCategory(tree, category) {
  const files = [];

  function traverse(node) {
    if (node.type === 'file' && node.category === category) {
      files.push(node);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return files;
}

/**
 * Gets statistics about the project
 * @param {Object} tree - Root tree node
 * @returns {Object} Project statistics
 */
export function getProjectStats(tree) {
  const stats = {
    totalFiles: 0,
    totalFolders: 0,
    categories: {},
    filesByCategory: {}
  };

  function traverse(node) {
    if (node.type === 'folder') {
      stats.totalFolders++;
    } else if (node.type === 'file') {
      stats.totalFiles++;
      const category = node.category || 'Other';
      stats.categories[category] = (stats.categories[category] || 0) + 1;

      if (!stats.filesByCategory[category]) {
        stats.filesByCategory[category] = [];
      }
      stats.filesByCategory[category].push(node.name);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return stats;
}

/**
 * Finds all nodes matching a search term
 * @param {Object} tree - Root tree node
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Matching nodes
 */
export function searchTree(tree, searchTerm = '') {
  const term = searchTerm.toLowerCase();
  const results = [];

  function traverse(node) {
    if (node.name.toLowerCase().includes(term)) {
      results.push(node);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return results;
}

/**
 * Expands/collapses folders in tree
 * @param {Object} tree - Root tree node
 * @param {string} folderPath - Path of folder to toggle
 * @returns {Object} Updated tree
 */
export function toggleFolderExpanded(tree, folderPath) {
  const folder = findFileInTree(tree, folderPath);

  if (folder && folder.type === 'folder') {
    folder.expanded = !folder.expanded;
  }

  return tree;
}

/**
 * Expands all folders in the tree
 * @param {Object} tree - Root tree node
 * @returns {Object} Updated tree
 */
export function expandAll(tree) {
  function traverse(node) {
    if (node.type === 'folder') {
      node.expanded = true;
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return tree;
}

/**
 * Collapses all folders in the tree
 * @param {Object} tree - Root tree node
 * @returns {Object} Updated tree
 */
export function collapseAll(tree) {
  function traverse(node) {
    if (node.type === 'folder') {
      node.expanded = false;
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return tree;
}

export default {
  buildProjectTree,
  flattenTree,
  findFileInTree,
  findParentFolder,
  getFilesByCategory,
  getProjectStats,
  searchTree,
  toggleFolderExpanded,
  expandAll,
  collapseAll
};
