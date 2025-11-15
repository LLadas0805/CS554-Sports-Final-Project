import {Router} from 'express';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import { accountVerify, accountLogged } from '../middleware.js';
import * as teams from '../data/teams.js';
import { sports } from "../../shared/enums/sports.js";
import { skills } from "../../shared/enums/skills.js";
import statesCities from '../../shared/data/US_States_and_Cities.json' with { type: 'json' };

const router = Router();

router.route('/')
  .get(async (req, res) => {
    try {
      const teamList = await teams.getAllTeams();
      return res.status(200).json(teamList);
    } catch (e) {
      return res.status(500).json({ error: `Failed to get teams: ${e}` });
    }
  })

router.route('/create')
  .post(accountVerify, async (req, res) => {
    const {
        name,
        description,
        state,
        city,
        preferredSports,
        experience
    } = req.body;

    try {
     
        if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';

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
      const team = await teams.createTeam(
        name,
        req.session.user_id,
        description,
        state,
        city,
        preferredSports,
        experience
      );

      return res.status(200).json(team);
      
    } catch (e) {
      return res.status(500).json({error: `Failed to create team: ${e}`})
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      helper.validText(req.params.id, 'team ID');
      if (!ObjectId.isValid(req.params.id)) throw 'invalid object ID';
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let team = await teams.getTeamById(req.params.id)
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
    const {
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
      let updatedUser = await users.updateUser(
        req.params.id, 
        name,
        description,
        state,
        city,
        preferredSports,
        experience,
        req.session.user);
      return res.status(200).json(updatedUser);
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
            const result = await teams.addMember(req.params.teamId, req.user, req.params.memberId);
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
            const result = await teams.deleteMember(req.params.teamId, req.user, req.params.memberId);
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to delete member: ${e}`})
        }
    });

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
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({error: `Failed to delete join request: ${e}`})
        }
    });

export default router;