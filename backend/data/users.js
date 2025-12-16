//import mongo collections, bcrypt and implement the following data functions
import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import {users, teams} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import sports from "../shared/enums/sports.js";
import statesCities from '../shared/data/US_States_and_Cities.json' with { type: 'json' };

export const register = async (
  username,
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
  confirmPassword,
  state,
  city,
  birthday,
  advancedSports,
  intermediateSports,
  beginnerSports
) => {

  console.log(username, firstName, lastName, email, phoneNumber, password, confirmPassword, state, city, birthday, advancedSports, intermediateSports, beginnerSports);
  const newUserName = helper.validUsername(username);
  const newFirstName = helper.validName(firstName, "First");
  const newLastName = helper.validName(lastName, "Last");
  const newPassword = helper.validPassword(password);
  helper.matchingPassword(newPassword, confirmPassword);
  const newEmail = helper.validEmail(email);
  const newNumber = helper.validNumber(phoneNumber)
  const newState = helper.validText(state, "state")
  if (!statesCities[newState]) throw 'Invalid state'
  const newCity = helper.validText(city, "city")
  if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
  const birthdate = helper.validBday(birthday)

  if (!advancedSports || !Array.isArray(advancedSports) || !intermediateSports || !Array.isArray(intermediateSports) || !beginnerSports || !Array.isArray(beginnerSports)) throw "One sports array was not provided.";
  if((intermediateSports.length + beginnerSports.length + advancedSports.length) === 0) throw "You must select at least one sport.";
    
  for (const sport of advancedSports) {
    const newSport = helper.validText(sport)
    if (!sports.includes(newSport)) throw `Invalid sport`;
  }
  for (const sport of intermediateSports) {
    const newSport = helper.validText(sport)
    if (!sports.includes(newSport)) throw `Invalid sport`;
  }
  for (const sport of beginnerSports) {
    const newSport = helper.validText(sport)
    if (!sports.includes(newSport)) throw `Invalid sport`;
  }

  const userCollection = await users();
  const existingUser = await userCollection.findOne({ 
    $or: [
      { username: { $regex: `^${newUserName}$`, $options: "i" } },
      { phoneNumber: { $regex: `^${newNumber}$`, $options: "i" } },
      { email: { $regex: `^${newEmail}$`, $options: "i" } }
    ]
  });

  if (existingUser) throw "User with this username, number, or email already in use";

  const saltRounds = 16;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const {lat, lon} = await helper.getCoords(newCity, newState)
  const location = {
    type: "Point",
    coordinates: [lon, lat]
  }

  const newUser = {
    username: newUserName,
    firstName: newFirstName,
    lastName: newLastName,
    email: newEmail.toLowerCase(),
    phoneNumber: newNumber,
    password: hashedPassword,
    state,
    city,
    birthday: birthdate,
    advancedSports,
    intermediateSports,
    beginnerSports,
    location,
    teamInvites: [],
    createdAt: new Date()
  };

  const userInsert = await userCollection.insertOne(newUser);
  if (!userInsert.acknowledged || !userInsert.insertedId) throw "Could not add user";

  return {
    _id: userInsert.insertedId,
    username: newUser.username,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    phoneNumber: newUser.phoneNumber,
    email: newUser.email,
    state: newUser.state,
    city: newUser.city,
    birthday: newUser.birthday,
    advancedSports: newUser.advancedSports,
    intermediateSports: newUser.intermediateSports,
    beginnerSports: newUser.beginnerSports
  };

};

export const login = async (username, password) => {

    const userCollection = await users();
    let user = await userCollection.findOne({username:{$regex:`^${username}$`,$options:'i'} });
    if (!user || user === null) throw 'Either the username or password is invalid';

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) throw 'Either the username or password is invalid';

    return {_id: user._id, name: user.name,
      username: user.username
    };
};

export const getUserById = async (userId) => {
    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'invalid object ID';
        
    const userCollection = await users();
   
    const user = await userCollection.findOne({_id: new ObjectId(userId)});
    if (!user) throw 'No user with that id';
    user._id = user._id.toString();
    return user;
};

export const getAllUsers = async () => {
    
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    
    return userList;
};

