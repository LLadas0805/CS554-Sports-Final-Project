import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
import client from '../config/redisClient.js';

export async function cacheGameId(req, res, next) {
    try {
        helper.validText(req.params.id, 'game ID');
        if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
        return res.status(400).json({error: e});
    }

    const cachedGame = await client.get(`game_id:${req.params.id}`);
    if (cachedGame) {
      try {
        const game = JSON.parse(cachedGame);
        return res.status(200).json(game);
      } catch (e) {
        return res.status(500).json({ error: `Failed to get game`});
      }
    }

    next(); 
}

export async function cacheGames(req, res, next) {
  let exists = await client.exists("games");
  if (exists) {
    try {
      const gameListString = await client.get("games");
      const gameList = JSON.parse(gameListString)
      return res.status(200).json(gameList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get games`});
    }
  }
  next(); 
}