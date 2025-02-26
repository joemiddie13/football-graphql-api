class Match < ApplicationRecord
  belongs_to :tournament
  belongs_to :home_team, class_name: 'Team'
  belongs_to :away_team, class_name: 'Team'

  validates :match_date, presence: true
  validates :home_team_id, presence: true
  validates :away_team_id, presence: true

  validate :teams_must_be_different

  private

  def teams_must_be_different
    if home_team_id == away_team_id
      errors.add(:base, "Home team and away team must be different")
    end
  end
end
