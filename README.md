# CS554 Final Project Sports

This file is meant for people to properly run this website as a single server either locally or if you want to view the website deployed click this link below.

https://cs554-sports-final-project-1.onrender.com

## Seeding Data Into Project
- If you want premade data such as users, teams, and games when starting the website from scratch you can run a seed file from the backend directory using "node seed.js". Comment out the deletion of documents if you do not want a clean reset after every seed. Because this project is using a cloud based database with mongo, the data is already seeded with teams, users, and games but if there is any missing please run this file. Also if you need to find any login information it is all located in the seed.js folder and all of the passwords are simply "password"

## Running Setup

### Environmental Variables 

MONGODB_URI=mongodb+srv://cs554_db_user:LeKOZL0nVSsmZTjl@final-project-cluster.yhin5ta.mongodb.net/?appName=Final-Project-Cluster
REDIS_URL=rediss://red-d4uugka4d50c73bl683g:YHcfvZ7aauKvVKFcIfiGwEmefG2ndeNz@ohio-keyvalue.render.com:6379

### Running Locally
- In the frontend, run npm run build if there is no dist folder located in frontend or backend, and then drag that folder into the root of backend. Run npm install for both frontend and backend if the packages are not already downloaded. Then run npm start inside of the backend and open the project with localhost:3000

### Running Using Docker
- If you want to run the website using docker, first, make sure you have docker installed, then you can type the following in the project's root directory "docker build -t sports-app ." which will build the project into a single image. To run the image itself as a container you can run the line in the terminal "docker run -p 3000:3000 sports-app:latest" and depending on if you have a sports-app image set up the environmental variables in docker it should be passed in as parameters. If you are running it in the terminal and do not use the desktop when you run it should have docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://cs554_db_user:LeKOZL0nVSsmZTjl@final-project-cluster.yhin5ta.mongodb.net/?appName=Final-Project-Cluster" \
  -e REDIS_URL="rediss://red-d4uugka4d50c73bl683g:YHcfvZ7aauKvVKFcIfiGwEmefG2ndeNz@ohio-keyvalue.render.com:6379" \
  sports-app:latest

If this still does not work you can put these into an .env

- Also if there is any problem locating the dist folder when running this project, go into frontend and perform npm run build, then drag that folder into the backend.



