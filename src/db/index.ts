/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// MOCKED — in-memory Drizzle-compatible store (better-sqlite3 stripped for AI Studio runtime)
const tables = new Map<any, Record<string, any>[]>();

function getTableRows(table: any): Record<string, any>[] {
  if (!tables.has(table)) {
    tables.set(table, []);
  }
  return tables.get(table)!;
}

function resolveColumnKey(table: any, col: any): string | null {
  if (!col) return null;
  if (table && typeof table === 'object') {
    for (const [jsKey, colDef] of Object.entries(table)) {
      if (colDef === col) return jsKey;
    }
  }
  return col.name ?? null;
}

function matchesCondition(table: any, row: Record<string, any>, condition: any): boolean {
  if (!condition) return true;
  const chunks = condition.queryChunks;
  if (!Array.isArray(chunks)) return true;

  // Handle drizzle eq(col, value)
  let colObj: any = null;
  let paramObj: any = null;
  for (const chunk of chunks) {
    if (chunk && typeof chunk === 'object') {
      if ('table' in chunk && 'name' in chunk) {
        colObj = chunk;
      } else if ('value' in chunk && chunk.constructor?.name !== 'StringChunk') {
        paramObj = chunk;
      }
    }
  }

  if (colObj && paramObj !== null) {
    const key = resolveColumnKey(table, colObj);
    if (key) {
      return row[key] === paramObj.value;
    }
  }

  return true;
}

export const db: any = {
  select() {
    return {
      from(table: any) {
        const rows = getTableRows(table);
        const query = {
          where(condition: any) {
            const filtered = rows.filter((r) => matchesCondition(table, r, condition));
            return {
              all: () => filtered,
              get: () => filtered[0],
            };
          },
          all: () => [...rows],
          get: () => rows[0],
        };
        return query;
      },
    };
  },
  insert(table: any) {
    return {
      values(data: Record<string, any> | Record<string, any>[]) {
        return {
          run() {
            const rows = getTableRows(table);
            const items = Array.isArray(data) ? data : [data];
            rows.push(...items);
            return { changes: items.length };
          },
        };
      },
    };
  },
  update(table: any) {
    return {
      set(patch: Record<string, any>) {
        return {
          where(condition: any) {
            return {
              run() {
                const rows = getTableRows(table);
                let changes = 0;
                for (const row of rows) {
                  if (matchesCondition(table, row, condition)) {
                    Object.assign(row, patch);
                    changes++;
                  }
                }
                return { changes };
              },
            };
          },
        };
      },
    };
  },
  delete(table: any) {
    return {
      where(condition: any) {
        return {
          run() {
            const rows = getTableRows(table);
            const before = rows.length;
            const kept = rows.filter((r) => !matchesCondition(table, r, condition));
            tables.set(table, kept);
            return { changes: before - kept.length };
          },
        };
      },
    };
  },
};

export function initDatabase() {
  console.log('[Database] In-memory mock database initialized (AI Studio runtime)');
}
