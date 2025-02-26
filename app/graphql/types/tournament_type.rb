module Types
  class TournamentType < Types::BaseObject
    description "A football tournament (Champions League)"

    field :id, ID, null: false,
      description: "The unique identifier for the tournament"

    field :name, String, null: false,
      description: "The name of the tournament (e.g., 'UEFA Champions League')"

    field :season, String, null: false,
      description: "The season of the tournament (e.g., '2024-2025')"

    field :matches, [Types::MatchType], null: false,
      description: "All matches in this tournament"

    field :teams, [Types::TeamType], null: false,
      description: "All teams participating in this tournament"
  end
end
