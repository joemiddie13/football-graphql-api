# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    # Create mutations
    field :create_team, mutation: Mutations::CreateTeam,
      description: "Create a new team"
    field :create_tournament, mutation: Mutations::CreateTournament,
      description: "Create a new tournament"
    field :create_match, mutation: Mutations::CreateMatch,
      description: "Create a new match"

    # Update mutations
    field :update_team, mutation: Mutations::UpdateTeam,
      description: "Update an existing team"
    field :update_tournament, mutation: Mutations::UpdateTournament,
      description: "Update an existing tournament"
    field :update_match, mutation: Mutations::UpdateMatch,
      description: "Update an existing match"

    # Delete mutations
    field :delete_team, mutation: Mutations::DeleteTeam,
      description: "Delete a team"
    field :delete_tournament, mutation: Mutations::DeleteTournament,
      description: "Delete a tournament"
    field :delete_match, mutation: Mutations::DeleteMatch,
      description: "Delete a match"
  end
end
