import redis from 'redis';
import * as helper from '../helpers.js'
import {ObjectId} from 'mongodb';
const client = redis.createClient();
client.connect().then(() => {});

export async function cacheTeamId(req, res, next) {
    try {
        helper.validText(req.params.id, 'team ID');
        if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
        return res.status(400).json({error: e});
    }

    const cachedTeam = await client.get(`team_id:${req.params.id}`);
    if (!cachedTeam) {
        try {
            const team = JSON.parse(cachedTeam);
            return res.status(200).json(team);
        } catch (e) {
            return res.status(500).json({ error: `Failed to get team`});
        }
    }

    next(); 
}

export async function cacheTeams(req, res, next) {
  let exists = await client.exists("teams");
  if (exists) {
    try {
      const teamListString = await client.get("teams");
      const teamList = JSON.parse(teamListString)
      return res.status(200).json(teamList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get teams`});
    }
  }
  next(); 
}