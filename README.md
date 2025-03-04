# Champions League GraphQL API

A full-stack application providing UEFA Champions League football data through a GraphQL API, built with Ruby on Rails, GraphQL, React, and Apollo Client.

![Champions League Explorer](https://github.com/user-attachments/assets/f29c8ce4-14f9-4749-8253-036836ccc3be)

## Project Overview

This project delivers a responsive web application that allows users to explore Champions League football data. The application provides team information, tournament standings, match results, and player statistics through an intuitive interface backed by a GraphQL API.

### Key Features

- **Tournament Standings**: View team rankings with performance statistics
- **Team Profiles**: Detailed team information with roster and match history
- **Match Explorer**: Browse and filter matches with results and upcoming fixtures
- **Player Data**: Player statistics and performance metrics
- **API-FOOTBALL Integration**: Real football data from external API

## Technology Stack

### Backend
- **Ruby on Rails 8.0.1**: Server-side framework
- **PostgreSQL**: Database
- **GraphQL Ruby**: API query language implementation
- **API-FOOTBALL Integration**: External data source

### Frontend
- **React**: Frontend library
- **Apollo Client**: GraphQL client for data fetching
- **Material UI**: Component library for responsive design
- **React Router**: Navigation and routing

## GraphQL Schema

The application implements a robust GraphQL schema with the following main types:

### Main Types
- **Team**: Football club information (name, country, logo, founded year)
- **Tournament**: Competition information (name, season)
- **Match**: Game details (teams, date, scores)
- **Player**: Player information (name, position, statistics)

### Relationships
- Teams have many Players
- Teams participate in many Matches (as home or away team)
- Tournaments have many Matches
- Matches belong to one Tournament and two Teams (home and away)

### Sample GraphQL Queries

```graphql
# Get Team Standings for a Tournament
query {
  teamRankings(tournamentId: "1") {
    team {
      id
      name
      country
    }
    points
    wins
    draws
    losses
    matchesPlayed
    goalsFor
    goalsAgainst
    goalDifference
  }
}

# Get Team Details with Players and Matches
query {
  team(id: "1") {
    id
    name
    country
    logoUrl
    founded
    players {
      id
      name
      position
      goals
      assists
    }
    matches {
      id
      matchDate
      homeTeam { name }
      awayTeam { name }
      scoreHome
      scoreAway
    }
  }
}
```

## Project Structure

```
.
├── app/                      # Rails application
│   ├── controllers/          # API controllers
│   ├── graphql/              # GraphQL implementation
│   │   ├── mutations/        # GraphQL mutations
│   │   ├── types/            # GraphQL types
│   │   └── resolvers/        # GraphQL resolvers
│   ├── models/               # Database models
│   └── services/             # Application services (API clients, etc.)
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Main application views
│   │   ├── App.js            # Main component
│   │   └── apolloClient.js   # Apollo client configuration
├── config/                   # Rails configuration
└── db/                       # Database configuration and migrations
```

## Features Implemented

### Backend (Rails)
- ✅ Core database structure with Team, Tournament, Match, and Player models
- ✅ GraphQL schema with proper types and relationships
- ✅ Full CRUD operations via GraphQL mutations
- ✅ Connection-style pagination for all main types
- ✅ Team rankings algorithm implementation
- ✅ API-FOOTBALL integration for data importing
- ✅ Proper error handling in GraphQL resolvers

### Frontend (React)
- ✅ React app setup within Rails project structure
- ✅ Apollo Client configuration for GraphQL communication
- ✅ Material UI implementation for responsive design
- ✅ Routing with React Router
- ✅ Home page showing available tournaments
- ✅ Tournament Standings page with team rankings table
- ✅ Team Details page with team info, squad, and match history
- ✅ Matches page with filtering and viewing options
- ✅ Players listing with filtering and statistics

## Meeting Project Requirements

1. **GraphQL, React, and Apollo Implementation**: The project uses GraphQL on the backend with Ruby on Rails and Apollo Client with React on the frontend.

2. **Multiple Types with Relationships**: The application includes Team, Tournament, Match, and Player types with appropriate relationships between them.

3. **CRUD Operations**: Full Create, Read, Update, and Delete functionality via GraphQL mutations.

4. **External API Integration**: Integration with API-FOOTBALL for real Champions League data.

5. **Responsive Design**: Mobile-friendly interface using Material UI with responsive layouts and components.

## Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/f29c8ce4-14f9-4749-8253-036836ccc3be)

### Tournament Standings
![Tournament Standings](https://github.com/user-attachments/assets/92904582-b0f4-4312-a3a2-4b9833822b70)

### Team Details
![Team Details](https://github.com/user-attachments/assets/06db5b93-9f65-4cd9-88f4-fc899a246e87)

## Getting Started

### Prerequisites
- Ruby 3.3.0
- Rails 8.0.1
- Node.js & npm
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/football-graphql-api.git
cd football-graphql-api
```

2. Install backend dependencies
```bash
bundle install
```

3. Set up database
```bash
rails db:create db:migrate db:seed
```

4. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

5. Set up API key
```bash
# Add your API-FOOTBALL key to Rails credentials
rails credentials:edit
```
Add your API key in the format:
```yml
api_football:
  api_key: your_api_key_here
```

6. Start the development server
```bash
bin/dev
```

7. Access the application at http://localhost:3000

### Using the API

The GraphQL API can be accessed at `/graphql`. When in development, you can use GraphiQL at `/graphiql` to explore the API and run queries.

## Data Import

The application includes several Rake tasks for importing data from API-FOOTBALL:

```bash
# Import teams
rails football:import_teams

# Import matches
rails football:import_matches

# Import player data
rails football:import_players

# Test API connection
rails football:test_api
```

## Future Enhancements

- User authentication and personalization
- Advanced statistics and data visualization
- Real-time match updates
- Team comparison feature
- Historical data and season archives
- Mobile app version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by API-FOOTBALL
- Built as a final project for GraphQL course