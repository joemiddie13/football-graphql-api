module Mutations
  class UpdateTeam < BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :country, String, required: false
    argument :logo_url, String, required: false
    argument :founded, Integer, required: false

    type Types::TeamType

    def resolve(id:, **attributes)
      team = Team.find(id)
      team.update!(attributes)
      team
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Team not found")
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
