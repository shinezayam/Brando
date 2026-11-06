import Dexie from 'dexie';
import type { BrandAsset } from '@/types';

export class AssetsDatabase extends Dexie {
  assets!: Dexie.Table<BrandAsset & { projectId: string; dataUrl?: string }, string>;

  constructor() {
    super('BrandoAssets');
    this.version(1).stores({
      assets: 'id, projectId, type, name, favorite, createdAt',
    });
  }
}

export const assetsDb = new AssetsDatabase();

export async function getProjectAssets(projectId: string): Promise<(BrandAsset & { dataUrl?: string })[]> {
  return assetsDb.assets.where('projectId').equals(projectId).reverse().sortBy('createdAt');
}

export async function addAsset(
  projectId: string,
  asset: BrandAsset,
  dataUrl?: string
): Promise<void> {
  await assetsDb.assets.add({ ...asset, projectId, dataUrl });
}

export async function updateAsset(
  id: string,
  updates: Partial<BrandAsset>
): Promise<void> {
  await assetsDb.assets.update(id, updates);
}

export async function deleteAsset(id: string): Promise<void> {
  await assetsDb.assets.delete(id);
}

export async function duplicateAsset(id: string): Promise<string> {
  const original = await assetsDb.assets.get(id);
  if (!original) throw new Error('Asset not found');
  const newId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await assetsDb.assets.add({
    ...original,
    id: newId,
    name: `${original.name} (copy)`,
    createdAt: new Date().toISOString(),
  });
  return newId;
}
