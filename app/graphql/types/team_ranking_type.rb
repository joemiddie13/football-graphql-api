module Types
  class TeamRankingType < Types::BaseObject
    description "Represents a team's ranking in a tournament"

    field :team, TeamType, null: false, description: "The team"
    field :points, Integer, null: false, description: "Total points"
    field :wins, Integer, null: false, description: "Number of wins"
    field :draws, Integer, null: false, description: "Number of draws"
    field :losses, Integer, null: false, description: "Number of losses"
    field :matches_played, Integer, null: false, description: "Total matches played"
    field :goals_for, Integer, null: false, description: "Goals scored"
    field :goals_against, Integer, null: false, description: "Goals conceded"
    field :goal_difference, Integer, null: false, description: "Goal difference"
  end
end
