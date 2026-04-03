import mongoose from "mongoose";

export interface DBConfig {
    maxRetries: number;
    retryDelay: number;
    dbName: string;
}

export class DatabaseUtils {
    /**
     * Sanitizes a MongoDB URI by masking the password for safe logging.
     */
    public static sanitizeURI(uri: string): string {
        try {
            const url = new URL(uri);
            if (url.password) {
                url.password = "****";
            }
            return url.toString();
        } catch {
            // If URL parsing fails, attempt manual masking
            return uri.replace(/:(.*?)@/, ":****@");
        }
    }

    /**
     * Validates the MongoDB URI for placeholders or common mistakes.
     */
    public static validateURI(uri: string): { valid: boolean; error?: string } {
        const placeholders = ["<db_password>", "YOUR_PASSWORD", "your_password", "YOUR_REAL_PASSWORD", "username:password"];
        
        for (const placeholder of placeholders) {
            if (uri.includes(placeholder)) {
                return { 
                    valid: false, 
                    error: `URI contains placeholder value: "${placeholder}"` 
                };
            }
        }

        if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
            return { 
                valid: false, 
                error: "Invalid MongoDB scheme. Expected 'mongodb://' or 'mongodb+srv://'" 
            };
        }

        return { valid: true };
    }

    /**
     * Prints developer guidance for MongoDB Atlas setup.
     */
    public static printGuidance(): void {
        console.log("\n" + "=".repeat(60));
        console.log("🛠️  MONGO DATABASE SETUP GUIDANCE");
        console.log("=".repeat(60));
        console.log("1. Go to MongoDB Atlas: https://cloud.mongodb.com/");
        console.log("2. Navigate to Clusters -> Connect -> Drivers");
        console.log("3. Select Node.js and copy the connection string.");
        console.log("4. Update your .env file MONGO_URI with the string.");
        console.log("5. IMPORTANT: Replace '<db_password>' with your real password.");
        console.log("6. Ensure your IP is whitelisted in Network Access.");
        console.log("=".repeat(60) + "\n");
    }

    /**
     * Connects to MongoDB with validation and retry logic.
     */
    public static async connect(uri: string, context: string, config: DBConfig): Promise<void> {
        const validation = this.validateURI(uri);
        if (!validation.valid) {
            console.error(`\n❌ [DB ERROR] [${context}] Invalid MongoDB URI: ${validation.error}`);
            this.printGuidance();
            process.exit(1);
        }

        const sanitizedUri = this.sanitizeURI(uri);
        let attempt = 1;

        while (attempt <= config.maxRetries) {
            try {
                console.log(`[${context}] Connecting to MongoDB... (Attempt ${attempt}/${config.maxRetries})`);
                console.log(`[${context}] Host: ${sanitizedUri}`);

                await mongoose.connect(uri, {
                    dbName: config.dbName,
                });

                console.log(`✅ [${context}] Connected Successfully`);
                return;
            } catch (error: any) {
                console.error(`❌ [${context}] Connection Attempt ${attempt} Failed:`, error.message);
                
                if (attempt === config.maxRetries) {
                    console.error(`🚨 [${context}] Maximum connection retries reached.`);
                    this.printGuidance();
                    process.exit(1);
                }

                console.log(`[${context}] Retrying in ${config.retryDelay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                attempt++;
            }
        }
    }
}
