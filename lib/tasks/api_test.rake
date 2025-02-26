namespace :api do
  desc "Test API-FOOTBALL connection"
  task :test => :environment do
    client = ApiFootball::Client.new

    begin
      puts "API key from credentials: #{Rails.application.credentials.dig(:api_football, :api_key) ? 'Found (first few chars: ' + Rails.application.credentials.dig(:api_football, :api_key)[0..3] + '...)' : 'Not found'}"

      result = client.get_status
      puts "API connection test result: #{result[:success]}"
      puts "Response data: #{result[:data]}" if result[:success]
      puts "Error: #{result[:error]}" unless result[:success]
    rescue StandardError => e
      puts "Test failed with error: #{e.message}"
    end
  end
end
