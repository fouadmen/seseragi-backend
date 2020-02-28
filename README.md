# seseragi-backend

As its name says, this project handles Passiv Energie Japan LTD Seseragi product backend domain, 
it provides several APIs to control and monitor these products. 

##Project Structure
src
│   app.js          # App entry point
└───api             # Express route controllers for all the endpoints of the app
└───config          # Environment variables and configuration related stuff
└───jobs            # Jobs definitions for agenda.js
└───loaders         # Split the startup process into modules
└───models          # Database models
└───services        # All the business logic is here
└───subscribers     # Event handlers for async task

