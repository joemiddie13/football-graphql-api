Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'  # In development, allow all origins for simplicity
    # For production, you should restrict this to your frontend domain

    resource '/graphql',
      headers: :any,
      methods: [:post, :options, :get],  # Add GET if you're using GraphiQL
      credentials: false
  end
end
