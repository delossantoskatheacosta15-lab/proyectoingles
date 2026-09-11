import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export type StoreSettings = Record<string, string>;

// LEE LA CONFIGURACIÓN DE LA TIENDA COMBINADA CON LOS VALORES POR DEFECTO
export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const stored: StoreSettings = {};
  rows.forEach((r) => {
    stored[r.key] = r.value;
  });
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key] ?? fallback;
}

export async function getNumericSetting(key: string, fallback = 0): Promise<number> {
  const value = await getSetting(key, String(fallback));
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function setSettings(values: Record<string, string>): Promise<void> {
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }
}
