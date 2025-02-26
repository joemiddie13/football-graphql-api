# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_team, mutation: Mutations::CreateTeam,
      description: "Create a new team"

    field :create_tournament, mutation: Mutations::CreateTournament,
      description: "Create a new tournament"

    field :create_match, mutation: Mutations::CreateMatch,
      description: "Create a new match"
  end
end
