module Mutations
  class UpdateMatch < BaseMutation
    argument :id, ID, required: true
    argument :tournament_id, ID, required: false
    argument :home_team_id, ID, required: false
    argument :away_team_id, ID, required: false
    argument :match_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :score_home, Integer, required: false
    argument :score_away, Integer, required: false

    type Types::MatchType

    def resolve(id:, **attributes)
      match = Match.find(id)
      match.update!(attributes)
      match
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Match not found")
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
