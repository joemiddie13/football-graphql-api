# Champions League GraphQL API

A full-stack application providing UEFA Champions League football data through a GraphQL API, built with Ruby on Rails, GraphQL, React, and Apollo Client.

<img width="1149" alt="image" src="https://github.com/user-attachments/assets/05c8be34-f0f7-4a41-bff7-955c8f54cbb2" />

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

## GraphQL Implementation

This project showcases GraphQL as a powerful alternative to REST APIs, demonstrating its flexibility, efficient data fetching, and strong typing system.

### GraphQL Schema Architecture

The application implements a robust GraphQL schema that defines the data structure and relationships. The schema is the foundation that enables clients to request exactly what they need and nothing more.

#### Core Types

```ruby
# Team Type Definition
class TeamType < Types::BaseObject
  description "A team participating in the Champions League"

  field :id, ID, null: false
  field :name, String, null: false, description: "The team's official name"
  field :country, String, null: false, description: "The country this team represents"
  field :logo_url, String, null: true, description: "URL to the team's logo"
  field :founded, Integer, null: true, description: "The year the team was founded"
  
  # Relationship fields
  field :home_matches, [Types::MatchType], null: false
  field :away_matches, [Types::MatchType], null: false
  field :players, [Types::PlayerType], null: false
end

# Match Type Definition
class MatchType < Types::BaseObject
  description "A match in the Champions League"

  field :id, ID, null: false
  field :match_date, GraphQL::Types::ISO8601DateTime, null: false
  field :score_home, Integer, null: true, description: "Goals scored by the home team"
  field :score_away, Integer, null: true, description: "Goals scored by the away team"
  
  # Relationship fields
  field :tournament, Types::TournamentType, null: false
  field :home_team, Types::TeamType, null: false
  field :away_team, Types::TeamType, null: false
end
```

### Relationship Modeling

GraphQL excels at representing complex relationships between entities. In this application:

1. **One-to-Many Relationships**:
   - Tournament to Matches: A tournament has many matches
   - Team to Players: A team has many players

2. **Many-to-Many Relationships**:
   - Teams to Matches: A team can participate in many matches (as either home or away team)
   - Teams to Tournaments: Teams can participate in multiple tournaments (indirectly through matches)

3. **Complex Relationships**:
   - The Match entity connects to Teams twice (as home_team and away_team), showcasing how GraphQL can model complex relationships with semantic meaning

#### Database Schema Supporting GraphQL Relationships

```ruby
# Database migrations demonstrating relationships
class CreateTeams < ActiveRecord::Migration[8.0]
  def change
    create_table :teams do |t|
      t.string :name
      t.string :country
      t.string :logo_url
      t.integer :founded
      t.timestamps
    end
  end
end

class CreateMatches < ActiveRecord::Migration[8.0]
  def change
    create_table :matches do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :home_team, null: false, foreign_key: { to_table: :teams }
      t.references :away_team, null: false, foreign_key: { to_table: :teams }
      t.datetime :match_date
      t.integer :score_home
      t.integer :score_away
      t.timestamps
    end
  end
end
```

### GraphQL Resolvers & Custom Logic

Beyond basic CRUD operations, this project implements complex business logic in GraphQL resolvers:

```ruby
# Team Rankings Resolver - Calculating standings
def team_rankings(tournament_id:)
  tournament = Tournament.find(tournament_id)
  
  # Get all teams in this tournament
  team_ids = tournament.matches.pluck(:home_team_id, :away_team_id).flatten.uniq
  teams = Team.where(id: team_ids)
  
  rankings = teams.map do |team|
    # Get matches where this team played
    team_matches = tournament.matches.where(
      "home_team_id = :team_id OR away_team_id = :team_id", 
      team_id: team.id
    )
    
    # Calculate stats (wins, draws, points, etc.)
    points = 0
    wins = 0
    draws = 0
    losses = 0
    goals_for = 0
    goals_against = 0
    
    team_matches.each do |match|
      next unless match.score_home.present? && match.score_away.present?
      
      if match.home_team_id == team.id
        # Calculate stats when team is home team
        goals_for += match.score_home
        goals_against += match.score_away
        
        if match.score_home > match.score_away
          points += 3
          wins += 1
        elsif match.score_home == match.score_away
          points += 1
          draws += 1
        else
          losses += 1
        end
      else
        # Calculate stats when team is away team
        goals_for += match.score_away
        goals_against += match.score_home
        
        if match.score_away > match.score_home
          points += 3
          wins += 1
        elsif match.score_away == match.score_home
          points += 1
          draws += 1
        else
          losses += 1
        end
      end
    end
    
    # Return calculated rankings for the team
    {
      team: team,
      points: points,
      wins: wins,
      draws: draws,
      losses: losses,
      matches_played: wins + draws + losses,
      goals_for: goals_for,
      goals_against: goals_against,
      goal_difference: goals_for - goals_against
    }
  end
  
  # Sort by points (descending), then goal difference, then goals scored
  rankings.sort_by { |r| [-r[:points], -r[:goal_difference], -r[:goals_for]] }
end
```

