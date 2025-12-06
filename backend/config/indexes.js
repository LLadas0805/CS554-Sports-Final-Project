import { users, teams, games } from "./mongoCollections.js";

export const initIndexes = async () => {
    const userCollection = await users();
    const teamCollection = await teams();
    const gamesCollection = await games();
    await userCollection.createIndex({ location: "2dsphere" });
    await teamCollection.createIndex({ location: "2dsphere" });
    await gamesCollection.createIndex({location: "2dsphere" });
};
