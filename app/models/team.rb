class Team < ApplicationRecord
  has_many :home_matches, class_name: 'Match', foreign_key: 'home_team_id'
  has_many :away_matches, class_name: 'Match', foreign_key: 'away_team_id'
  has_many :players, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :country, presence: true

  def matches
    Match.where('home_team_id = ? OR away_team_id = ?', id, id)
  end
end
