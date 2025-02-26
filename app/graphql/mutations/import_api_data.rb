module Mutations
  class ImportApiData < Mutations::BaseMutation
    argument :league_id, Integer, required: true,
      description: "League ID in API-FOOTBALL (e.g., 2 for Champions League)"
    argument :season, String, required: true,
      description: "Season year (e.g., '2023')"
    argument :data_type, String, required: true,
      description: "Type of data to import ('teams' or 'matches')"

    field :success, Boolean, null: false
    field :count, Integer, null: true
    field :message, String, null: false

    def resolve(league_id:, season:, data_type:)
      importer = ApiFootball::DataImporter.new

      case data_type.downcase
      when 'teams'
        result = importer.import_teams(league_id, season)
      when 'matches'
        result = importer.import_matches(league_id, season)
      else
        return {
          success: false,
          count: 0,
          message: "Invalid data_type. Use 'teams' or 'matches'"
        }
      end

      if result[:success]
        {
          success: true,
          count: result[:count],
          message: "Successfully imported #{result[:count]} #{data_type}"
        }
      else
        {
          success: false,
          count: 0,
          message: "Import failed: #{result[:error]}"
        }
      end
    end
  end
end
