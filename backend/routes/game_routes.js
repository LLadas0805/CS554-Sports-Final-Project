import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware/middleware_auth.js';
import {cacheGameId, cacheGames } from "../middleware/middleware_cache_game.js"
import * as games from '../data/games.js';
import sports from "../shared/enums/sports.js";
<<<<<<< HEAD
import skills  from "../shared/enums/skills.js";
=======
>>>>>>> dd8435f4a9c6c975135e4d24ff5b0528c658e194
import statesCities from '../shared/data/US_States_and_Cities.json' with { type: 'json' };

import client from '../config/redisClient.js';
const router = Router();



router.route('/')
  .get(accountVerify, cacheGames, async (req, res) => {
    try {
      const userId = req.session.user._id.toString();
      const cacheKey = `games:${userId}`;
      const gameList = await games.getAllGames(req.session.user);
      await client.set(cacheKey, JSON.stringify(gameList));
      return res.status(200).json(gameList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get games: ${e}` });
    }
  })

router.route('/create')
  .post(accountVerify, async (req, res) => {
    let {
        team1Id,
        team2Id,
        state,
        city,
        score1,
        score2,
        sport,
        date
    } = req.body;

    try {

        helper.validText(state, "state")
        if (!statesCities[state]) throw 'Invalid state'
        helper.validText(city, "city")
        if (!statesCities[state].includes(city)) throw `Invalid city for ${state}`

        helper.validScore(score1)
        helper.validScore(score2)

        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;

        team1Id = helper.validText(team1Id, 'Team 1 ID');
        if (!ObjectId.isValid(team1Id)) throw 'Invalid team 1 ID';

        team2Id = helper.validText(team2Id, 'Team 2 ID');
        if (!ObjectId.isValid(team2Id)) throw 'Invalid team 2 ID';

        helper.validDate(date)

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const game = await games.createGame(
        req.session.user,
        team1Id,
        team2Id,
        state,
        city,
        score1,
        score2,
        sport,
        date
      );

      await client.del(`games:${req.session.user._id.toString()}`);


      return res.status(200).json(game);

    } catch (e) {
      return res.status(500).json({error: `Failed to create game: ${e}`})
    }
  });

router.route('/:id')
  .get(cacheGameId, async (req, res) => {
    try {
      helper.validText(req.params.id, 'game ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let game = await games.getGameById(req.params.id)
      await client.set(`game_id:${req.params.id}`, JSON.stringify(game));
      await client.del(`games:${req.session.user._id.toString()}`);
      return res.status(200).json(game);
    } catch (e) {
      if (e === 'No game with that id') {
        return res.status(404).json({error: `Failed to get game: ${e}`})
      } else {
        return res.status(500).json({error: `Failed to get game: ${e}`})
      }
    }
  })
  .put(accountVerify, async(req, res) => {
    const {
        state,
        city,
        score1,
        score2,
        sport,
        date
    } = req.body;

    try {
        helper.validText(state, "state")
        if (!statesCities[state]) throw 'Invalid state'
        helper.validText(city, "city")
        if (!statesCities[state].includes(city)) throw `Invalid city for ${state}`

        helper.validScore(score1)
        helper.validScore(score2)

        const newSport = helper.validText(sport)
        if (!sports.includes(newSport)) throw `Invalid sport`;

        helper.validText(req.params.id, 'Game ID');
        if (!ObjectId.isValid(req.params.id)) throw 'Invalid Game ID';

        helper.validDate(date)

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let updatedGame = await games.updateGame(
        req.params.id,
        req.session.user,
        state,
        city,
        score1,
        score2,
        sport,
        date);

      await client.set(`game_id:${req.params.id}`, JSON.stringify(updatedGame));
      await client.del(`games:${req.session.user._id.toString()}`);


      return res.status(200).json(updatedGame);
    } catch (e) {
      if (e === 'game not found') {
        res.status(404).json({error: `Failed to update game: ${e}`})
      } else if (e === 'User did not create this game and cannot update it') {
        res.status(401).json({error: `Failed to update game: ${e}`})
      } else {
        res.status(500).json({error: `Failed to update game: ${e}`})
      }
    }

  })
  .delete(accountVerify, async(req, res) => {
    try {
      helper.validText(req.params.id, 'game ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try {
      let deleteGame = await games.deleteGame(req.params.id, req.session.user);
      await client.del(`game_id:${req.params.id}`);
      await client.del(`games:${req.session.user._id.toString()}`);

      return res.status(200).json(deleteGame);
    } catch (e) {
      if (e === 'team not found') {
        res.status(404).json({error: `Failed to delete game: ${e}`})
      } else {
        res.status(500).json({error: `Failed to delete game: ${e}`})
      }
    }
  });

  router.route('/team/:teamId')
  .get(async (req, res) => {
    try {
      helper.validText(req.params.teamId, 'team ID');
      if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const gamesTeamId = await games.getGamesByTeamId(req.params.teamId);
      return res.status(200).json(gamesTeamId);
    } catch (e) {
      return res.status(500).json({error: `Failed to get games by ID: ${e}`});
    }
  });

  router.route('/:userId/upcoming')
  .get(async (req, res) => {
    try {
      helper.validText(req.params.userId, 'user ID');
      if (!ObjectId.isValid(req.params.userId)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const upcomingGames = await games.getUpcomingGamesByUserId(req.params.userId);
      return res.status(200).json(upcomingGames);
    } catch (e) {
      return res.status(500).json({error: `Failed to get upcoming games: ${e}`});
    }
  });

export default router;
