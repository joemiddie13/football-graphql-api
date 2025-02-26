module Mutations
  class CreateTeam < BaseMutation
    argument :name, String, required: true
    argument :country, String, required: true
    argument :logo_url, String, required: false
    argument :founded, Integer, required: false

    type Types::TeamType

    def resolve(name:, country:, logo_url: nil, founded: nil)
      Team.create!(
        name: name,
        country: country,
        logo_url: logo_url,
        founded: founded
      )
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
