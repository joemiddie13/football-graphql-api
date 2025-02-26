# config/initializers/assets.rb

# Version of your assets, change this if you want to expire all your assets
Rails.application.config.assets.version = '1.0'

# Add GraphiQL assets to the precompilation list
# This ensures Rails knows to include these files when serving the application
Rails.application.config.assets.precompile += %w( graphiql/rails/application.js graphiql/rails/application.css )
