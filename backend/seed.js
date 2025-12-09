import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { dbConnection, closeConnection } from './config/mongoConnection.js';
import { users, teams, games } from './config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const LUKE_ID = new ObjectId();
const BILLY_ID = new ObjectId();
const MARIA_ID = new ObjectId();
const AIDEN_ID = new ObjectId();
const SOPHIA_ID = new ObjectId();
const RAJ_ID = new ObjectId();

const saltRounds = 16;
const hashedPassword = await bcrypt.hash('password', saltRounds);


const seedUsers = [
  {
    _id: LUKE_ID,
    username: 'skywalker_luke',
    firstName: 'Luke',
    lastName: 'Sky',
    email: 'luke@example.com',
    phoneNumber: '1234567890',
    password: hashedPassword,
    state: 'CA',
    city: 'San Francisco',
    birthday: '1990-01-01',
    advancedSports: ['Basketball', 'Other'],
    intermediateSports: ['Tennis'],
    beginnerSports: ['Volleyball'],
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] } 
  },
  {
    _id: BILLY_ID,
    username: 'billb34n',
    firstName: 'Billy',
    lastName: 'Bean',
    email: 'billy@example.com',
    phoneNumber: '0987654321',
    password: hashedPassword,
    state: 'NY',
    city: 'New York',
    birthday: '1992-02-02',
    advancedSports: ['Soccer'],
    intermediateSports: ['Softball', 'Tennis'],
    beginnerSports: [],
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] } 
  },
  {
    _id: MARIA_ID,
    username: 'mariaaa',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    email: 'maria@example.com',
    phoneNumber: '5551112222',
    password: hashedPassword,
    state: 'TX',
    city: 'Austin',
    birthday: '1988-03-15',
    advancedSports: ['Badminton', 'Pickleball'],
    intermediateSports: ['Other'],
    beginnerSports: ['Soccer'],
    location: { type: 'Point', coordinates: [-97.7431, 30.2672] } 
  },
  {
    _id: AIDEN_ID,
    username: 'aj321',
    firstName: 'Aiden',
    lastName: 'Jones',
    email: 'aiden@example.com',
    phoneNumber: '5552223333',
    password: hashedPassword,
    state: 'IL',
    city: 'Chicago',
    birthday: '1995-07-10',
    advancedSports: ['Basketball'],
    intermediateSports: ['Ultimate Frisbee', 'Softball'],
    beginnerSports: ['Football', 'Other'],
    location: { type: 'Point', coordinates: [-87.6298, 41.8781] } 
  },
  {
    _id: SOPHIA_ID,
    username: 'soph14',
    firstName: 'Sophia',
    lastName: 'Lee',
    email: 'sophia@example.com',
    phoneNumber: '5553334444',
    password: hashedPassword,
    state: 'WA',
    city: 'Seattle',
    birthday: '1993-11-22',
    advancedSports: ['Tennis'],
    intermediateSports: ['Other'],
    beginnerSports: ['Soccer', 'Badminton'],
    location: { type: 'Point', coordinates: [-122.335167, 47.608013] } 
  },
  {
    _id: RAJ_ID,
    username: 'raj_patel',
    firstName: 'Raj',
    lastName: 'Patel',
    email: 'raj@example.com',
    phoneNumber: '5554445555',
    password: hashedPassword,
    state: 'NJ',
    city: 'Jersey City',
    birthday: '1991-05-05',
    advancedSports: ['Other'],
    intermediateSports: ['Soccer'],
    beginnerSports: ['Football'],
    location: { type: 'Point', coordinates: [-74.0776, 40.7178] } 
  }
];

const CA_TEAM_ID = new ObjectId();
const NY_TEAM_ID = new ObjectId();
const TX_TEAM_ID = new ObjectId();
const IL_TEAM_ID = new ObjectId();


