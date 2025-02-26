module Mutations
  class UpdateTournament < BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :season, String, required: false

    type Types::TournamentType

    def resolve(id:, **attributes)
      tournament = Tournament.find(id)
      tournament.update!(attributes)
      tournament
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Tournament not found")
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
