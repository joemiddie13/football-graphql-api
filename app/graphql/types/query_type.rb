module Types
  class QueryType < Types::BaseObject
    description "The query root for the Champions League API schema"

    # Tournament Queries
    field :tournament, TournamentType, null: true do
      description "Find a specific tournament by ID"
      argument :id, ID, required: true,
        description: "ID of the tournament to fetch"
    end

    field :tournaments, [TournamentType], null: false do
      description "Fetch all tournaments, optionally filtered by season"
      argument :season, String, required: false,
        description: "Optional season filter (e.g., '2024-2025')"
    end

    # Team Queries
    field :team, TeamType, null: true do
      description "Find a specific team by ID"
      argument :id, ID, required: true,
        description: "ID of the team to fetch"
    end

    field :teams, [TeamType], null: false do
      description "Fetch all teams, optionally filtered by country"
      argument :country, String, required: false,
        description: "Optional country filter"
    end

    # Match Queries
    field :match, MatchType, null: true do
      description "Find a specific match by ID"
      argument :id, ID, required: true,
        description: "ID of the match to fetch"
    end

    field :matches, [MatchType], null: false do
      description "Fetch all matches with optional filters"
      argument :tournament_id, ID, required: false,
        description: "Optional tournament ID filter"
      argument :team_id, ID, required: false,
        description: "Optional team ID filter (matches home or away)"
      argument :from_date, GraphQL::Types::ISO8601DateTime, required: false,
        description: "Optional start date filter"
      argument :to_date, GraphQL::Types::ISO8601DateTime, required: false,
        description: "Optional end date filter"
    end

    # Resolver Methods
    def tournament(id:)
      Tournament.find_by(id: id)
    end

    def tournaments(season: nil)
      return Tournament.all unless season
      Tournament.where(season: season)
    end

    def team(id:)
      Team.find_by(id: id)
    end

    def teams(country: nil)
      return Team.all unless country
      Team.where(country: country)
    end

    def match(id:)
      Match.find_by(id: id)
    end

    def matches(tournament_id: nil, team_id: nil, from_date: nil, to_date: nil)
      matches = Match.all

      matches = matches.where(tournament_id: tournament_id) if tournament_id

      if team_id
        matches = matches.where(
          "home_team_id = :team_id OR away_team_id = :team_id",
          team_id: team_id
        )
      end

      matches = matches.where("match_date >= ?", from_date) if from_date
      matches = matches.where("match_date <= ?", to_date) if to_date

      matches.order(match_date: :asc)
    end
  end
end