// Searches for users by name (username, first or last name), distance, sport, experience level
export const getUsersByFilters = async (userId, name, distance, sport, skillLevel = "any") => {
  const user = await getUserById(userId);
  const [lon, lat] = user.location.coordinates;
  const distanceMeters = distance ? distance * 1609.34 : undefined;
  const andConditions = [];
  const userCollection = await users();

  // Base query
  const query = {}; 

  // Skill Level
  const skills = {
    any: "any",
    advanced: "advancedSports",
    intermediate: "intermediateSports",
    beginner: "beginnerSports"
  };

  if (!skills[skillLevel]) throw "Invalid skill level";
  const skill = skills[skillLevel];
  if (skill !== "any") {
    query[`${skill}.0`] = { $exists: true }; // has at least one sport
  } else if (skill === "any" && !sport) {
    andConditions.push({
        $or: [
            { "advancedSports.0": { $exists: true } },
            { "intermediateSports.0": { $exists: true } },
            { "beginnerSports.0": { $exists: true } }
        ]
    });
  }
  
  // Sport
  if (sport) {
    if (skill === "any") {
      andConditions.push({
            $or: [
                { advancedSports: { $regex: sport, $options: "i" } },
                { intermediateSports: { $regex: sport, $options: "i" } },
                { beginnerSports: { $regex: sport, $options: "i" } }
            ]
        });
    } else {
        andConditions.push({ [skill]: { $regex: sport, $options: "i" } });
    }
    
  }

  // Name
  if (name) {
    andConditions.push({
        $or: [
            { username: { $regex: name, $options: "i" } },
            { firstName: { $regex: name, $options: "i" } },
            { lastName: { $regex: name, $options: "i" } }
        ]
    });
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  // Distance
  if (distanceMeters) {
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [lon, lat] },
        $maxDistance: distanceMeters
      }
    };
  }

  const userList = await userCollection.find(query).toArray();
  return userList;
};

// Have to make sure ALL fields are filled for edit, we fill in the values as placeholders based on the user in session
export const updateUser = async(
        userId, 
        username,
        email,
        phoneNumber,
        firstName,
        lastName,
        birthday,
        state,
        city,
        advancedSports,
        intermediateSports,
        beginnerSports,
        user) => {

    const newFirstName = helper.validName(firstName, "First");
    const newLastName = helper.validName(lastName, "Last");
    const newUserName = helper.validUsername(username);
    const newPassword = helper.validPassword(password);
    helper.matchingPassword(newPassword, confirmPassword);
    const newEmail = helper.validEmail(email);
    const newNumber = helper.validNumber(phoneNumber)
    const newState = helper.validText(state, "state")
    if (!statesCities[newState]) throw 'Invalid state'
    const newCity = helper.validText(city, "city")
    if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
    const birthdate = helper.validBday(birthday)

    if (!advancedSports || !Array.isArray(advancedSports) || !intermediateSports || !Array.isArray(intermediateSports) || !beginnerSports || !Array.isArray(beginnerSports)) throw "One sports array was not provided.";
    if((intermediateSports.length + beginnerSports.length + advancedSports.length) === 0) throw "You must select at least one sport.";
    
    for (const sport of advancedSports) {
      const newSport = helper.validText(sport)
      if (!sports.includes(newSport)) throw `Invalid sport`;
    }
    for (const sport of intermediateSports) {
      const newSport = helper.validText(sport)
      if (!sports.includes(newSport)) throw `Invalid sport`;
    }
    for (const sport of beginnerSports) {
      const newSport = helper.validText(sport)
      if (!sports.includes(newSport)) throw `Invalid sport`;
    }


    const {lat, lon} = await helper.getCoords(newCity, newState)
    const location = {
      type: "Point",
      coordinates: [lon, lat]
    }

    const userCollection = await users();
    const existingUser = await userCollection.findOne({ 
      $or: [
        { username: { $regex: `^${newUserName}$`, $options: "i" } },
        { phoneNumber: { $regex: `^${newNumber}$`, $options: "i" } },
        { email: { $regex: `^${newEmail}$`, $options: "i" } }
      ]
    });

    if (existingUser) throw "User with this username, number, or email already in use";

    const updatedUserData = {
      username: newUserName,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail.toLowerCase(),
      phoneNumber: newNumber,
      state,
      city,
      birthday: birthdate,
      advancedSports,
      intermediateSports,
      beginnerSports,
      location,
      updatedAt: new Date()
    };

    const userExists = await getUserById(userId);
    if (!userExists || userExists === null) throw 'user not found';

    if (userExists._id.toString() !== user._id.toString()) throw 'User did not create this account and cannot update it'

    let newUser = await userCollection.findOneAndUpdate(
      {_id: new ObjectId(userId)},
      {$set: updatedUserData},
      {returnDocument: 'after'}
    );
    if (!newUser) throw `Could not update the account with id ${userId}`;

    return newUser;

}

