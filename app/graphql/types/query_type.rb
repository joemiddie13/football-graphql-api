require_relative 'team_ranking_type'

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

    # Paginated tournaments
    field :tournaments_connection, TournamentType.connection_type, null: false do
      description "Paginated list of tournaments"
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

    # Paginated teams
    field :teams_connection, TeamType.connection_type, null: false do
      description "Paginated list of teams"
      argument :country, String, required: false,
        description: "Optional country filter"
      argument :name_contains, String, required: false,
        description: "Filter teams by name containing this string"
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

    # Paginated matches
    field :matches_connection, MatchType.connection_type, null: false do
      description "Paginated list of matches"
      argument :tournament_id, ID, required: false,
        description: "Optional tournament ID filter"
      argument :team_id, ID, required: false,
        description: "Optional team ID filter (matches home or away)"
      argument :from_date, GraphQL::Types::ISO8601DateTime, required: false,
        description: "Optional start date filter"
      argument :to_date, GraphQL::Types::ISO8601DateTime, required: false,
        description: "Optional end date filter"
    end

    # Team Rankings Query
    field :team_rankings, [TeamRankingType], null: false do
      description "Get team rankings for a specific tournament"
      argument :tournament_id, ID, required: true,
        description: "ID of the tournament to get rankings for"
    end

    # Player Queries
    field :player, PlayerType, null: true do
      description "Find a specific player by ID"
      argument :id, ID, required: true
    end

    field :players, [PlayerType], null: false do
      description "Fetch players, optionally filtered by team"
      argument :team_id, ID, required: false
    end

    # Resolver Methods
    def player(id:)
      Player.find_by(id: id)
    end

    def players(team_id: nil)
      team_id ? Player.where(team_id: team_id) : Player.all
    end

    def tournament(id:)
      Tournament.find_by(id: id)
    end

    def tournaments(season: nil)
      return Tournament.all unless season
      Tournament.where(season: season)
    end

    def tournaments_connection(season: nil)
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

    def teams_connection(country: nil, name_contains: nil)
      scope = Team.all
      scope = scope.where(country: country) if country

      if name_contains.present?
        scope = scope.where("name ILIKE ?", "%#{name_contains}%")
      end

      scope
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

    def matches_connection(tournament_id: nil, team_id: nil, from_date: nil, to_date: nil)
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

        # Calculate stats
        points = 0
        wins = 0
        draws = 0
        losses = 0
        goals_for = 0
        goals_against = 0

        team_matches.each do |match|
          # Skip matches without scores
          next unless match.score_home.present? && match.score_away.present?

          if match.home_team_id == team.id
            # Team is home team
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
            # Team is away team
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
  end
end
