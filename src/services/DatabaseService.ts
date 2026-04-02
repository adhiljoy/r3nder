import { config } from "@config/index";
import { DatabaseUtils } from "@database/utils/database";


export class DatabaseService {
    private dbConfig = {
        maxRetries: 3,
        retryDelay: 5000,
        dbName: "r3nder",
    };

    constructor() {}

    /**
     * Connect to MongoDB with validation, retry logic and startup blocking
     */
    public async connect(): Promise<void> {
        await DatabaseUtils.connect(
            config.MONGO_URI,
            "Database-Bot",
            this.dbConfig
        );
    }
}
