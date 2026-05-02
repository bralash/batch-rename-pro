/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 320, height: 560, title: "Batch Rename Pro" });

interface LayerInfo {
  id: string;
  name: string;
  type: string;
  parentName: string;
}

interface RenameItem {
  id: string;
  newName: string;
}

interface ApplyResult {
  renamed: number;
  skipped: number;
  locked: number;
  errors: string[];
}

function getSelectionData(): LayerInfo[] {
  return figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type.toLowerCase(),
    parentName: node.parent ? node.parent.type === "PAGE" ? "(page)" : (node.parent as SceneNode).name : "(none)",
  }));
}

function applyRenames(items: RenameItem[]): ApplyResult {
  const result: ApplyResult = { renamed: 0, skipped: 0, locked: 0, errors: [] };

  // Build a map of final names to detect duplicates across the batch
  const nameCount: Record<string, number> = {};
  const resolvedNames: Record<string, string> = {};

  for (const item of items) {
    if (!item.newName || !item.newName.trim()) continue;
    const base = item.newName.trim();
    nameCount[base] = (nameCount[base] || 0) + 1;
  }

  // Track occurrences per base name for suffix generation
  const nameUsed: Record<string, number> = {};

  for (const item of items) {
    if (!item.newName || !item.newName.trim()) {
      resolvedNames[item.id] = "";
      continue;
    }
    const base = item.newName.trim();
    if (nameCount[base] > 1) {
      nameUsed[base] = (nameUsed[base] || 0) + 1;
      resolvedNames[item.id] = `${base}-${nameUsed[base]}`;
    } else {
      resolvedNames[item.id] = base;
    }
  }

  for (const item of items) {
    const finalName = resolvedNames[item.id];
    if (!finalName) {
      result.skipped++;
      continue;
    }

    const node = figma.getNodeById(item.id) as SceneNode | null;
    if (!node) {
      result.errors.push(`Node ${item.id} not found`);
      continue;
    }

    if ("locked" in node && node.locked) {
      result.locked++;
      continue;
    }

    try {
      node.name = finalName;
      result.renamed++;
    } catch (e) {
      result.errors.push(`Failed to rename "${node.name}": ${e}`);
    }
  }

  return result;
}

figma.ui.onmessage = (msg: { type: string; payload?: unknown }) => {
  if (msg.type === "get-selection") {
    figma.ui.postMessage({ type: "selection-data", payload: getSelectionData() });
    return;
  }

  if (msg.type === "apply-rename") {
    const items = msg.payload as RenameItem[];
    const result = applyRenames(items);
    figma.ui.postMessage({ type: "apply-result", payload: result });
    return;
  }

  if (msg.type === "notify") {
    const { message, error } = msg.payload as { message: string; error?: boolean };
    figma.notify(message, { error: !!error });
    return;
  }
};

figma.on("selectionchange", () => {
  figma.ui.postMessage({ type: "selection-data", payload: getSelectionData() });
});

// Send initial selection on load
figma.ui.postMessage({ type: "selection-data", payload: getSelectionData() });
