import { createRxDatabase, RxDatabase, RxCollection, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { v4 as uuidv4 } from 'uuid';
import { getPosProducts } from '@/server-actions/pos/products';
import { syncPosOrder } from '@/server-actions/pos/orders';

// --- Types ---
export type ProductDoc = {
    id: string;
    name: string;
    price: number;
    category: string;
    sku: string;
};

export type OrderDoc = {
    id: string;
    items: { productId: string; quantity: number; price: number }[];
    total: number;
    timestamp: number;
    synced: boolean;
};

// --- Schemas ---
const productSchema: RxJsonSchema<ProductDoc> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        sku: { type: 'string' }
    },
    required: ['id', 'name', 'price']
};

const orderSchema: RxJsonSchema<OrderDoc> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number' },
                    price: { type: 'number' }
                }
            }
        },
        total: { type: 'number' },
        timestamp: { type: 'number' },
        synced: { type: 'boolean' }
    },
    required: ['id', 'items', 'total']
};

// --- Database ---
type MyDatabaseCollections = {
    products: RxCollection<ProductDoc>;
    orders: RxCollection<OrderDoc>;
};

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

const _createDatabase = async (): Promise<MyDatabase> => {
    console.log("Database creating...");
    const db = await createRxDatabase<MyDatabaseCollections>({
        name: 'alexcoposdb',
        storage: getRxStorageDexie()
    });

    await db.addCollections({
        products: { schema: productSchema },
        orders: { schema: orderSchema }
    });

    console.log("Database created");
    return db;
};

export const getDatabase = (): Promise<MyDatabase> => {
    if (!dbPromise) dbPromise = _createDatabase();
    return dbPromise;
};

// --- Sync Logic ---
export const syncProducts = async () => {
    const db = await getDatabase();

    // FETCH FROM SERVER
    console.log("Syncing Products from Server...");
    try {
        const serverProducts = await getPosProducts();

        // Bulk Upsert
        if (serverProducts.length > 0) {
            await db.products.bulkUpsert(serverProducts);
            console.log(`Synced ${serverProducts.length} products`);
        }
    } catch (error) {
        console.error("Sync Failed (Optimistic Offline Mode)", error);
    }
};

export const syncOrdersOutbox = async () => {
    const db = await getDatabase();

    // Find unsynced orders
    const unsynced = await db.orders.find({
        selector: { synced: false }
    }).exec();

    console.log(`Found ${unsynced.length} unsynced orders`);

    for (const orderDoc of unsynced) {
        const orderData = orderDoc.toJSON();

        // PUSH TO SERVER
        const result = await syncPosOrder(orderData);

        if (result.success) {
            await orderDoc.patch({ synced: true });
            console.log(`Order ${orderData.id} synced successfully`);
        } else {
            console.error(`Order ${orderData.id} failed to sync`);
        }
    }
};
