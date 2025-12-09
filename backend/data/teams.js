//import mongo collections, bcrypt and implement the following data functions
import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import {teams, users} from '../config/mongoCollections.js';
import sports from "../../shared/enums/sports.js";
import skills  from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

export const createTeam = async (
    name,
    ownerId,
    description,
    state,
    city,
    preferredSports,
    experience
) => {

    const newTeamName = helper.validTeam(name);

    const newState = helper.validText(state, "state")
    if (!statesCities[newState]) throw 'Invalid state'
    const newCity = helper.validText(city, "city")
    if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
    description = helper.validText(description, 'description')
    if (description.length < 10 || description.length > 500) throw 'description length has to be at least 10 or no more than 500 characters'

    if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Must include at least one sport!";

    for (const sport of preferredSports) {
        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;
    }

    const newExperience = helper.validText(experience, "skill level")
    if (!skills.includes(newExperience)) throw 'Skill level not listed'

    ownerId = helper.validText(ownerId, 'owner ID');
    if (!ObjectId.isValid(ownerId)) throw 'Invalid owner ID';

    const teamCollection = await teams();
    const existingTeam = await teamCollection.findOne({ 
        owner: new ObjectId(ownerId)
    });

    if (existingTeam) throw "Team with this owner ID already in use, cannot own more than one team!";

    const {lat, lon} = await helper.getCoords(newCity, newState)
    const location = {
        type: "Point",
        coordinates: [lon, lat]
    }

    const newTeam = {
        teamName: newTeamName,
        description,
        owner: new ObjectId(ownerId),
        state,
        city,
        preferredSports,
        experience,
        location,
        members: [{userId: new ObjectId(ownerId), requestedAt: new Date() }],
        joinRequests: [],
        createdAt: new Date()
    };

    const teamInsert = await teamCollection.insertOne(newTeam);
    if (!teamInsert.acknowledged || !teamInsert.insertedId) throw "Could not add team";

    return {
        _id: teamInsert.insertedId,
        teamName: newTeam.teamName,
        description: newTeam.description,
        owner: newTeam.owner,
        state: newTeam.state,
        city: newTeam.city,
        preferredSports: newTeam.preferredSports,
        experience: newTeam.experience,
    };

};

export const getTeamById = async (teamId) => {
    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'invalid object ID';
        
    const teamCollection = await teams();
   
    const team = await teamCollection.findOne({_id: new ObjectId(teamId)});
    if (!team) throw 'No team with that id';
    team._id = team._id.toString();
    return team;
};

export const getAllTeams = async () => {
    
    const teamCollection = await teams();
    let teamList = await teamCollection.find({}).toArray();
    if (!teamList) throw 'Could not get any teams';
    
    return teamList;
};

export const getTeamsByFilters = async (userId, name, distance, sport, skillLevel = "") => {
    
  const teamCollection = await teams();

  const andConditions = [];

  if (skillLevel){
    const newSkillLevel = helper.validText(skillLevel, 'skill level');

    if (!skills.includes(newSkillLevel)){
        throw 'Skill level not listed';
    }

    andConditions.push({ experience: newSkillLevel });
  }

  if (sport){
    const newSport = helper.validText(sport, 'sport');

    if (!sports.includes(newSport)){
        throw 'Invalid sport';
    }
    
    andConditions.push({ preferredSports: newSport });

  }

  if (name){
    const newName = helper.validText(name, 'team name');
    andConditions.push({ teamName: { $regex: newName, $options: 'i' } });
  }

  const query = {};
  if (andConditions.length > 0){
    query.$and = andConditions;
  }

  const teamList = await teamCollection.find(query).toArray();

  teamList.forEach((t) => {
    t._id = t._id.toString();
  });

  return teamList;
};

export const getTeamByOwnerId = async (ownerId) => {
    ownerId = helper.validText(ownerId, 'owner ID');
    if (!ObjectId.isValid(ownerId)) throw 'invalid object ID';

    const teamCollection = await teams();
    const team = await teamCollection.findOne({owner: new ObjectId(ownerId)});
    if (!team) throw 'No team with that owner id';
    return team
}

export const getTeamsByMemberId = async (memberId) => {
    memberId = helper.validText(memberId, 'user ID');
    if (!ObjectId.isValid(memberId)) throw 'invalid object ID';

    const teamCollection = await teams();
    const teamList = await teamCollection.find({
        "members.userId": new ObjectId(memberId)
    }).toArray();

    return teamList
}

