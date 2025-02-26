class Tournament < ApplicationRecord
  has_many :matches, dependent: :destroy

  validates :name, presence: true
  validates :season, presence: true

  def teams
    team_ids = matches.pluck(:home_team_id, :away_team_id).flatten.uniq
    Team.where(id: team_ids)
  end
end
