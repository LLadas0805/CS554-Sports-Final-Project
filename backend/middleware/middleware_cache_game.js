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
  try {
    const userId = req.session?.user?._id?.toString();
    if (!userId) return next();

    const cacheKey = `games:${userId}`;

    const cached = await client.get(cacheKey);
    if (cached){
      return res.status(200).json(JSON.parse(cached));
    }

    return next();
  } catch (e){
    return next();
  }
}