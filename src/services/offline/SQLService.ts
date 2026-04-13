import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export class SQLService {
  private sqlite: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isWeb: boolean = Capacitor.getPlatform() === 'web';
  private dbName: string = 'busconnect_offline';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    // CRITICAL: Initialize with a dummy mock to prevent early crashes
    this.activateMockDb();
  }

  async initialize(): Promise<void> {
    try {
      if (this.isWeb) {
        console.warn('SQLService: Web mode. Checking for jeep-sqlite...');
        const jeepSqlite = document.querySelector('jeep-sqlite');
        if (!jeepSqlite) {
          console.warn('SQLService: jeep-sqlite not found. Using mock persistence.');
          return; // Stay with mock
        }
      }

      const isConnection = await this.sqlite!.isConnection(this.dbName, false);
      let newDb: SQLiteDBConnection;
      
      if (isConnection.result) {
        newDb = await this.sqlite!.retrieveConnection(this.dbName, false);
      } else {
        newDb = await this.sqlite!.createConnection(this.dbName, false, 'no-encryption', 1, false);
      }
      
      await newDb.open();
      this.db = newDb; // Only update if open succeeded

      await this.createTables();
      console.log('SQLService: Real database initialized.');
    } catch (err) {
      console.error('SQLService: Initialization error (Staying on mock):', err);
    }
  }

  private activateMockDb(): void {
    if (!this.db) {
      console.warn('SQLService: Initializing Mock Fallback');
      this.db = {
        execute: async () => ({ changes: { changes: 0 } }),
        query: async () => ({ values: [] }),
        run: async () => ({ changes: { changes: 0 } }),
        open: async () => {},
        close: async () => {},
        isMock: true // Helper flag
      } as any;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db || (this.db as any).isMock) return;
    try {
        const queries = [
            `CREATE TABLE IF NOT EXISTS sync_queue (
              id TEXT PRIMARY KEY,
              type TEXT NOT NULL,
              payload TEXT NOT NULL,
              priority TEXT NOT NULL,
              timestamp INTEGER NOT NULL,
              status TEXT DEFAULT 'pending',
              attempts INTEGER DEFAULT 0
            );`,
            `CREATE TABLE IF NOT EXISTS bookings (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              bus_id TEXT NOT NULL,
              source_stop_id TEXT NOT NULL,
              destination_stop_id TEXT NOT NULL,
              fare REAL NOT NULL,
              status TEXT DEFAULT 'locally_created',
              created_at INTEGER NOT NULL,
              operation_id TEXT UNIQUE
            );`
        ];
        for (const query of queries) {
            await this.db!.execute(query);
        }
    } catch (e) {
        console.error("SQLService: Table creation failed", e);
    }
  }

  async execute(query: string, params: any[] = []): Promise<any> {
    try {
        return await this.db!.run(query, params);
    } catch (e) {
        console.error("SQLService: Execute failed", e);
        return { changes: { changes: 0 } };
    }
  }

  async query(query: string, params: any[] = []): Promise<any> {
    try {
        return await this.db!.query(query, params);
    } catch (e) {
        console.error("SQLService: Query failed", e);
        return { values: [] };
    }
  }

  async close(): Promise<void> {
    if (this.db && !(this.db as any).isMock) {
      await this.sqlite!.closeConnection(this.dbName, false);
      this.activateMockDb();
    }
  }
}

export const sqlService = new SQLService();


