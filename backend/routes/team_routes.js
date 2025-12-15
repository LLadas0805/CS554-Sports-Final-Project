import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware/middleware_auth.js';
import {cacheTeamId, cacheTeams } from "../middleware/middleware_cache_team.js"
import * as teams from '../data/teams.js';
import sports from "../../shared/enums/sports.js";
import skills  from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

import client from '../config/redisClient.js';
const router = Router();

router.route('/')
  .get(cacheTeams, async (req, res) => {
    try {
      const teamList = await teams.getAllTeams();
      await client.set("teams", JSON.stringify(teamList));
      return res.status(200).json(teamList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get teams: ${e}` });
    }
  })

router.route('/create')
  .post(accountVerify, async (req, res) => {
    let {
        name,
        description,
        state,
        city,
        preferredSports,
        experience
    } = req.body;

    try {
     
        //if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';

        helper.validTeam(name);

        helper.validText(state, "state")
        if (!statesCities[state]) throw 'Invalid state'
        helper.validText(city, "city")
        if (!statesCities[state].includes(city)) throw `Invalid city for ${state}`
        
        description = helper.validText(description, 'description')
        if (description.length < 10 || description.length > 500) throw 'description length has to be at least 10 or no more than 500 characters'
        if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Must include at least one sport!";

        for (const sport of preferredSports) {
            const newSport = helper.validText(sport)
            if (!sports.includes(newSport)) throw `Invalid sport`;
        }

        helper.validText(experience, "skill level")
        if (!skills.includes(experience)) throw 'Skill level not listed'

    } catch (e) {
      const msg = typeof e === 'string' ? e : e.message || 'Unknown error';
      return res.status(400).json({error: msg});
    }
    
    try {
      const team = await teams.createTeam(
        name,
        req.session.user._id,
        description,
        state,
        city,
        preferredSports,
        experience
      );

      await client.set(`team_id:${team._id}`, JSON.stringify(team));
      await client.del("teams")
      return res.status(200).json(team);
      
    } catch (e) {
      return res.status(500).json({error: `Failed to create team: ${e}`})
    }
  });

router.route('/filter')
  .post(accountVerify, async (req, res) => {
    let { name, distance, skillLevel, sport } = req.body;

    try{
      if (typeof name === 'string'){
        name = name.trim();
        if (!name){
          name = undefined;
        }
      }
      
      else{
        name = undefined;
      }

      if (typeof sport === 'string'){
        sport = sport.trim();
        if (!sport){
          sport = undefined;
        }
      }
      
      else{
        sport = undefined;
      }

      if (typeof skillLevel === 'string'){
        skillLevel = skillLevel.trim();
        if (!skillLevel){
          skillLevel = undefined;
        }
      }
      
      else{
        skillLevel = undefined;
      }

      if (distance !== undefined && distance !== ''){
        const d = Number(distance);
        if (Number.isNaN(d) || d < 0){
          return res
            .status(400)
            .json({ error: 'Distance must be a non-negative number' });
        }
        distance = d;
      }
      
      else{
        distance = undefined;
      }

      const result = await teams.getTeamsByFilters(
        req.session.user._id,
        name,
        distance,
        sport,
        skillLevel
      );

      return res.status(200).json(result);
    } catch (e){
      console.error('Error in /team/filter:', e);
      const msg =
        typeof e === 'string' ? e : e.message || 'Failed to filter teams';
      return res.status(500).json({ error: msg });
    }
  });

router.route('/user/:userId')
  .get(accountVerify, async (req, res) => {
    try {
      helper.validText(req.params.userId, 'user ID');
      if (!ObjectId.isValid(req.params.userId)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const userTeams = await teams.getTeamsByMemberId(req.params.userId);
      return res.status(200).json(userTeams);
    } catch (e) {
      return res.status(500).json({error: `Failed to get user teams: ${e}`});
    }
  });

  router.route('/user/:userId/owned')
  .get(accountVerify, async (req, res) => {
    try {
      helper.validText(req.params.userId, 'user ID');
      if (!ObjectId.isValid(req.params.userId)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const ownedTeam = await teams.getTeamByOwnerId(req.params.userId);
      return res.status(200).json(ownedTeam);
    } catch (e) {
      if (e === 'No team with that owner id') {
        return res.status(404).json({error: 'User does not own a team'});
      }
      return res.status(500).json({error: `Failed to get owned team: ${e}`});
    }
  });

router.route('/:id')
  .get(cacheTeamId, async (req, res) => {
    try {
      helper.validText(req.params.id, 'team ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let team = await teams.getTeamById(req.params.id)
      await client.set(`team_id:${req.params.id}`, JSON.stringify(team)); 
      await client.del("teams");
      return res.status(200).json(team);
    } catch (e) {
      if (e === 'No team with that id') {
        return res.status(404).json({error: `Failed to get team: ${e}`})
      } else {
        return res.status(500).json({error: `Failed to get team: ${e}`})
      }
    }
  })
  .put(accountVerify, async(req, res) => {
    let {
        name,
        description,
        state,
        city,
        preferredSports,
        experience
    } = req.body;

    try {
        helper.validTeam(name);

        helper.validText(state, "state")
        if (!statesCities[state]) throw 'Invalid state'
        helper.validText(city, "city")
        if (!statesCities[state].includes(city)) throw `Invalid city for ${state}`
        
        description = helper.validText(description, 'description')
        if (description.length < 10 || description.length > 500) throw 'description length has to be at least 10 or no more than 500 characters'
        if (!preferredSports || !Array.isArray(preferredSports) || preferredSports.length === 0) throw "Must include at least one sport!";

        for (const sport of preferredSports) {
            const newSport = helper.validText(sport)
            if (!sports.includes(newSport)) throw `Invalid sport`;
        }

        helper.validText(experience, "skill level")
        if (!skills.includes(experience)) throw 'Skill level not listed'

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let updatedTeam = await teams.updateTeam(
        req.params.id, 
        name,
        description,
        state,
        city,
        preferredSports,
        experience,
        req.session.user);

        await client.set(`team_id:${req.params.id}`, JSON.stringify(updatedTeam)); 
        await client.del("teams");
        return res.status(200).json(updatedTeam);
    } catch (e) {
      if (e === 'team not found') {
        res.status(404).json({error: `Failed to update team: ${e}`})
      } else if (e === 'User did not create this team and cannot update it') {
        res.status(401).json({error: `Failed to update team: ${e}`})
      } else {
        res.status(500).json({error: `Failed to update team: ${e}`})
      }
    }
    
  })
  .delete(accountVerify, async(req, res) => {
    try {
      helper.validText(req.params.id, 'team ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try {
      let deleteTeam = await teams.deleteTeam(req.params.id, req.session.user);
      await client.del(`team_id:${req.params.id}`);
      await client.del("teams")
      return res.status(200).json(deleteTeam);
    } catch (e) {
      if (e === 'team not found') {
        res.status(404).json({error: `Failed to delete team: ${e}`})
      } else {
        res.status(500).json({error: `Failed to delete team: ${e}`})
      }
    }
  });

router.route('/members/:teamId/:memberId')
    .post(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.memberId, 'member ID');
            if (!ObjectId.isValid(req.params.memberId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
          const result = await teams.addMember(req.params.teamId, req.session.user, req.params.memberId);
          await client.del(`team_id:${req.params.teamId}`);
          await client.del("teams")
          res.status(200).json(result);
        } catch (e) {
          res.status(500).json({error: `Failed to add member: ${e}`})
        }
    })
    .delete(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.memberId, 'member ID');
            if (!ObjectId.isValid(req.params.memberId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
          const result = await teams.deleteMember(req.params.teamId, req.session.user, req.params.memberId);
          await client.del(`team_id:${req.params.teamId}`);
          await client.del("teams")
          res.status(200).json(result);
        } catch (e) {
          res.status(500).json({error: `Failed to delete member: ${e}`})
        }
    });

router.route('/members/:memberId') 
  .get(async(req, res) => {
    try {
        helper.validText(req.params.memberId, 'member ID');
        if (!ObjectId.isValid(req.params.memberId)) throw 'invalid object ID';   
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const result = await teams.getTeamsByMemberId(req.params.memberId);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({error: `Failed to find teams`})
    }
  })

router.route('/requests/:teamId/:userId')
    .post(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.userId, 'user ID');
            if (!ObjectId.isValid(req.params.userId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            const result = await teams.sendJoinRequest(req.params.teamId, req.params.userId);
            const io = req.app.locals.io;

            io.to(req.params.userId).emit("notification", {
              type: "TEAM_REQUEST_RECEIVED",
              teamId: req.params.teamId,
              from: req.session.user._id,
              message: "Team request received!"
            });

            io.to(req.session.user._id).emit("notification", {
              type: "TEAM_REQUEST_SENT",
              teamId: req.params.teamId,
              to: req.params.userId
            });
            await client.del(`team_id:${req.params.teamId}`);
            await client.del("teams")
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to send join request: ${e}`})
        }
    })
    .delete(accountVerify, async(req, res) => {
        try {
            helper.validText(req.params.teamId, 'team ID');
            if (!ObjectId.isValid(req.params.teamId)) throw 'invalid object ID';

            helper.validText(req.params.memberId, 'member ID');
            if (!ObjectId.isValid(req.params.memberId)) throw 'invalid object ID';   
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            const result = await teams.removeJoinRequest(req.params.teamId, req.params.userId);
            await client.del(`team_id:${req.params.teamId}`);
            await client.del("teams")
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to delete join request: ${e}`})
        }
    });

export default router;