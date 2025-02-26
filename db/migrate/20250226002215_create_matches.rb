class CreateMatches < ActiveRecord::Migration[8.0]
  def change
    create_table :matches do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :home_team, null: false, foreign_key: { to_table: :teams }
      t.references :away_team, null: false, foreign_key: { to_table: :teams }
      t.datetime :match_date
      t.integer :score_home
      t.integer :score_away

      t.timestamps
    end
  end
end
