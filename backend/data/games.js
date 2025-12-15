import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import {teams, games} from '../config/mongoCollections.js';
import sports from "../../shared/enums/sports.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

export const createGame = async (
    user,
    team1Id,
    team2Id,
    state,
    city,
    score1,
    score2,
    sport,
    date
) => {

    const newState = helper.validText(state, "state")
    if (!statesCities[newState]) throw 'Invalid state'
    const newCity = helper.validText(city, "city")
    if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`

    helper.validScore(score1)
    helper.validScore(score2)

    const newSport = helper.validText(sport)
    if (!sports.includes(newSport)) throw `Invalid sport`;

    team1Id = helper.validText(team1Id, 'Team 1 ID');
    if (!ObjectId.isValid(team1Id)) throw 'Invalid team 1 ID';

    team2Id = helper.validText(team2Id, 'Team 2 ID');
    if (!ObjectId.isValid(team2Id)) throw 'Invalid team 2 ID';

    const newDate = helper.validDate(date)

    const teamCollection = await teams();
    const existingTeam1 = await teamCollection.findOne({
        _id: new ObjectId(team1Id)
    });

    if (!existingTeam1) throw "Team 1 does not exist";

    const existingTeam2 = await teamCollection.findOne({
        _id: new ObjectId(team2Id)
    });

    if (!existingTeam2) throw "Team 2 does not exist";

    if(!existingTeam1.owner || !existingTeam2.owner) throw "The playing teams do not have owner"

    // user must own at least one of the teams
    if (existingTeam1.owner.toString() !== user._id.toString() && existingTeam2.owner.toString() !== user._id.toString())
        throw "User needs to be an owner of one of the playing teams"

    const {lat, lon} = await helper.getCoords(newCity, newState)
    const location = {
        type: "Point",
        coordinates: [lon, lat]
    }

    const newGame = {
        team1: {_id: new ObjectId(team1Id), name: existingTeam1.teamName || existingTeam1.teamName, score: score1 || null},
        team2: {_id: new ObjectId(team2Id), name: existingTeam2.teamName || existingTeam2.teamName, score: score2 || null},
        sport: newSport,
        state: newState,
        city: newCity,
        location,
        date: newDate,
        createdAt: new Date()
    };

    const gameCollection = await games();
    const gameInsert = await gameCollection.insertOne(newGame);
    if (!gameInsert.acknowledged || !gameInsert.insertedId) throw "Could not add game";

    const inserted = await gameCollection.findOne({ _id: gameInsert.insertedId });
    if (inserted) inserted._id = inserted._id.toString();
    return inserted;

};

export const getGameById = async (gameId) => {
    gameId = helper.validText(gameId, 'game ID');
    if (!ObjectId.isValid(gameId)) throw 'invalid object ID';

    const gameCollection = await games();

    const game = await gameCollection.findOne({_id: new ObjectId(gameId)});
    if (!game) throw 'No game with that id';
    game._id = game._id.toString();
    return game;
};

export const getAllGames = async (user) => {

    const gameCollection = await games();
    const teamCollection = await teams();
    let gameList = await gameCollection.find({}).toArray();
    let teamList = await teamCollection.find({}).toArray() || [];
    if (!gameList) throw 'Could not get any games';

    return gameList.map(game => {
      const game1Id = game.team1._id.toString();
      const game2Id = game.team2._id.toString();
      const userId = user._id.toString();

      let canEditOrDelete = teamList.some(team => team._id.toString() === game1Id && team.owner.toString() === userId) &&
        teamList.some(team => team._id.toString() === game2Id && team.owner.toString() === userId);

      return {
        ...game,
        canEditOrDelete
      }
    });
};

export const deleteGame = async (gameId, user) => {

    gameId = helper.validText(gameId, 'game ID');
    if (!ObjectId.isValid(gameId)) throw 'Invalid game ID';

    const gameCollection = await games();
    const teamCollection = await teams();

    const gameExists = await gameCollection.findOne({_id: new ObjectId(gameId)});

    if (!gameExists) throw 'game not found';

    const teamExists = await teamCollection.findOne({owner: new ObjectId(user._id)});

    if (teamExists._id.toString() !== gameExists.team1._id.toString() && teamExists._id.toString() !== gameExists.team2._id.toString())
        throw "user cannot delete game as they do not own either team!"

    await gameCollection.deleteOne({ _id: new ObjectId(gameId) });

    return { deleted: gameId };

};


export const updateGame = async(
    gameId,
    user,
    state,
    city,
    score1,
    score2,
    sport,
    date) => {

        const newState = helper.validText(state, "state")
        if (!statesCities[newState]) throw 'Invalid state'
        const newCity = helper.validText(city, "city")
        if (!statesCities[newState].includes(newCity)) throw `Invalid city for ${newState}`

        helper.validScore(score1)
        helper.validScore(score2)

        gameId = helper.validText(gameId, 'game ID');
        if (!ObjectId.isValid(gameId)) throw 'Invalid game ID';

        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;

        const newDate = helper.validDate(date)

        const gameCollection = await games();
        const teamCollection = await teams();

        const existingGame = await gameCollection.findOne({
            _id: new ObjectId(gameId)
        });

        if (!existingGame) throw "Game does not exist";

        const {lat, lon} = await helper.getCoords(newCity, newState)
        const location = {
            type: "Point",
            coordinates: [lon, lat]
        }


        const team1 = await teamCollection.findOne({ _id: new ObjectId(existingGame.team1._id) });
        const team2 = await teamCollection.findOne({ _id: new ObjectId(existingGame.team2._id) });

        if (!team1 || !team2) throw "One or both teams not found";

        if (team1.owner.toString() !== user._id.toString() && team2.owner.toString() !== user._id.toString()) throw 'User did not create this team and cannot update game'

        const updatedGameData = {
            team1: {_id: new ObjectId(String(team1._id)), name: team1.teamName, score: score1 || null},
            team2: {_id: new ObjectId(String(team2._id)), name: team2.teamName, score: score2 || null},
            sport: newSport,
            state: newState,
            city: newCity,
            location,
            date: newDate,
            updatedAt: new Date()
        };


        const gameExists = await getGameById(gameId);
        if (!gameExists || gameExists === null) throw 'game not found';

        let newGame = await gameCollection.findOneAndUpdate(
        {_id: new ObjectId(gameId)},
        {$set: updatedGameData},
        {returnDocument: 'after'}
        );
        if (!newGame) throw `Could not update the game with id ${gameId}`;

        return newGame;

}

export const getGamesByTeamId = async (teamId) => {
    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'invalid object ID';
    const gameCollection = await games();
    let gameList = await gameCollection.find({
        $or: [
            {'team1._id': new ObjectId(teamId)},
            {'team2._id': new ObjectId(teamId)}
        ]
    }).toArray();
    return gameList;
}

export const getUpcomingGamesByTeamId = async (teamId) => { //future events
    teamId = helper.validText(teamId, 'team ID');
    if (!ObjectId.isValid(teamId)) throw 'invalid object ID';

    const gameCollection = await games();
    const now = new Date();

    let upcomingGames = await gameCollection.find({
        $and: [
            {
                $or: [
                    {'team1._id': new ObjectId(teamId)},
                    {'team2._id': new ObjectId(teamId)}
                ]
            },
            {
                date: { $gte: now } //upcoming only
            }
        ]
    }).sort({ date: 1 }).toArray();

    return upcomingGames;
};
