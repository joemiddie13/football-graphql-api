module Mutations
  class DeleteTeam < BaseMutation
    argument :id, ID, required: true

    field :id, ID, null: true
    field :success, Boolean, null: false

    def resolve(id:)
      team = Team.find(id)
      team.destroy
      {
        id: id,
        success: true
      }
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Team not found")
    rescue => e
      GraphQL::ExecutionError.new("Failed to delete: #{e.message}")
    end
  end
end