const seedTeams = [
  {
    _id: CA_TEAM_ID,
    teamName: "Golden Gate Ballers",
    description: "A competitive basketball group in San Francisco open to advanced players looking for weekly scrimmages.",
    owner: LUKE_ID,
    state: "CA",
    city: "San Francisco",
    preferredSports: ["Basketball"],
    experience: "Advanced",
    location: { type: "Point", coordinates: [-122.4194, 37.7749] },
    members: [{ userId: LUKE_ID, requestedAt: new Date() }],
    joinRequests: [],
    createdAt: new Date()
  },

  {
    _id: NY_TEAM_ID,
    teamName: "NYC Thunder FC",
    description: "A friendly, competitive soccer team for intermediate-level players across New York City.",
    owner: BILLY_ID,
    state: "NY",
    city: "New York",
    preferredSports: ["Soccer"],
    experience: "Intermediate",
    location: { type: "Point", coordinates: [-74.0060, 40.7128] },
    members: [{ userId: BILLY_ID, requestedAt: new Date() }],
    joinRequests: [],
    createdAt: new Date()
  },

  {
    _id: TX_TEAM_ID,
    teamName: "Austin Racqueteers",
    description: "A dedicated badminton and pickleball team for advanced players in Austin.",
    owner: MARIA_ID,
    state: "TX",
    city: "Austin",
    preferredSports: ["Badminton", "Pickleball"],
    experience: "Advanced",
    location: { type: "Point", coordinates: [-97.7431, 30.2672] },
    members: [{ userId: MARIA_ID, requestedAt: new Date() }],
    joinRequests: [],
    createdAt: new Date()
  },

  {
    _id: IL_TEAM_ID,
    teamName: "Chicago Flyers",
    description: "A fun community team combining Ultimate Frisbee and Softball for intermediate players in Chicago.",
    owner: AIDEN_ID,
    state: "IL",
    city: "Chicago",
    preferredSports: ["Ultimate Frisbee", "Softball"],
    experience: "Intermediate",
    location: { type: "Point", coordinates: [-87.6298, 41.8781] },
    members: [{ userId: AIDEN_ID, requestedAt: new Date() }],
    joinRequests: [],
    createdAt: new Date()
  }
];

const seedGames = [
  {
    team1: { _id: CA_TEAM_ID, score: 72 },
    team2: { _id: new ObjectId(TX_TEAM_ID), score: 65 },
    sport: "Basketball",
    state: "CA",
    city: "San Francisco",
    score1: 72,
    score2: 65,
    location: { type: "Point", coordinates: [-122.4194, 37.7749] },
    date: new Date("2025-01-12T14:00:00"),
    createdAt: new Date()
  },

  {
    team1: { _id: NY_TEAM_ID, score: 3 },
    team2: { _id: new ObjectId(IL_TEAM_ID), score: 2 },
    sport: "Soccer",
    state: "NY",
    city: "New York",
    location: { type: "Point", coordinates: [-74.0060, 40.7128] },
    date: new Date("2025-02-05T18:30:00"),
    createdAt: new Date()
  },

  {
    team1: { _id: TX_TEAM_ID, score: 21 },
    team2: { _id: new ObjectId(IL_TEAM_ID), score: 18 },
    sport: "Badminton",
    state: "TX",
    city: "Austin",
    location: { type: "Point", coordinates: [-97.7431, 30.2672] },
    date: new Date("2025-03-20T16:00:00"),
    createdAt: new Date()
  },

  {
    team1: { _id: new ObjectId(IL_TEAM_ID), score: 10 },
    team2: { _id: new ObjectId(NY_TEAM_ID), score: 8 },
    sport: "Ultimate Frisbee",
    state: "IL",
    city: "Chicago",
    location: { type: "Point", coordinates: [-87.6298, 41.8781] },
    date: new Date("2025-04-01T15:00:00"),
    createdAt: new Date()
  }
];

const seed = async () => {
  try {
    await dbConnection();
    const userCollection = await users();
    const teamCollection = await teams();
    const gameCollection = await games();

    // Remove comment if you want to delete the collections and only include dummy data
    //await userCollection.deleteMany({});
    //await teamCollection.deleteMany({});
    //await gameCollection.deleteMany({});
    let res = await userCollection.insertMany(seedUsers);
    console.log(`Inserted ${Object.keys(res.insertedIds).length} users.`);
    
    res = await teamCollection.insertMany(seedTeams);
    console.log(`Inserted ${Object.keys(res.insertedIds).length} teams.`);

    res = await gameCollection.insertMany(seedGames);
    console.log(`Inserted ${Object.keys(res.insertedIds).length} games.`);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await closeConnection();
    process.exit();
  }
};

seed();