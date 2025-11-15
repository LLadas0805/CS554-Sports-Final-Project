//import mongo collections, bcrypt and implement the following data functions
import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import { sports } from "../../shared/enums/sports.js";
import { skills } from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

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
  preferredSports,
  experience
) => {

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

  if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Preferred sports must be a non-empty array";

  for (const sport of preferredSports) {
    const newSport = helper.validText(sport)
    if (!sports.includes(newSport)) throw `Invalid sport`;
  }

  const newExperience = helper.validText(experience, "skill level")
  if (!skills.includes(newExperience)) throw 'Skill level not listed'

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
    preferredSports,
    experience,
    location
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
    preferredSports: newUser.preferredSports,
    experience: newUser.experience,
  };

};

export const login = async (username, password) => {

    helper.validUsername(username);
    const newPassword = helper.validPassword(password);

    const userCollection = await users();
    let user = await userCollection.findOne({username:{$regex:`^${username}$`,$options:'i'} });
    if (!user || user === null) throw 'Either the username or password is invalid';

    const comparePassword = await bcrypt.compare(newPassword, user.password);
    if (!comparePassword) throw 'Either the username or password is invalid';

    return {_id: user._id, name: user.name,
      username: user.username
    };
};

export const getUserById = async (userId) => {
    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'invalid object ID';
        
    const userCollection = await users();
   
    const user = await userCollection.findOne({_id: new ObjectId(blogId)});
    if (!user) throw 'No blog with that id';
    user._id = user._id.toString();
    return user;
};

export const getAllUsers = async () => {
    
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if (!userList) throw 'Could not get any blogs';
    
    return userList;
};

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
        preferredSports,
        experience, 
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

    if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Preferred sports must be a non-empty array";

    for (const sport of preferredSports) {
      const newSport = helper.validText(sport)
      if (!sports.includes(newSport)) throw `Invalid sport`;
    }

    const newExperience = helper.validText(experience, "skill level")
    if (!skills.includes(newExperience)) throw 'Skill level not listed'

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
      preferredSports,
      experience,
      location
    };

    const userExists = await getUserById(userId);
    if (!userExists || userExists === null) throw 'user not found';

    if (userExists._id.toString() !== user._id.toString()) throw 'User did not create this account and cannot update it'

    let newUser = await userCollection.findOneAndUpdate(
      {_id: new ObjectId(userId)},
      {$set: updatedUserData},
      {returnDocument: 'after'}
    );
    if (!newUser) throw `Could not update the account with id ${blogId}`;

    return newUser;

}

export const deleteComment = async (userId, user) => {

    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

    const userCollection = await users();
 
    const userExists = await userCollection.findOne({_id: new ObjectId(userId)});

    if (!userExists) throw 'user not found';
    if (userExists._id.toString() !== user._id.toString()) throw 'User did not create this account and cannot update it'
    
    await userCollection.deleteOne({ _id: new ObjectId(userId) });

    return { deleted: userId };

};