### GraphQL Queries & Mutations Examples

#### Queries

```graphql
# Tournament standings with full statistics
query TournamentStandings($tournamentId: ID!) {
  tournament(id: $tournamentId) {
    id
    name
    season
  }
  teamRankings(tournamentId: $tournamentId) {
    team {
      id
      name
      country
      logoUrl
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

# Team details with players and recent matches
query TeamDetails($teamId: ID!) {
  team(id: $teamId) {
    id
    name
    country
    logoUrl
    founded
    players {
      id
      name
      position
      nationality
      age
      jerseyNumber
      goals
      assists
      appearances
    }
    matches(first: 5) {
      id
      matchDate
      scoreHome
      scoreAway
      homeTeam {
        id
        name
        logoUrl
      }
      awayTeam {
        id
        name
        logoUrl
      }
      tournament {
        name
        season
      }
    }
  }
}

# Filtered matches with pagination
query FilteredMatches(
  $first: Int!,
  $after: String,
  $tournamentId: ID,
  $teamId: ID,
  $fromDate: ISO8601DateTime,
  $toDate: ISO8601DateTime
) {
  matchesConnection(
    first: $first,
    after: $after,
    tournament_id: $tournamentId,
    team_id: $teamId,
    from_date: $fromDate,
    to_date: $toDate
  ) {
    edges {
      node {
        id
        matchDate
        scoreHome
        scoreAway
        homeTeam {
          id
          name
          logoUrl
        }
        awayTeam {
          id
          name
          logoUrl
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

#### Mutations

```graphql
# Create a new match
mutation CreateMatch(
  $tournamentId: ID!,
  $homeTeamId: ID!,
  $awayTeamId: ID!,
  $matchDate: ISO8601DateTime!,
  $scoreHome: Int,
  $scoreAway: Int
) {
  createMatch(
    input: {
      tournamentId: $tournamentId,
      homeTeamId: $homeTeamId,
      awayTeamId: $awayTeamId,
      matchDate: $matchDate,
      scoreHome: $scoreHome,
      scoreAway: $scoreAway
    }
  ) {
    id
    matchDate
    homeTeam {
      name
    }
    awayTeam {
      name
    }
    scoreHome
    scoreAway
  }
}

# Update match scores
mutation UpdateMatchScore($id: ID!, $scoreHome: Int!, $scoreAway: Int!) {
  updateMatch(
    input: {
      id: $id,
      scoreHome: $scoreHome,
      scoreAway: $scoreAway
    }
  ) {
    id
    scoreHome
    scoreAway
  }
}

# Import data from external API
mutation ImportApiData($leagueId: Int!, $season: String!, $dataType: String!) {
  importApiData(
    input: {
      leagueId: $leagueId,
      season: $season,
      dataType: $dataType
    }
  ) {
    success
    count
    message
  }
}
```

### GraphQL Advantages Demonstrated

1. **Precise Data Fetching**: Clients specify exactly what they need, reducing over-fetching and under-fetching
2. **Single Request**: Retrieving complex related data in one request (e.g., teams with their players and matches)
3. **Type Safety**: The schema enforces data types and validates queries
4. **Self-documenting API**: The schema provides introspection for client tooling
5. **Real-time Updates**: Future potential for subscriptions for live match updates
6. **Backend Evolution**: Add new fields without breaking existing queries

### Apollo Client Integration

The frontend uses Apollo Client to communicate with the GraphQL API:

```javascript
// Apollo Client Setup
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        teamsConnection: {
          // Merge function for paginated results
          keyArgs: ["country", "nameContains"],
          merge(existing = { edges: [] }, incoming) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache,
});

// Using the client in a React component
function TeamDetails() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(TEAM_DETAILS_QUERY, {
    variables: { teamId: id },
  });
  
  // Component logic using the fetched data
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
<img width="1149" alt="image" src="https://github.com/user-attachments/assets/a6e73dff-0c99-4a26-855e-dcb8b936797e" />


### Tournament Standings
<img width="1150" alt="image" src="https://github.com/user-attachments/assets/50bbca1d-9e87-4d4b-9746-33ac4160c5ca" />


### Team Details
<img width="1150" alt="image" src="https://github.com/user-attachments/assets/758acc5a-d00b-480c-9e10-3a0aaf6df2dd" />

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