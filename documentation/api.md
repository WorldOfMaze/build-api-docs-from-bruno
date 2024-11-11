
# Get Session Token

This endpoint is not documented.

# Get all issue statuses

This endpoint is not documented.

  # Create Project Application
  Creates a new project application.
  
  ## Request
  
  | | |
  |---|---|
  | URL | `https://localhost:3000/api/project-applications/` |
  |  Method | `POST` |
  | Authentication | This endpoint requires the user to be authenticated. |
  
  ### Headers
  | Key | Value |
  | --- | --- |
  | `Content-Type` | `application/json` |
  
  ### Path Parameters
  This endpoint does not utilize any path parameters. 
  
   ### Request Body
  | Key | Data Type | Required | Default Value | Description |
  | --- | --- | --- | --- | --- |
  | `name` | string | Required || The name of the application.
  | `closed` | boolean  | Optional | `false` | A flag indicating if the application is closed. |
  | `color` | string |  Optional | `ABEBC6` | The color to be used for the application. |
  | `projectId` | string | Required | | The ID of the project the application belongs to. |
  
  ## Response
  
  ### Success Response
  
  A **REST Success Response** object with the following properties:
  
  | Key | Description |
  | --- | --- |
  | `success` | `true` |
  | `status` | `200` | 
  | `statusText` | `OK` |
  | `path` | `api/project-applications` |
  | `method | `POST`
  | `query` | The query string |
  | `json` | A copy of the JSON object passed in the request body |
  | `data` | See [Success Response Data Structure](#) below. |
  
  ### Failure Response
  
  A **REST Error Response** object with the following properties:
  
  | Key | Description |
  | --- | --- |
  | `success` | `false` |
  | `status` | A status code representing the category of the error | 
  | `statusText` | A text description of  `status` |
  | `path` | `api/project-applications` |
  | `method | `POST`
  | `query` | The query string |
  | `json` | A copy of the JSON object passed in the request body |
  | `error` | A JSON object providing technical details of the error that occurred | 
  
  ### Success Response Data Structure 
  | Key | Description |
  | --- | --- |
  | `id` | The ID of the newly created project application. |
  | `name` | The name of the application. |
  | `closed`  | A flag indicating if the application is closed. |
  | `color`  | The color to be used for the application. |
  | `projectId`  | The ID of the project the application belongs to. |

# Get all application

This endpoint is not documented.

# Update an application

This endpoint is not documented.

# Create a component

This endpoint is not documented.

# Delete a component

This endpoint is not documented.

# Get all components for an application

This endpoint is not documented.

# Get all components

This endpoint is not documented.

# Update a component

This endpoint is not documented.

# All projects

This endpoint is not documented.

# By project ID

This endpoint is not documented.
