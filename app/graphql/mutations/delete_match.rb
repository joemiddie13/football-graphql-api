module Mutations
  class DeleteMatch < BaseMutation
    argument :id, ID, required: true

    field :id, ID, null: true
    field :success, Boolean, null: false

    def resolve(id:)
      match = Match.find(id)
      match.destroy
      {
        id: id,
        success: true
      }
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Match not found")
    rescue => e
      GraphQL::ExecutionError.new("Failed to delete: #{e.message}")
    end
  end
end
