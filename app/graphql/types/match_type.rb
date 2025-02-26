module Types
  class MatchType < Types::BaseObject
    description "A match in the Champions League"

    field :id, ID, null: false,
      description: "The unique identifier for the match"

    field :home_team, TeamType, null: false,
      description: "The home team in this match"

    field :away_team, TeamType, null: false,
      description: "The away team in this match"

    field :match_date, GraphQL::Types::ISO8601DateTime, null: false,
      description: "When the match is scheduled to be played"

    field :score_home, Integer, null: true,
      description: "Goals scored by the home team"

    field :score_away, Integer, null: true,
      description: "Goals scored by the away team"
  end
end
