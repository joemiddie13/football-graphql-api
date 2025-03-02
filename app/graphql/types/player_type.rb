module Types
  class PlayerType < Types::BaseObject
    description "A football player"

    field :id, ID, null: false,
      description: "The unique identifier for the player"

    field :name, String, null: false,
      description: "The player's full name"

    field :position, String, null: false,
      description: "The player's position on the field"

    field :nationality, String, null: true,
      description: "The player's nationality"

    field :age, Integer, null: true,
      description: "The player's age"

    field :jersey_number, Integer, null: true,
      description: "The player's jersey number"

    field :goals, Integer, null: true,
      description: "Goals scored in the current season"

    field :assists, Integer, null: true,
      description: "Assists made in the current season"

    field :appearances, Integer, null: true,
      description: "Number of appearances in the current season"

    field :team, Types::TeamType, null: false,
      description: "The team this player belongs to"
  end
end
