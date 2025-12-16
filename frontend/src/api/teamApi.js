import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

function unwrap(res) {
  if (res.data && res.data.error){
    throw new Error(res.data.error);
  }
  return res.data;
}

export async function getAllTeams(){
  const res = await client.get('/team/');
  return unwrap(res);
}

export async function filterTeams(filters){
  const res = await client.post('/team/filter', filters);
  return unwrap(res);
}

export async function getTeamById(id){
  const res = await client.get(`/team/${id}`);
  return unwrap(res);
}

export async function createTeam(data){
  const res = await client.post('/team/create', data);
  return unwrap(res);
}

export async function updateTeam(id, data){
  const res = await client.put(`/team/${id}`, data);
  return unwrap(res);
}

export async function deleteTeam(id){
  const res = await client.delete(`/team/${id}`);
  return unwrap(res);
}

export async function sendJoinRequest(teamId, userId){
  const res = await client.post(`/team/requests/${teamId}/${userId}`);
  return unwrap(res);
}

export async function addMember(teamId, memberId){
  const res = await client.post(`/team/members/${teamId}/${memberId}`);
  return unwrap(res);
}

export async function getAuth() {
  const res = await client.get('/user/auth');
  return unwrap(res);
}
