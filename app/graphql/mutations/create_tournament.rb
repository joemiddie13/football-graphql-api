module Mutations
  class CreateTournament < BaseMutation
    argument :name, String, required: true
    argument :season, String, required: true

    type Types::TournamentType

    def resolve(name:, season:)
      Tournament.create!(
        name: name,
        season: season
      )
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