export const updateTeam = async(
    teamId,
    name,
    description,
    state,
    city,
    preferredSports,
    experience,
    user) => {

        const newTeamName = helper.validTeam(name);

        const newState = helper.validText(state, "state")
        if (!statesCities[newState]) throw 'Invalid state'
        const newCity = helper.validText(city, "city")
        if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`
        
        description = helper.validText(description, 'description')
        if (description.length < 10 || description.length > 500) throw 'description length has to be at least 10 or no more than 500 characters'
        if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Must include at least one sport!";

        for (const sport of preferredSports) {
            const newSport = helper.validText(sport)
            if (!sports.includes(newSport)) throw `Invalid sport`;
        }

        const newExperience = helper.validText(experience, "skill level")
        if (!skills.includes(newExperience)) throw 'Skill level not listed'

        teamId = helper.validText(teamId, 'team ID');
        if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

        const {lat, lon} = await helper.getCoords(newCity, newState)
        const location = {
            type: "Point",
            coordinates: [lon, lat]
        }

        const updatedTeamData = {
            teamName: newTeamName,
            description,
            state,
            city,
            preferredSports,
            experience,
            location,
            updatedAt: new Date()
        };

        const teamCollection = await teams();
        const teamExists = await getTeamById(teamId);
        if (!teamExists || teamExists === null) throw 'team not found';

        if (teamExists.owner.toString() !== user._id.toString()) throw 'User did not create this team and cannot update it'

        let newTeam = await teamCollection.findOneAndUpdate(
        {_id: new ObjectId(teamId)},
        {$set: updatedTeamData},
        {returnDocument: 'after'}
        );
        if (!newTeam) throw `Could not update the team with id ${teamId}`;

        return newTeam;

}

export const deleteTeam = async (teamId, user) => {

    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

    const teamCollection = await teams();
    const userCollection = await users();
 
    const teamExists = await teamCollection.findOne({_id: new ObjectId(teamId)});

    if (!teamExists) throw 'team not found';
    if (teamExists.owner.toString() !== user._id.toString()) throw 'User did not create this team and cannot delete it'
    
    await teamCollection.deleteOne({ _id: new ObjectId(teamId) });

    await userCollection.updateMany(
        { 'teamInvites.teamId': new ObjectId(teamId) },
        { $pull: { teamInvites: { teamId: new ObjectId(teamId) } } }
    );

    return { deleted: teamId };

};

export const addMember = async (teamId, user, memberId) => {

    teamId = helper.validText(teamId, 'team ID');
    memberId = helper.validText(memberId, 'member ID');

    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';
    if (!ObjectId.isValid(memberId)) throw 'Invalid member ID';

    const teamCollection = await teams();

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (team.owner.toString() !== user._id.toString()) throw 'Only the team owner can add members';
   

    if (team.members.some(m => m.toString() === memberId)) throw 'Member is already in the team';

    if (team.members.length >= 50) throw `Team already has the maximum of 50 members`;

    await teamCollection.updateOne(
        { _id: new ObjectId(teamId) },
        { $push: { members: new ObjectId(memberId) } }
    );

    return { added: memberId };

};

export const deleteMember = async (teamId, user, memberId) => {

    teamId = helper.validText(teamId, 'team ID');
    memberId = helper.validText(memberId, 'member ID');

    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';
    if (!ObjectId.isValid(memberId)) throw 'Invalid member ID';

    const teamCollection = await teams();

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (team.owner.toString() !== user._id.toString()) throw 'Only the team owner can delete members';
   
    if (team.owner.toString() === memberId.toString()) throw 'You cannot delete the owner from the team';

    if (!team.members.some(m => m.toString() === memberId)) throw 'Member is not in the team';

    await teamCollection.updateOne(
        { _id: new ObjectId(teamId) },
        { $pull: { members: new ObjectId(memberId) } }
    );
    return { added: memberId };

};

export const sendJoinRequest = async (teamId, userId) => {
    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

    const teamCollection = await teams();

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (team.members.some(m => m.toString() === userId.toString())) throw 'User is already a member of the team';

    if (team.joinRequests.some(r => r.userId.toString() === userId.toString())) throw 'Join request already sent';

    await teamCollection.updateOne(
        { _id: new ObjectId(teamId) },
        { $push: { joinRequests: { userId: new ObjectId(userId), requestedAt: new Date() } } }
    );

    return { requested: teamId };
};

export const removeJoinRequest = async (teamId, userId) => {
    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'Invalid team ID';

    userId = helper.validText(userId, 'user ID');
    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

    const teamCollection = await teams();

    const team = await teamCollection.findOne({ _id: new ObjectId(teamId) });
    if (!team) throw 'Team not found';

    if (!team.joinRequests.some(r => r.userId.toString() === userId.toString())) throw 'Join request not found';
  
    await teamCollection.updateOne(
        { _id: new ObjectId(teamId) },
        { $pull: { joinRequests: { userId: new ObjectId(userId) } } }
    );

    return { removed: userId };
};
