module Mutations
  class CreateMatch < BaseMutation
    argument :tournament_id, ID, required: true
    argument :home_team_id, ID, required: true
    argument :away_team_id, ID, required: true
    argument :match_date, GraphQL::Types::ISO8601DateTime, required: true
    argument :score_home, Integer, required: false
    argument :score_away, Integer, required: false

    type Types::MatchType

    def resolve(tournament_id:, home_team_id:, away_team_id:, match_date:, score_home: nil, score_away: nil)
      Match.create!(
        tournament_id: tournament_id,
        home_team_id: home_team_id,
        away_team_id: away_team_id,
        match_date: match_date,
        score_home: score_home,
        score_away: score_away
      )
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
