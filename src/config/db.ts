import colors from "colors";
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL);
        console.log(
            colors.magenta.bold(
                `Database connected on port: ${connection.connection.port}`
            )
        );
    } catch (error) {
        console.log(
            colors.red.bold(
                `Connection error to the database: ${error.message}`
            )
        );
    }
};
