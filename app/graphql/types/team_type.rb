module Types
  class TeamType < Types::BaseObject
    description "A team participating in the Champions League"

    field :id, ID, null: false,
      description: "The unique identifier for the team"

    field :name, String, null: false,
      description: "The team's official name"

    field :country, String, null: false,
      description: "The country this team represents"

    field :logo_url, String, null: true,
      description: "URL to the team's logo"

    field :founded, Integer, null: true,
      description: "The year the team was founded"
  end
end
