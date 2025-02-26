require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
# require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
# require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
# require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FootballGraphqlApi
  class Application < Rails::Application
    # GraphQL query logging configuration
    config.active_record.query_log_tags_enabled = true
    config.active_record.query_log_tags = [
      # Rails query log tags:
      :application, :controller, :action, :job,
      # GraphQL-Ruby query log tags:
      current_graphql_operation: -> { GraphQL::Current.operation_name },
      current_graphql_field: -> { GraphQL::Current.field&.path },
      current_dataloader_source: -> { GraphQL::Current.dataloader_source_class },
    ]

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Configure autoloading
    config.autoload_lib(ignore: %w[assets tasks])

    # Disable API only mode to allow asset pipeline and session handling
    config.api_only = false

    # Enable and configure the asset pipeline
    config.assets.enabled = true
    config.assets.paths << Rails.root.join("app/assets/javascripts")
    config.assets.paths << Rails.root.join("app/assets/stylesheets")

    # Configure session handling for GraphiQL
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
  end
end
