module Mutations
  class DeleteTournament < BaseMutation
    argument :id, ID, required: true

    field :id, ID, null: true
    field :success, Boolean, null: false

    def resolve(id:)
      tournament = Tournament.find(id)
      tournament.destroy
      {
        id: id,
        success: true
      }
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Tournament not found")
    rescue => e
      GraphQL::ExecutionError.new("Failed to delete: #{e.message}")
    end
  end
end