export const deleteUser = async (userId, user) => {

    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

    const userCollection = await users();
    const teamCollection = await teams();

    const userExists = await userCollection.findOne({_id: new ObjectId(userId)});

    if (!userExists) throw 'user not found';
    if (userExists._id.toString() !== user._id.toString()) throw 'User did not create this account and cannot delete it'
    
    await userCollection.deleteOne({ _id: new ObjectId(userId) });

    // Team Cleanup

    await teamCollection.deleteMany({ owner: ObjectId(userId)});

    await teamCollection.updateMany(
        { "joinRequests.userId": new ObjectId(userId) },
        { 
            $pull: {
                joinRequests: { userId: new ObjectId(userId) }
            }
        }
    );

    await teamCollection.updateMany(
        { members: new ObjectId(userId) },
        {
            $pull: { members: new ObjectId(userId) }
        }
    );

    return { deleted: userId };

};

// Invite Request Handling

export const sendTeamInvite = async (userId, teamId) => {
    userId = helper.validText(userId, 'user ID');
    teamId = helper.validText(teamId, 'team ID');

    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

    const userCollection = await users();
    const teamCollection = await teams();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found';

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (user.teamInvites && user.teamInvites.length > 0) {
      if (user.teamInvites.some(inv => inv.teamId.toString() === teamId.toString())) throw 'Invite already sent';
    }
    if (team.members.some(m => m.toString() === userId.toString())) throw 'User is already a member of the team';
    
    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { teamInvites: { _id: new ObjectId(), teamId: new ObjectId(teamId), team: team, requestedAt: new Date() } } }
    );

    return { invited: userId, team: team };
};

export const removeTeamInvite = async (userId, teamId) => {
    userId = helper.validText(userId, 'user ID');
    teamId = helper.validText(teamId, 'team ID');

    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

    const userCollection = await users();
    const teamCollection = await teams();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found'; 

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (!user.teamInvites.some(inv => inv.teamId.toString() === teamId.toString())) throw 'Invite was never sent';
    
    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { teamInvites: { teamId: new ObjectId(teamId) } } }
    );

    return { removed: userId, teamId };
};

export const getPendingTeamInvites = async (userId) => {
  
  userId = helper.validText(userId, 'user ID');
  if (!ObjectId.isValid(userId)) throw 'invalid object ID';

  const userCollection = await users();
  const teamCollection = await teams();
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw 'User not found';
  if (!user.teamInvites || user.teamInvites.length === 0) {
      return [];
  }
  
  return user.teamInvites;
};

export const acceptTeamInvite = async (userId, teamId) => {
  userId = helper.validText(userId, 'user ID');
  teamId = helper.validText(teamId, 'team ID');

  if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
  if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

  const userCollection = await users();
  const teamCollection = await teams();

  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw 'User not found';

  const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
  if (!team) throw 'Team not found';

  if (!user.teamInvites || !user.teamInvites.some(inv => inv.teamId.toString() === teamId.toString())) throw 'Invite not found';

  if (team.members.some(m => (m && m.userId ? m.userId.toString() : m.toString()) === userId.toString())) throw 'User is already a member of the team';

  await teamCollection.updateOne(
    { _id: new ObjectId(teamId) },
    { $push: { members: new ObjectId(userId) }, $pull: { joinRequests: { userId: new ObjectId(userId) } } }
  );

  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { teamInvites: { teamId: new ObjectId(teamId) } } }
  );

  return { user: user, team: team };
}